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

  const decimals = 6;
  let price = "12";
  let pid = await cryptoStore.GetProductID();
  let tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "36";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "66";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "28.50";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "56";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "82";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "115";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "26";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "56";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "56";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "115";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "56";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "165";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "275";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "425";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);

  price = "535";
  pid = await cryptoStore.GetProductID();
  tx = await cryptoStore.AddProduct(
    pid,
    ethers.utils.parseUnits(price, decimals)
  );
  await tx.wait();
  console.log(`Added product ${pid}; price: ${price}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
