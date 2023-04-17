import { ethers } from "ethers";
import CryptoStore from "../abi/contracts/CryptoStore.sol/CryptoStore.json";
import RandomToken from "../abi/contracts/RandomToken.sol/RandomToken.json";

export const CRYPTO_STORE_CONTRACT: string = process.env.NEXT_PUBLIC_CRYPTO_STORE_CONTRACT !== undefined ? process.env.NEXT_PUBLIC_CRYPTO_STORE_CONTRACT : "";
export const TOKEN_CONTRACT: string = process.env.NEXT_PUBLIC_TOKEN_CONTRACT !== undefined ? process.env.NEXT_PUBLIC_TOKEN_CONTRACT : "";

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
