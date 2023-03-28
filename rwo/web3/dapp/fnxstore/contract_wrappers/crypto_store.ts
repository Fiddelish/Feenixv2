import { ethers } from "ethers";
import CryptoStore from "../abi/contracts/CryptoStore.sol/CryptoStore.json";

export const CRYPTO_STORE_CONTRACT: string = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
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
