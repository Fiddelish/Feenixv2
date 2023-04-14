import { ethers } from "ethers";
import CryptoStore from "../abi/contracts/CryptoStore.sol/CryptoStore.json";
import RandomToken from "../abi/contracts/RandomToken.sol/RandomToken.json";

export const CRYPTO_STORE_CONTRACT: string = "0xeAd624980FF03dCcFD93CAAa47D5c61AdefBB737";
export const TOKEN_CONTRACT: string = "0xA240c565Bf3029E55c1224cd65e748fdeBf69f7E";

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
