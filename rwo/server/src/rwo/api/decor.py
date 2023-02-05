from fastapi import HTTPException
from functools import wraps
from ..common.utils import exception_stack_trace

def rollback_error500():
    def decor(f):
        @wraps(f)
        def handle_exception(*args, **kwargs):
            try:
                return f(*args, **kwargs)
            except Exception as e:
                db = kwargs.get("db")
                db.rollback()
                raise HTTPException(
                    status_code=500, detail=exception_stack_trace()
                )
        return handle_exception
    return decor
