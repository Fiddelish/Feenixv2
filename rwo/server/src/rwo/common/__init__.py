from typing import Union


def require(condition: bool, error: Union[str, Exception]):
    if condition:
        return
    else:
        if isinstance(error, Exception):
            raise error
        else:
            raise Exception(error)


from logging import CRITICAL, FATAL, ERROR, WARN, WARNING, INFO, DEBUG, NOTSET

__all__ = ["CRITICAL", "FATAL", "ERROR", "WARN", "WARNING", "INFO", "DEBUG", "NOTSET"]
