from typing import Dict, Tuple
import time
import os
import json
from pathlib import Path
import web3
from web3.auto import w3 as w3utils
from eth_account.messages import encode_defunct

from . import require
from .utils import to_bn, uuid4str
from rwo.common import logging as rwo_logging

LOGGER = rwo_logging.init_logger("blockchain.log", rwo_logging.DEBUG, "blockchain")

WEB3_HTTP_PROVIDER = os.getenv("WEB3_HTTP_PROVIDER", "http://hardhat:8545")
CRYPTO_STORE_CONTRACT = os.getenv(
    "CRYPTO_STORE_CONTRACT", "0xE6E340D132b5f46d1e472DebcD681B2aBc16e57E"
)
ABI_PATH = Path(os.getenv("ABI_PATH", "./abi"))


def get_crypto_store_abi() -> Dict:
    with (ABI_PATH / "contracts/CryptoStore.sol/CryptoStore.json").open(
        "rb"
    ) as abi_file:
        return json.load(abi_file)["abi"]


def generate_tx_id() -> str:
    return f"{time.time()}{uuid4str()}"


def generate_token() -> str:
    return uuid4str()


def verify_hash(
    tx_id: str, tx_hash: str, wallet: str, product_id: int, amount: int
) -> bool:
    LOGGER.debug(
        f"verify_hash called: "
        f"tx_id={tx_id}; "
        f"tx_hash={tx_hash}; "
        f"wallet={wallet}; "
        f"amount={amount}; "
        f"product_id={product_id}"
    )
    try:
        w3 = web3.Web3(web3.HTTPProvider(WEB3_HTTP_PROVIDER))
        w3.eth.wait_for_transaction_receipt(tx_hash, timeout=30)
        tx = w3.eth.getTransaction(tx_hash)
        tx_from = tx.get("from")
        require(tx_from == wallet, "Wrong wallet")
        tx_to = tx.get("to")
        require(tx_to == CRYPTO_STORE_CONTRACT, "Wrong contract address")
        contract = w3.eth.contract(
            address=web3.Web3.toChecksumAddress(CRYPTO_STORE_CONTRACT),
            abi=get_crypto_store_abi(),
        )
        decimals = contract.functions.GetTokenDecimals().call()
        full_price = contract.functions.GetPriceWithFees(product_id).call()
        require(
            full_price == amount, f"Wrong transaction amount; expected {full_price}"
        )
        decoded = contract.decode_function_input(tx.get("input"))
        require(decoded[0].fn_name == "MakePayment", "Wrong function call")
        require(decoded[1]["productId"] == product_id, "Wrong product ID")
        require(
            decoded[1]["amount"] == amount,
            f"Wrong transaction amount; expected {decoded[1]['amount']}",
        )
        require(decoded[1]["txId"] == tx_id, "Wrong transaction ID")
        tx_amount = contract.functions.txInAmounts(tx_id).call()
        require(tx_amount == amount, f"Wrong transaction amount; expected {tx_amount}")
        tx_address = contract.functions.txInAddresses(tx_id).call()
        require(tx_address == wallet, "Wrong wallet")
    except Exception as e:
        LOGGER.error(f"verify_hash: {str(e)}")
        return False
    return True


def verify_signature(signature: str, message: str, wallet: str) -> bool:
    if not wallet:
        return False
    signable_msg = encode_defunct(message.encode())
    signed_address = (
        w3utils.eth.account.recover_message(signable_msg, signature=signature)
    ).lower()
    return signed_address == wallet.lower()
