// We import Chai to use its asserting functions here.
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

const GAS_LIMIT: number = 1000000;

describe("FNXToken contract", function () {
    let FNX;
    let fnx: Contract;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let addr3: SignerWithAddress;
    let addr4: SignerWithAddress;
    let addrs: SignerWithAddress[];

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        [owner, addr1, addr2, addr3, addr4, ...addrs] = await ethers.getSigners();
        FNX = await ethers.getContractFactory("FNXToken");
        fnx = await FNX.deploy();
        await fnx.deployed();
    });

    // You can nest describe calls to create subsections.
    describe("Deployment", function () {
        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await fnx.balanceOf(owner.address, {gasLimit: GAS_LIMIT});
            expect(await fnx.totalSupply({gasLimit: GAS_LIMIT})).to.equal(ownerBalance);
        });
    });

    describe("Transactions", function () {

        it("Should output limitsInEffect", async function() {
            const limits = await fnx.limitsInEffect({gasLimit: GAS_LIMIT});
            const ta = await fnx.tradingActive({gasLimit: GAS_LIMIT});
            const excludedFromFees = await fnx._isExcludedFromFees(addr2.address, {gasLimit: GAS_LIMIT});
            console.log(`Limits in effect: ${limits}; trading active: ${ta}; excluded from fees: ${excludedFromFees}`);
        });

        it("Should transfer from owner, but fail between accounts (trading not active)", async function () {
            const ownerBalance = await fnx.balanceOf(owner.address, {gasLimit: GAS_LIMIT});

            // Transfer 500 tokens from owner to addr1
            await fnx.transfer(addr3.address, 500, {gasLimit: GAS_LIMIT});
            const addr3Balance = await fnx.balanceOf(addr3.address, {gasLimit: GAS_LIMIT});
            expect(addr3Balance).to.equal(500);

            // Transfer 500 tokens from addr1 to addr2
            // We use .connect(signer) to send a transaction from another account
            await expect(
                fnx.connect(addr3).transfer(addr4.address, 500, {gasLimit: GAS_LIMIT})
            ).to.be.revertedWith("Trading is not active.");
        });

        it("Should fail if sender doesn’t have enough tokens", async function () {
            const initialOwnerBalance = await fnx.balanceOf(owner.address, {gasLimit: GAS_LIMIT});

            // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
            // `require` will evaluate false and revert the transaction.
            await expect(
                fnx.connect(addr1).transfer(owner.address, 1, {gasLimit: GAS_LIMIT})
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

            // Owner balance shouldn't have changed.
            expect(await fnx.balanceOf(owner.address, {gasLimit: GAS_LIMIT})).to.equal(
                initialOwnerBalance
            );
        });

    });
});
