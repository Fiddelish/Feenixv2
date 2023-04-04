import asyncio
import aiosmtplib
import json
from datetime import datetime

from rwo_py_sdk import ApiClient as RWOApiClient
from rwo_py_sdk.configuration import Configuration as RWOConfiguration
from rwo_py_sdk.apis import NotificationApi
from rwo_py_sdk.models import UpdateNDSRequest


api = NotificationApi(
    RWOApiClient(configuration=RWOConfiguration(host="http://localhost:5000"))
)


def dt2iso(o):
    if isinstance(o, datetime):
        return o.isoformat()


async def email_notify(subscriber: str):
    global api
    while True:
        items = api.get_notifications_pending(
            subscriber=subscriber,
            channel="email",
        )
        if len(items) > 0:
            smtp_client = aiosmtplib.SMTP(hostname="localhost", port=2525)
            await smtp_client.connect()
            # await smtp_client.starttls()
            # await smtp_client.login()
            for _ in items:
                message = json.dumps(_.to_dict(), indent=2, default=dt2iso)
                successful: bool = None
                try:
                    id, response = await smtp_client.sendmail(
                        "", _.order_email, message
                    )
                    successful = True
                except Exception as e:
                    print(e)
                    successful = False
                    response = e.__str__()
                finally:
                    pass
                    # api.update_delivery_status(
                    #     _.id,
                    #     UpdateNDSRequest(
                    #         successful=successful,
                    #         report=response,
                    #     ),
                    # )

            await smtp_client.quit()
        await asyncio.sleep(5)


async def notify_user():
    while True:
        await asyncio.sleep(1)


async def main():
    tasks = [
        asyncio.create_task(email_notify("admin")),
        asyncio.create_task(email_notify("user")),
    ]
    try:
        await asyncio.gather(*tasks)
    except KeyboardInterrupt:
        print("Keyboard interrupt")
        for _ in tasks:
            _.cancel()


asyncio.run(main())
