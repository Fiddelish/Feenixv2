import os
import logging
import concurrent_log_handler
from pathlib import Path

RWO_DEBUG = logging.DEBUG
RWO_INFO = logging.INFO
RWO_ERROR = logging.ERROR

RWO_HOME = os.getenv("RWO_HOME", ".")


class RwoMessagesFilter(logging.Filter):
    """

    """
    def __init__(self, logger_name):
        self._logger_name = logger_name

    def filter(self, record):
        """

        :param record:
        :return:
        """
        return record.name == self._logger_name


def init_logger(filename, level, logger_name="logger"):
    """

    :param filename:
    :param level:
    :param logger_name:
    :return:
    """
    logger = logging.getLogger(logger_name)
    if len(logger.handlers):
        return logger
    logger.setLevel(level)
    log_path = Path(RWO_HOME) / "logs"
    if not log_path.exists():
        os.makedirs(log_path, exist_ok=True)
    rh = concurrent_log_handler.ConcurrentRotatingFileHandler(
        log_path / filename,
        maxBytes=10485760,
        backupCount=10,
        use_gzip=True
    )
    rh.setLevel(level)
    rh.setFormatter(logging.Formatter("%(asctime)s %(levelname)-8s %(message)s"))
    logger.addHandler(rh)
    logger.propagate = False

    return logger

def create_handler(filename, level):
    rh = concurrent_log_handler.ConcurrentRotatingFileHandler(
        filename, maxBytes=10485760, backupCount=10, use_gzip=True
    )
    rh.setLevel(level)
    rh.setFormatter(logging.Formatter("%(asctime)s %(levelname)-8s %(message)s"))
    return rh

def debug_message(msg):
    """

    :param msg:
    """
    logging.debug(msg)


def error_message(msg):
    """

    :param msg:
    """
    logging.error(msg)


def info_message(msg):
    """

    :param msg:
    """
    logging.info(msg)
