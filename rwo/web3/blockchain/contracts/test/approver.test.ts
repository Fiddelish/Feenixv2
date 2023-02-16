import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Approver test", function () {
    let fnxApprover: Contract;
    let randomToken: Contract;
    let owner: SignerWithAddress;
    let other: SignerWithAddress;
    let other2: SignerWithAddress;
    this.beforeAll(async function () {
        [owner, other, other2] = await ethers.getSigners();
        const randomTokenFactory = await ethers.getContractFactory("RandomToken");
        randomToken = await randomTokenFactory.deploy();
        await randomToken.deployed();
        console.log(`Random Token contract deployed at: ${randomToken.address}`);
        const fnxApproverFactory = await ethers.getContractFactory("FnxTokenApprover");
        fnxApprover = await fnxApproverFactory.deploy()
        await fnxApprover.deployed();
        console.log(`FNX approver contract deployed at: ${fnxApprover.address}`);
        await randomToken.transfer(other.address, ethers.BigNumber.from(1000000000));
        expect(await randomToken.balanceOf(other.address)).to.equal(1000000000);
        await fnxApprover.SetTokenAddress(randomToken.address);
        console.log(`Configured token address`);
    });
    it("Should have the right owner", async function() {
        expect(await fnxApprover.owner()).to.equal(owner.address);
    });
    it("Should have 0 initial balance", async function () {
        expect(await fnxApprover.GetContractTokenBalance()).to.equal(0);
    });
    it("Should fail accepting payement due to no approval", async function () {
        await expect(
            fnxApprover.connect(other).AcceptPayment(ethers.BigNumber.from(1000000))
        ).to.be.revertedWith("ERC20: insufficient allowance");
    });
    it("Should succeed accepting payment after approval", async function () {
        // await fnxApprover.connect(other).ApproveTokens(ethers.BigNumber.from(2000000))
        await randomToken.connect(other).approve(fnxApprover.address, ethers.BigNumber.from(2000000))
        const allowance = await randomToken.allowance(other.address, fnxApprover.address);
        console.log(`Allowance (owner: ${other.address}, spender: ${fnxApprover.address}): ${allowance}`);
        await fnxApprover.connect(other).AcceptPayment(ethers.BigNumber.from(1000000));
        const balance = await fnxApprover.GetContractTokenBalance();
        console.log(`Contract balance: ${balance}`);
    });
});
