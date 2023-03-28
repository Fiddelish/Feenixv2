import { ethers } from "hardhat";

const GAS_LIMIT: number = 1000000;

async function main() {
    console.log("Deploying token");
    const randomTokenFactory = await ethers.getContractFactory("RandomToken");
    const randomToken = await randomTokenFactory.deploy({gasLimit: GAS_LIMIT});
    await randomToken.deployed();
    console.log(`Token contract deployed to ${randomToken.address}`);

    console.log("Deploying Crypt Store");
    const cryptoStoreFactory = await ethers.getContractFactory("CryptoStore");
    const cryptoStore = await cryptoStoreFactory.deploy({gasLimit: GAS_LIMIT});
    await cryptoStore.deployed();
    console.log(`Crypto Store contract deployed to ${cryptoStore.address}`);
    await cryptoStore.SetTokenAddress(randomToken.address);
    console.log("Crypto Store: token address set");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
