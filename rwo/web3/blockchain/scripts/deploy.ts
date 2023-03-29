import { ethers } from "hardhat";

// const GAS_LIMIT: number = 1000000;

async function main() {
  console.log("Deploying token");
  const randomTokenFactory = await ethers.getContractFactory("RandomToken");
  const randomToken = await randomTokenFactory.deploy();
  await randomToken.deployed();
  console.log(`Token contract deployed to ${randomToken.address}`);
  const decimals = await randomToken.decimals();

  console.log("Deploying Crypto Store");
  const cryptoStoreFactory = await ethers.getContractFactory("CryptoStore");
  const cryptoStore = await cryptoStoreFactory.deploy();
  await cryptoStore.deployed();
  console.log(`Crypto Store contract deployed to ${cryptoStore.address}`);
  await cryptoStore.SetTokenAddress(randomToken.address);
  console.log("Crypto Store: token address set");

  await cryptoStore.AddOrUpdateProduct(
    1,
    ethers.utils.parseUnits("16.99", decimals)
  );
  console.log("Added product 1");
  await cryptoStore.AddOrUpdateProduct(
    2,
    ethers.utils.parseUnits("21.50", decimals)
  );
  console.log("Added product 2");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
