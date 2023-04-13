import os
import time
from rwo_py_sdk import ApiClient as RWOApiClient
from rwo_py_sdk.configuration import Configuration as RWOConfiguration
from rwo_py_sdk.apis import NotificationApi

CHUNK_SIZE = 50
API_URL = os.getenv("RWO_API_SERVER", "http://rwoapi:5000")
RWO_CHECK_API = os.getenv("RWO_CHECK_API", "")
if RWO_CHECK_API.lower() in ("yes", "true"):
    api = NotificationApi(RWOApiClient(configuration=RWOConfiguration(host=API_URL)))
    while True:
        try:
            api.get_notifications_pending(
                subscriber="admin", channel="email", chunk_size=CHUNK_SIZE
            )
            break
        except:
            print("Waiting for RWO API...")
            time.sleep(3.0)
    print("RWO API Ready")
