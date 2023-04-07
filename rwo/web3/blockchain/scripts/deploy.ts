import { ethers } from "hardhat";

// const GAS_LIMIT: number = 1000000;

async function main() {
  const [owner, other, dev1, dev2, dev3, rwo, fnx] = await ethers.getSigners();
  console.log(`Deploying token; owner: ${owner.address}`);
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

  let pid = await cryptoStore.GetProductID();
  await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("150", decimals));
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("100", decimals));
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("10", decimals));
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("25", decimals));
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("30", decimals));
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("20", decimals));
  console.log(`Added product ${pid}`);
  await cryptoStore.UpdateDev1Wallet(dev1.address);
  console.log(`Updated dev1 wallet`);
  await cryptoStore.UpdateDev2Wallet(dev2.address);
  console.log(`Updated dev2 wallet`);
  await cryptoStore.UpdateDev3Wallet(dev3.address);
  console.log(`Updated dev3 wallet`);
  await cryptoStore.UpdateRWOWallet(rwo.address);
  console.log(`Updated rwo wallet`);
  await cryptoStore.UpdateFNXWallet(fnx.address);
  console.log(`Updated fnx wallet`);
  randomToken.transfer(
    other.address,
    ethers.utils.parseUnits("1000000", decimals)
  );
  console.log(`Transferred 1000000 tokens to ${other.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
