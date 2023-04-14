import { BigNumber, ContractReceipt, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { CryptoStore } from "../typechain";

// const GAS_LIMIT: number = 1000000;

async function waitForCompletion(
  cryptoStore: CryptoStore,
  currentPid: BigNumber
) {
  let pid = await cryptoStore.GetProductID();
  while (!pid.gt(currentPid)) {
    console.log(
      `Waiting for state change completion; current product ID:${currentPid}`
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));
    pid = await cryptoStore.GetProductID();
  }
  return pid;
}

async function main() {
  const cryptoStoreAddress = "0x86598b33F3Fc26F60DA900bD81d2c82B7Bc7ea8F";
  console.log(`Attaching to crypto store at ${cryptoStoreAddress}`);
  const cryptoStore = await ethers.getContractAt(
    "CryptoStore",
    cryptoStoreAddress
  );
  console.log("Attached to crypto store");
  const decimals = 6;
  const price = "1";
  const pid = await cryptoStore.GetProductID();
  const tx: ContractTransaction = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);
  await waitForCompletion(cryptoStore, pid);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
