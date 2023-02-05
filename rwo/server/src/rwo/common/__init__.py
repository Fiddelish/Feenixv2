def require(condition: bool, error: str):
    if condition:
        return
    else:
        raise Exception(error)
