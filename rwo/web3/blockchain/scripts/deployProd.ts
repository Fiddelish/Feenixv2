import { ethers } from "hardhat";

// const GAS_LIMIT: number = 1000000;

async function main() {
  const owner = "0xF228Fa52d9f3F2B85fD00cB42bD22317Fa210385";
  const [dev1, dev2, dev3, rwo, fnx] = [
    "0xEB5DD81d046838d98086bBc78838e11f5402B216",
    "0x90224Dc2974473c24d7F0820Ab336142805e1F70",
    "0x8C0B7130e20B99d551f22A338A2563bf8DBB39F1",
    "0x4eBD9a948CB032E5e7d471565062AE088129cBA1",
    "0x7Cf34CABF453220E4a67a322987779fc9CBe62eb"
  ];
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

  tx = await cryptoStore.UpdateDev1Wallet(dev1);
  await tx.wait();
  console.log(`Updated dev1 wallet: ${dev1}`);
  tx = await cryptoStore.UpdateDev2Wallet(dev2);
  await tx.wait();
  console.log(`Updated dev2 wallet: ${dev2}`);
  tx = await cryptoStore.UpdateDev3Wallet(dev3);
  await tx.wait();
  console.log(`Updated dev3 wallet: ${dev3}`);
  tx = await cryptoStore.UpdateRWOWallet(rwo);
  await tx.wait();
  console.log(`Updated rwo wallet: ${rwo}`);
  tx = await cryptoStore.UpdateFNXWallet(fnx);
  await tx.wait();
  console.log(`Updated fnx wallet: ${fnx}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
