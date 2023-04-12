import { ethers } from "hardhat";

// const GAS_LIMIT: number = 1000000;

async function main() {
  const USDC_ADDRESS: string = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
  console.log("Deploying Crypto Store");
  const cryptoStoreFactory = await ethers.getContractFactory("CryptoStore");
  const cryptoStore = await cryptoStoreFactory.deploy();
  await cryptoStore.deployed();
  console.log(`Crypto Store contract deployed to ${cryptoStore.address}`);
  await cryptoStore.SetTokenAddress(USDC_ADDRESS);
  console.log(`Crypto Store: set USDC address to ${USDC_ADDRESS}`);

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
  if (process.env.DEV1_WALLET !== undefined) {
    tx = await cryptoStore.UpdateDev1Wallet(process.env.DEV1_WALLET);
    await tx.wait();
    console.log(`Updated dev1 wallet: ${process.env.DEV1_WALLET}`);
  }
  if (process.env.DEV2_WALLET !== undefined) {
    tx = await cryptoStore.UpdateDev2Wallet(process.env.DEV2_WALLET);
    await tx.wait();
    console.log(`Updated dev2 wallet: ${process.env.DEV2_WALLET}`);
  }
  if (process.env.DEV3_WALLET !== undefined) {
    tx = await cryptoStore.UpdateDev3Wallet(process.env.DEV3_WALLET);
    await tx.wait();
    console.log(`Updated dev3 wallet: ${process.env.DEV3_WALLET}`);
  }
  if (process.env.RWO_WALLET !== undefined) {
    tx = await cryptoStore.UpdateRWOWallet(process.env.RWO_WALLET);
    await tx.wait();
    console.log(`Updated rwo wallet: ${process.env.RWO_WALLET}`);
  }
  if (process.env.FNX_WALLET !== undefined) {
    tx = await cryptoStore.UpdateFNXWallet(process.env.FNX_WALLET);
    await tx.wait();
    console.log(`Updated fnx wallet: ${process.env.FNX_WALLET}`);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
