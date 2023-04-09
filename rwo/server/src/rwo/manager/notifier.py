import json
import os
import aioredis
import asyncio
import aiosmtplib
import traceback
from aiosmtplib import errors as SMTPErrors

from email.mime.text import MIMEText
from jinja2 import Environment, BaseLoader
import textwrap

from rwo.common import logging as rwo_logging
from rwo.common.utils import datetime_to_iso, mask_email, env_to_bool

from rwo_py_sdk import ApiClient as RWOApiClient
from rwo_py_sdk.configuration import Configuration as RWOConfiguration
from rwo_py_sdk.apis import NotificationApi
from rwo_py_sdk.models import UpdateNDSRequest

DEVMODE = env_to_bool("RWO_DEVMODE")
API_URL = os.getenv("RWO_API_URL", "http://localhost:5000")
REDIS_URL = os.getenv("RWO_REDIS_URL")
SMTP_HOST = os.getenv("RWO_SMTP_HOST", "localhost")
SMTP_PORT = os.getenv("RWO_SMTP_PORT", "25")
SMTP_SENDER = os.getenv("RWO_SMTP_SEMDER", "")
SMTP_STARTTLS = env_to_bool("RWO_SMTP_STARTTLS")
SMTP_USER = os.getenv("RWO_SMTP_USER")
SMTP_PASSWORD = os.getenv("RWO_SMTP_PASSWORD")

QUEUE_GUARD_TIMEOUT = 60 * 30
EMAIL_RETRY_TIME = 60 * 5
CHUNK_SIZE = 50

jinja2_email_tmpl = {
    "user": {
        "subject": "RWO Order Status: {{status}}",
        "body": textwrap.dedent(
            """
            Dear User,

            Your order {{id}} status is {{ status }}
            Created (UTC): {{ created_at }}
            Transaction ID: {{tx_id}}

            kind regards
            """
        ),
    },
    "admin": {
        "subject": "RWO ADMIN order {{id}} status {{status}}",
        "body": textwrap.dedent(
            """
            Dear Admin,

            Order id: {{ id }}
            Order status: {{ status }}
            Created (UTC): {{ created_at }}
            Updated (UTC): {{ updated_at }}

            User email: {{email}}
            User wallet: {{wallet}}
            Product ID: {{product_id}}
            Quantity: {{quantity}}
            Transaction ID: {{tx_id}}
            Transaction hash: {{tx_hash}}

            Admin Token: {{token}}

            kind regards
            """
        ),
    },
}

api = NotificationApi(RWOApiClient(configuration=RWOConfiguration(host=API_URL)))
logger = rwo_logging.init_logger(
    "notifier.log", rwo_logging.DEBUG if DEVMODE else rwo_logging.INFO, "notifier"
)
redis_pool = None


async def email_notify_thread(subscriber: str):
    async def process_pending_items(subscriber: str):
        global api
        global logger

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
                logger.error(f"API endpoint unreachable: {e}")
                break

            if len(notifications) == 0:
                logger.debug(f"nothing to do")
                break

            logger.debug(
                f"{len(notifications)} notifications from chunk of {CHUNK_SIZE}"
            )
            logger.debug(f"trying SMTP {SMTP_HOST}:{SMTP_PORT}")
            smtp_client = aiosmtplib.SMTP(hostname=SMTP_HOST, port=SMTP_PORT)
            await smtp_client.connect()
            if SMTP_STARTTLS:
                logger.debug(f"SMTP STARTTLS enforced")
                await smtp_client.starttls()
            if SMTP_USER:
                logger.debug(f"SMTP authentication enabled with {SMTP_USER}")
                await smtp_client.login(SMTP_USER, SMTP_PASSWORD)
            for _ in notifications:
                successful: bool = None

                # logger.debug(f"data[id]={_.data['id']}")
                # message = MIMEText(
                #     json.dumps(_.data, indent=2, default=datetime_to_iso)
                # )
                message = MIMEText(
                    Environment(loader=BaseLoader())
                    .from_string(jinja2_email_tmpl[subscriber]["body"])
                    .render(_.data)
                )
                message["From"] = "notify-DAEMON <>"
                message["To"] = _.recipient
                message["Subject"] = (
                    Environment(loader=BaseLoader())
                    .from_string(jinja2_email_tmpl[subscriber]["subject"])
                    .render(_.data)
                )

                try:
                    logger.info(f"sendmail to {mask_email(_.recipient)}")
                    id, response = await smtp_client.sendmail(
                        SMTP_SENDER, _.recipient, message.as_bytes()
                    )
                    logger.debug(f"successful sendmail id={id}, response={response}")
                    successful = True
                except (
                    SMTPErrors.SMTPRecipientRefused,
                    SMTPErrors.SMTPRecipientsRefused,
                    SMTPErrors.SMTPDataError,
                ) as e:
                    logger.error(f"permanent sendmail error: {e}")
                    successful = False
                    response = str(e)
                except Exception as e:
                    logger.warn(f"temporary sendmail error: {e}")
                    successful = None
                    response = str(e)
                    raise e
                finally:
                    logger.debug(
                        f"notification id={_.id} delivery status success={successful}, report: {response}"
                    )
                    cursor = _.id
                    api.delivery_status(
                        _.id,
                        UpdateNDSRequest(
                            delivery_report=response, successful=successful
                        ),
                    )
            logger.debug(f"closing SMTP")
            await smtp_client.quit()
            if len(notifications) < CHUNK_SIZE:
                logger.debug(f"end of chunk")
                break

        return

    global logger
    global redis_pool

    if redis_pool is None:
        logger.info(f"no redis, one-shot mode")
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
            await redis.ping()
            logger.debug(f"waiting {queue} for max {QUEUE_GUARD_TIMEOUT}s")
            item = await redis.brpop(queue, QUEUE_GUARD_TIMEOUT)
            if not item is None and await redis.llen(queue) > 0:
                await redis.ltrim(queue, 1, 0)
            logger.debug(f"woke up by {queue}")
        except Exception as e:
            logger.error(f"redis failed: {e}")
            logger.warning(f"polling mode with timeout={QUEUE_GUARD_TIMEOUT}s")
            asyncio.sleep(QUEUE_GUARD_TIMEOUT)

        try:
            await process_pending_items(subscriber)
        except Exception as e:
            logger.debug(f"error: {e}, sleeping for {EMAIL_RETRY_TIME}s before retry")
            await asyncio.sleep(EMAIL_RETRY_TIME)
            await redis.lpush(queue, "retry")


async def main():
    global logger
    global redis_pool

    if DEVMODE:
        logger.warn(f"running in DEVMODE")

    if not REDIS_URL is None:
        logger.debug(f"using {REDIS_URL}")
        redis_pool = aioredis.ConnectionPool.from_url(REDIS_URL, decode_responses=True)

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
