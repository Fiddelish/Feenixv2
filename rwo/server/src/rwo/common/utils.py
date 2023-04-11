from typing import Any
import sys
import uuid
import traceback
import os
from datetime import datetime, timezone


def exception_stack_trace(depth=8):
    exc_type, exc_value, exc_traceback = sys.exc_info()
    err_msg = "\n".join(
        traceback.format_exception(exc_type, exc_value, exc_traceback, limit=depth)
    )
    return err_msg


def get_utcnow() -> datetime:
    utcnow = datetime.now().astimezone(timezone.utc)
    return utcnow


def to_bn(v: int, decimals: int = 18) -> int:
    return v * (10**decimals)


def uuid4str() -> str:
    return str(uuid.uuid4()).replace("-", "")


def datetime_to_iso(o) -> str:
    if isinstance(o, datetime):
        return o.isoformat()
    else:
        return o


def env_to_bool(env_var, default=False):
    """
    Converts the value of an environment variable to a boolean value.

    If the environment variable is not set, returns the default value.

    If the environment variable is set, returns True if its value is "true"
    or "yes" (case-insensitive), and False if its value is "false" or "no"
    (case-insensitive).
    """

    val = os.environ.get(env_var, "").lower()

    if val == "":
        return default
    elif val in ["true", "yes"]:
        return True
    elif val in ["false", "no"]:
        return False
    else:
        raise ValueError(f"Invalid value for environment variable {env_var}: {val}")


def mask_email(email: str) -> str:
    username, domain = email.split("@")
    masked_username = username[0] + "*" * (len(username) - 2) + username[-1]
    return masked_username + "@" + domain
