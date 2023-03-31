import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Crypto Store test", function () {
  let cryptoStore: Contract;
  let randomToken: Contract;
  let owner: SignerWithAddress;
  let other: SignerWithAddress;
  let dev1: SignerWithAddress;
  let dev2: SignerWithAddress;
  let dev3: SignerWithAddress;
  let rwo: SignerWithAddress;
  let fnx: SignerWithAddress;
  let totalFees: number;
  let decimals: number;
  this.beforeAll(async function () {
    [owner, other, dev1, dev2, dev3, rwo, fnx] = await ethers.getSigners();
    const randomTokenFactory = await ethers.getContractFactory("RandomToken");
    randomToken = await randomTokenFactory.deploy();
    await randomToken.deployed();
    console.log(`Random Token contract deployed at: ${randomToken.address}`);
    decimals = await randomToken.decimals();
    expect(decimals).to.equal(6);
    const cryptoStoreFactory = await ethers.getContractFactory("CryptoStore");
    cryptoStore = await cryptoStoreFactory.deploy();
    await cryptoStore.deployed();
    console.log(`Crypto Store contract deployed at: ${cryptoStore.address}`);
    await randomToken.transfer(
      other.address,
      ethers.utils.parseUnits("1000000", decimals)
    );
    expect(await randomToken.balanceOf(other.address)).to.equal(
      1000000 * 10 ** decimals
    );
    await cryptoStore.SetTokenAddress(randomToken.address);
    console.log(`Configured token address`);
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
  });
  it("Default total fees", async function () {
    totalFees = await cryptoStore.TotalFees();
    expect(totalFees).to.equal(7);
  });
  it("Should have the right owner", async function () {
    expect(await cryptoStore.owner()).to.equal(owner.address);
  });
  it("Should have 0 initial balance", async function () {
    expect(await cryptoStore.GetContractTokenBalance()).to.equal(0);
  });
  it("Should add and update products", async function () {
    await cryptoStore.AddOrUpdateProduct(
      1,
      ethers.utils.parseUnits("21", decimals)
    );
    await cryptoStore.AddOrUpdateProduct(
      2,
      ethers.utils.parseUnits("16.99", decimals)
    );
    expect(await cryptoStore.productPrices(1)).to.equal(21000000);
    expect(await cryptoStore.productPrices(2)).to.equal(16990000);
    expect(await cryptoStore.productPrices(3)).to.equal(0);
    await cryptoStore.AddOrUpdateProduct(
      2,
      ethers.utils.parseUnits("19.99", decimals)
    );
    expect(await cryptoStore.productPrices(2)).to.equal(19990000);
    const fullPrice = await cryptoStore.GetPriceWithFees(2);
    expect(fullPrice).to.equal(19990000 * (1 + totalFees / 100));
  });
  it("Should fail accepting payment", async function () {
    await expect(
      cryptoStore
        .connect(other)
        .MakePayment(3, ethers.BigNumber.from(100), "abc")
    ).to.be.revertedWith("Invalid product ID");
    const fullPrice = await cryptoStore.GetPriceWithFees(2);
    await expect(
      cryptoStore.connect(other).MakePayment(2, fullPrice, "abc")
    ).to.be.revertedWith("ERC20: insufficient allowance");
  });
  it("Payment after approval", async function () {
    const price = await cryptoStore.productPrices(2);
    const fullPrice = await cryptoStore.GetPriceWithFees(2);
    await randomToken.connect(other).approve(cryptoStore.address, fullPrice);
    const allowance = await cryptoStore.connect(other).GetAllowance();
    expect(allowance).to.equal(fullPrice);
    console.log(
      `Allowance (owner: ${other.address}, spender: ${cryptoStore.address}): ${allowance}`
    );
    await expect(
      cryptoStore
        .connect(other)
        .MakePayment(2, ethers.BigNumber.from(100), "abc")
    ).to.be.revertedWith("Wrong amount sent");
    await cryptoStore.connect(other).MakePayment(2, fullPrice, "abc");
    const balance = await cryptoStore.GetContractTokenBalance();
    console.log(`Contract balance: ${balance}`);
    expect(balance).to.equal(price);
  });
});
