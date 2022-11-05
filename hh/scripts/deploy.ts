import { ethers } from "hardhat";

async function main() {
  const FNX = await ethers.getContractFactory("FNXToken");
  const fnx = await FNX.deploy();
  await fnx.deployed();

  console.log(`Token contract deployed to ${fnx.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
