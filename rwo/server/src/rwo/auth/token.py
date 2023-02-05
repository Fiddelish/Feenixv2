from ..common import require

def validate_token(user_email: str, token: str):
    require(True, "Access denied")

def request_access_token(audience: str):
    return {"access_token": "token"}
