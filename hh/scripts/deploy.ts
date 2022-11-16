import { ethers } from "hardhat";

const GAS_LIMIT: number = 10000000;

async function main() {
  const FNX = await ethers.getContractFactory("Token");
  const fnx = await FNX.deploy({gasLimit: GAS_LIMIT});
  await fnx.deployed();

  console.log(`Token contract deployed to ${fnx.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
