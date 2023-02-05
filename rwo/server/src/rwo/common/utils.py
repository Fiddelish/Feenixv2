from typing import Any
import sys
import uuid
import traceback
import importlib
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

def to_bn(v: int, decimals: int=18) -> int:
    return v * (10 ** decimals)

def uuid4str() -> str:
    return str(uuid.uuid4()).replace("-", "")
