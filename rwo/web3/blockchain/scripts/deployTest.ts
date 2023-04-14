import { ethers } from "hardhat";

// const GAS_LIMIT: number = 1000000;

async function main() {
  const [other, dev1, dev2, dev3, rwo, fnx] = [
    "0xc5c1E42275Ba446f899B9dbf311111E735201463",
    "0xf0F1b1B43846EDb3f0507FC8aD1BA1af88c60b95",
    "0xE8Fe602269aDe2C416f327a3eF666394B9c495FF",
    "0x0640989fDf4a6B203da97b31f215dBAF33D4dB37",
    "0xF0D0CcfB49B80436C1563EBA59F7E69770617070",
    "0x85047c1DB2a934De12E2724e79b3093056344aF4"
  ];
  console.log(`Deploying token`);
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
  randomToken.transfer(
    other,
    ethers.utils.parseUnits("1000000", decimals)
  );
  console.log(`Transferred 1000000 tokens to ${other}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
