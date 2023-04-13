import json
import uuid
import os
import aioredis
import asyncio
import aiosmtplib
import traceback
import socket
from aiosmtplib import errors as SMTPErrors, SMTPResponse
from datetime import datetime

from email.mime.text import MIMEText
from email.utils import make_msgid
from pathlib import Path
from jinja2 import Environment, FileSystemLoader

from rwo.common import logging as rwo_logging
from rwo.common.utils import env_to_bool

from rwo_py_sdk import ApiClient as RWOApiClient
from rwo_py_sdk.configuration import Configuration as RWOConfiguration
from rwo_py_sdk.apis import NotificationApi
from rwo_py_sdk.models import UpdateNDSRequest, Notification

DEVMODE = env_to_bool("RWO_DEVMODE")
API_URL = os.getenv("RWO_API_SERVER", "http://localhost:5000")
REDIS_URL = os.getenv("RWO_REDIS_URL", "redis://redis:6379")
SMTP_SERVER = os.getenv("RWO_SMTP_SERVER", "localhost")
SMTP_PORT = os.getenv("RWO_SMTP_PORT", "25")
SMTP_LOCAL_FQDN = os.getenv("RWO_SMTP_LOCAL_FQDN", socket.getfqdn())
SMTP_SENDER = os.getenv("RWO_SMTP_SENDER")
SMTP_STARTTLS = env_to_bool("RWO_SMTP_STARTTLS")
SMTP_USER = os.getenv("RWO_SMTP_USER")
SMTP_PASSWORD = os.getenv("RWO_SMTP_PASSWORD")

QUEUE_GUARD_TIMEOUT = 60 * 30
EMAIL_RETRY_TIME = 60 * 5
CHUNK_SIZE = 50


def j2_iso_format_datetime(value, format="%H:%M %d-%m-%y"):
    return datetime.fromisoformat(value).strftime(format)


j2_env = Environment()
j2_env.filters["datetime_fmt"] = j2_iso_format_datetime

api = NotificationApi(RWOApiClient(configuration=RWOConfiguration(host=API_URL)))
logger = rwo_logging.init_logger(
    "notifier.log", rwo_logging.DEBUG if DEVMODE else rwo_logging.INFO, "notifier"
)
redis_pool = None


async def email_notify_thread(subscriber: str):
    global logger
    global redis_pool
    global j2_env

    assert len(j2_env.list_templates()) > 0
    for tmpl in j2_env.list_templates():
        logger.debug(f"j2 template: {tmpl}")

    j2_subject_tmpl = j2_env.get_template(f"{subscriber}/subject.j2")
    j2_body_tmpl = j2_env.get_template(f"{subscriber}/body.j2")

    async def process_pending_items(subscriber: str):
        global api
        global logger
        nonlocal j2_subject_tmpl
        nonlocal j2_body_tmpl

        cursor = None
        logger.debug(
            f"trying API endpoint: {api.get_notifications_pending_endpoint.settings['endpoint_path']}"
        )

        while True:
            try:
                notifications = (
                    api.get_notifications_pending(
                        subscriber=subscriber,
                        channel="email",
                        chunk_size=CHUNK_SIZE,
                        cursor=cursor,
                    )
                    if not cursor is None
                    else api.get_notifications_pending(
                        subscriber=subscriber, channel="email", chunk_size=CHUNK_SIZE
                    )
                )
            except Exception as e:
                logger.error(f"API endpoint unreachable")
                raise e

            if len(notifications) == 0:
                logger.debug(f"nothing to do")
                break

            logger.debug(
                f"{len(notifications)} notifications from chunk of {CHUNK_SIZE}"
            )
            logger.debug(f"trying SMTP {SMTP_SERVER}:{SMTP_PORT}")
            smtp_client = aiosmtplib.SMTP(
                hostname=SMTP_SERVER,
                port=SMTP_PORT,
            )
            await smtp_client.connect()
            if SMTP_STARTTLS:
                logger.debug(f"SMTP STARTTLS enforced")
                await smtp_client.starttls()
            if SMTP_USER:
                logger.debug(f"SMTP authentication enabled with {SMTP_USER}")
                await smtp_client.login(SMTP_USER, SMTP_PASSWORD)
            for _ in notifications:
                successful: bool = None
                response: SMTPResponse

                try:
                    # logger.debug(f"data[id]={_.data['id']}")
                    # message = MIMEText(
                    #     json.dumps(_.data, indent=2, default=datetime_to_iso)
                    # )
                    logger.debug(f"SMTP MAIL FROM: <{SMTP_SENDER}>")
                    response = await smtp_client.mail(SMTP_SENDER)
                    logger.debug(f"response: {response.code} {response.message}")
                    logger.debug(f"SMTP RCPT TO: <{_.recipient}>")
                    response = await smtp_client.rcpt(_.recipient)
                    logger.debug(f"response: {response.code} {response.message}")

                    message = MIMEText(j2_body_tmpl.render(_.data))
                    # TODO fix hardcoded from
                    message["From"] = f"RWO Store <{SMTP_SENDER}>"
                    message["To"] = _.recipient
                    message["Subject"] = j2_subject_tmpl.render(_.data)
                    message["Message-ID"] = make_msgid(
                        idstring=str(uuid.uuid4()), domain=SMTP_LOCAL_FQDN
                    )
                    logger.debug(f"SMTP DATA")
                    response = await smtp_client.data(message=message.as_bytes())
                    logger.debug(f"response: {response.code} {response.message}")

                    # logger.info(f"sendmail to {mask_email(_.recipient)}")
                    # id, response = await smtp_client.sendmail(
                    #     SMTP_SENDER, _.recipient, message.as_bytes()
                    # )
                    # logger.debug(f"successful sendmail id={id}, response={response}")
                    successful = True
                except (
                    SMTPErrors.SMTPRecipientRefused,
                    SMTPErrors.SMTPRecipientsRefused,
                    SMTPErrors.SMTPDataError,
                ) as e:
                    logger.error(f"permanent sendmail error: {e}")
                    successful = False
                    response = SMTPResponse(599, str(e))
                except Exception as e:
                    logger.warn(f"temporary sendmail error: {e}")
                    successful = None
                    response = SMTPResponse(499, str(e))
                    raise e
                finally:
                    logger.debug(
                        f"notification id={_.id} delivery status success={successful}, report: {response.code} {response.message}"
                    )
                    cursor = _.id
                    api.delivery_status(
                        _.id,
                        UpdateNDSRequest(
                            delivery_report=f"{response.code} {response.message}",
                            successful=successful,
                        ),
                    )
            logger.debug(f"closing SMTP")
            await smtp_client.quit()
            if len(notifications) < CHUNK_SIZE:
                logger.debug(f"end of chunk")
                break

        return

    ###
    if redis_pool is None:
        logger.warn(f"no redis, one-shot mode")
        try:
            await process_pending_items(subscriber)
        except Exception as e:
            logger.error(f"error processing: {e}\n{traceback.format_exc()}")
        return

    redis = await aioredis.Redis(
        connection_pool=redis_pool, encoding="utf-8", decode_responses=True
    )

    queue = f"rwo:notify:email:{subscriber}"

    while True:
        try:
            await process_pending_items(subscriber)
        except Exception as e:
            logger.error(f"error: {e}, sleeping for {EMAIL_RETRY_TIME}s before retry")
            await asyncio.sleep(EMAIL_RETRY_TIME)
            await redis.lpush(queue, "retry")

        try:
            await redis.ping()
            logger.debug(f"waiting {queue} for max {QUEUE_GUARD_TIMEOUT}s")
            item = await redis.brpop(queue, QUEUE_GUARD_TIMEOUT)
            if not item is None and await redis.llen(queue) > 0:
                await redis.ltrim(queue, 1, 0)
            logger.debug(f"woke up by {queue}")
        except Exception as e:
            logger.error(f"redis failure: {e}")
            logger.error(f"fallback to poll mode, sleeping for {QUEUE_GUARD_TIMEOUT}s")
            asyncio.sleep(QUEUE_GUARD_TIMEOUT)

        try:
            await process_pending_items(subscriber)
        except Exception as e:
            logger.error(f"error: {e}, sleeping for {EMAIL_RETRY_TIME}s before retry")
            await asyncio.sleep(EMAIL_RETRY_TIME)
            await redis.lpush(queue, "retry")


async def main():
    global logger
    global redis_pool
    global j2_env

    if DEVMODE:
        logger.warn(f"running in DEVMODE")

    if SMTP_SENDER is None:
        logger.fatal(f"RWO_SMTP_SENDER env is required")
        return

    if SMTP_LOCAL_FQDN is None:
        logger.fatal(f"RWO_SMTP_LOCAL_FQDN env is required")
        return

    if not REDIS_URL is None:
        logger.debug(f"using {REDIS_URL}")
        redis_pool = aioredis.ConnectionPool.from_url(REDIS_URL, decode_responses=True)

    j2_base = str(Path(__file__).parent / "templates")
    logger.debug(f"loading j2 templates from {j2_base}")
    j2_env.loader = FileSystemLoader(j2_base)

    tasks = [
        asyncio.create_task(email_notify_thread("admin")),
        asyncio.create_task(email_notify_thread("user")),
    ]
    try:
        await asyncio.gather(*tasks)
    except KeyboardInterrupt:
        logger.error("Keyboard interrupt")
        for _ in tasks:
            _.cancel()


def run():
    asyncio.run(main())
