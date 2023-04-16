import { ethers } from "ethers";
import CryptoStore from "../abi/contracts/CryptoStore.sol/CryptoStore.json";
import RandomToken from "../abi/contracts/RandomToken.sol/RandomToken.json";

export const CRYPTO_STORE_CONTRACT: string = "0x86598b33F3Fc26F60DA900bD81d2c82B7Bc7ea8F";
export const TOKEN_CONTRACT: string = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";

export function getCryptoStoreContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const CryptoStoreContract = new ethers.Contract(
        CRYPTO_STORE_CONTRACT,
        CryptoStore.abi,
        signer
    );
    return CryptoStoreContract;
}

export function getTokenContract() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const TokenContract = new ethers.Contract(
        TOKEN_CONTRACT,
        RandomToken.abi,
        signer
    );
    return TokenContract;
}
