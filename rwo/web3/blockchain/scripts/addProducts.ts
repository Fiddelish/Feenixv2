import { ethers } from "hardhat";

// const GAS_LIMIT: number = 1000000;

async function main() {
  const cryptoStore = await ethers.getContractAt(
    "CryptoStore",
    "0xaf25b82f9a1fB867967233D0700024C82910bFa1"
  );
  console.log(`Crypto Store contract attached to ${cryptoStore.address}`);
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
