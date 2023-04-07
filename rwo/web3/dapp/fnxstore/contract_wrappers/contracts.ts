import { ethers } from "ethers";
import CryptoStore from "../abi/contracts/CryptoStore.sol/CryptoStore.json";
import RandomToken from "../abi/contracts/RandomToken.sol/RandomToken.json";

export const CRYPTO_STORE_CONTRACT: string = "0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9";
export const TOKEN_CONTRACT: string = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";

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
