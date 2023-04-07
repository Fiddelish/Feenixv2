import asyncio
from asyncio.tasks import Task
import aiosmtplib
from aiosmtplib import errors as SMTPErrors
import json
import os
import sys
import aioredis
from rwo.common import logging as rwo_logging
from datetime import datetime

from rwo_py_sdk import ApiClient as RWOApiClient
from rwo_py_sdk.configuration import Configuration as RWOConfiguration
from rwo_py_sdk.apis import NotificationApi
from rwo_py_sdk.models import UpdateNDSRequest

API_SERVER = os.getenv("RWO_API_SERVER", "http://localhost:5000")
REDIS_SERVER = os.getenv("RWO_REDIS_SERVER", "localhost:6379")
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
                message = json.dumps(_.to_dict(), indent=2, default=dt2iso)
                successful: bool = None
                try:
                    logger.debug(f"sendmail rcpt to {mask_email(_.order_email)}")
                    id, response = await smtp_client.sendmail(
                        "", _.order_email, message
                    )
                    logger.debug(f"successful sendmail id={id}, response={response}")
                    successful = True
                except (
                    SMTPErrors.SMTPRecipientRefused,
                    SMTPErrors.SMTPRecipientsRefused,
                    SMTPErrors.SMTPDataError,
                ) as e:
                    logger.error(f"permanent sendmail error {e}")
                    successful = False
                    response = str(e)
                except Exception as e:
                    logger.warn(f"temporary sendmail error {e}")
                    successful = None
                    response = str(e)
                    raise e
                finally:
                    logger.debug(
                        f"Notification id={_.id} delivery status success={successful}, report: {response}"
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

    queue = f"rwo:notify:email:{subscriber}"
    logger.debug(f"subscriber {subscriber}")

    redis_pool = aioredis.ConnectionPool.from_url(
        f"redis://{REDIS_SERVER}", decode_responses=True
    )
    logger.debug(f"trying redis {REDIS_SERVER}")
    redis = await aioredis.Redis(
        connection_pool=redis_pool, encoding="utf-8", decode_responses=True
    )
    try:
        await redis.ping()
    except Exception as e:
        logger.error(f"redis unreachable, running in single batch mode: {e}")
        try:
            await process_pending_items(subscriber)
        except Exception as e:
            logger.error(f"error processing: {e}")
        return

    while True:
        logger.debug(f"waiting {queue} for max {QUEUE_GUARD_TIMEOUT}s")
        item = await redis.brpop(queue, QUEUE_GUARD_TIMEOUT)
        if not item is None and await redis.llen(queue) > 0:
            await redis.ltrim(queue, 1, 0)

        try:
            await process_pending_items(subscriber)
        except Exception as e:
            logger.debug(f"caught {e}, sleeping for {EMAIL_RETRY_TIME}s before retry")
            await asyncio.sleep(EMAIL_RETRY_TIME)
            await redis.lpush(queue, "retry")


async def main():
    global logger

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
