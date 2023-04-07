import os
import logging
import concurrent_log_handler
import asyncio
from pathlib import Path


RWO_HOME = os.getenv("RWO_HOME", ".")


class RwoMessagesFilter(logging.Filter):
    """ """

    def __init__(self, logger_name):
        self._logger_name = logger_name

    def filter(self, record):
        """

        :param record:
        :return:
        """
        return record.name == self._logger_name


class AIOTaskLogFormatter(logging.Formatter):
    def __init__(self):
        super().__init__(datefmt="%Y-%m-%d %H:%M:%S")

    def format(self, record):
        try:
            task_name = asyncio.current_task().get_name()
        except:
            task_name = "[main]"
        return f"{self.formatTime(record, self.datefmt)} [{task_name}] [{record.levelname}] {record.getMessage()}"


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
        log_path / filename, maxBytes=10485760, backupCount=10, use_gzip=True
    )
    rh.setLevel(level)
    rh.setFormatter(AIOTaskLogFormatter())
    logger.addHandler(rh)
    logger.propagate = False

    return logger


def create_handler(filename, level):
    rh = concurrent_log_handler.ConcurrentRotatingFileHandler(
        filename, maxBytes=10485760, backupCount=10, use_gzip=True
    )
    rh.setLevel(level)
    rh.setFormatter(AIOTaskLogFormatter())
    return rh


# deprecate limited LEVEL_message() methods in favor of direct logger.LEVEL() supporting all levels
