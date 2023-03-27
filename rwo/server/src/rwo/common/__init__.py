from typing import Union

def require(condition: bool, error: Union[str, Exception]):
    if condition:
        return
    else:
        if isinstance(error, Exception):
            raise error
        else:
            raise Exception(error)
