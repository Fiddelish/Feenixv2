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
  let tx = await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("150", decimals));
  await tx.wait();
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("100", decimals));
  await tx.wait();
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("10", decimals));
  await tx.wait();
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("25", decimals));
  await tx.wait();
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("30", decimals));
  await tx.wait();
  console.log(`Added product ${pid}`);
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(pid, ethers.utils.parseUnits("20", decimals));
  await tx.wait();
  console.log(`Added product ${pid}`);
  tx = await cryptoStore.UpdateDev1Wallet(dev1.address);
  await tx.wait();
  console.log(`Updated dev1 wallet: ${dev1.address}`);
  tx = await cryptoStore.UpdateDev2Wallet(dev2.address);
  await tx.wait();
  console.log(`Updated dev2 wallet: ${dev2.address}`);
  tx = await cryptoStore.UpdateDev3Wallet(dev3.address);
  await tx.wait();
  console.log(`Updated dev3 wallet: ${dev3.address}`);
  tx = await cryptoStore.UpdateRWOWallet(rwo.address);
  await tx.wait();
  console.log(`Updated rwo walle: ${rwo.address}t`);
  tx = await cryptoStore.UpdateFNXWallet(fnx.address);
  await tx.wait();
  console.log(`Updated fnx wallet: ${fnx.address}`);
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
