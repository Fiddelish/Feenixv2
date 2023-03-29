import { ethers } from "ethers";
import CryptoStore from "../abi/contracts/CryptoStore.sol/CryptoStore.json";
import RandomToken from "../abi/contracts/RandomToken.sol/RandomToken.json";

export const CRYPTO_STORE_CONTRACT: string = "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82";
export const TOKEN_CONTRACT: string = "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0";

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
