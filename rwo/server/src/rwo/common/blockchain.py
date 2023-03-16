from typing import Dict, Tuple
import time
from pathlib import Path


from . import require
from .utils import to_bn, uuid4str

def generate_challenge() -> str:
    return f"{time.time()}|{uuid4str()}"

def verify_hash(tx_id: str, tx_hash: str, wallet: str, amount: int) -> bool:
    try:
        pass
    except Exception as e:
        print(f"verify_hash: {str(e)}")
        return False
    return True

def verify_signature(signature: str, message: str, wallet: str) -> bool:
    if not wallet:
        return False
    signable_msg = encode_defunct(message.encode())
    signed_address = (w3utils.eth.account.recover_message(signable_msg, signature=signature)).lower()
    return signed_address == wallet.lower()
