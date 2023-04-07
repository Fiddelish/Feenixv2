import asyncio
import aiosmtplib
from aiosmtplib import errors as SMTPErrors
from email.mime.text import MIMEText

import json
import os
import aioredis
from rwo.common import logging as rwo_logging
from datetime import datetime

from rwo_py_sdk import ApiClient as RWOApiClient
from rwo_py_sdk.configuration import Configuration as RWOConfiguration
from rwo_py_sdk.apis import NotificationApi
from rwo_py_sdk.models import UpdateNDSRequest

API_SERVER = os.getenv("RWO_API_SERVER", "http://localhost:5000")
REDIS_URL = os.getenv("RWO_REDIS_URL")
SMTP_HOST = os.getenv("RWO_SMTP_HOST", "localhost")
SMTP_PORT = os.getenv("RWO_SMTP_PORT", "25")
QUEUE_GUARD_TIMEOUT = 60 * 30
EMAIL_RETRY_TIME = 60 * 5
CHUNK_SIZE = 50

api = NotificationApi(RWOApiClient(configuration=RWOConfiguration(host=API_SERVER)))
logger = rwo_logging.init_logger("notifier.log", rwo_logging.DEBUG, "notifier")


def dt2iso(o):
    if isinstance(o, datetime):
        return o.isoformat()


def mask_email(e):
    # TODO mask unless in dev mode
    return e


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
            # await smtp_client.starttls()
            # await smtp_client.login()
            for _ in notifications:
                successful: bool = None

                message = MIMEText(json.dumps(_.to_dict(), indent=2, default=dt2iso))
                message["From"] = "notify-DAEMON <>"
                message["To"] = _.order_email
                message["Subject"] = f"RWO {subscriber.capitalize()} notification"

                try:
                    logger.debug(f"sendmail rcpt to {mask_email(_.order_email)}")
                    id, response = await smtp_client.sendmail(
                        "", _.order_email, message.as_bytes()
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
                    api.update_delivery_status(
                        _.id, UpdateNDSRequest(response, successful=successful)
                    )
            logger.debug(f"closing SMTP")
            await smtp_client.quit()
            if len(notifications) < CHUNK_SIZE:
                logger.debug(f"end of chunk")
                break

        return

    global logger
    global redis_pool

    if REDIS_URL is None:
        logger.info(f"one-shot mode")
        try:
            await process_pending_items(subscriber)
        except Exception as e:
            logger.error(f"error processing: {e}")
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
