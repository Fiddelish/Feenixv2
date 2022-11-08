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
    let marketingWallet: SignerWithAddress;
    let stakingWallet: SignerWithAddress;
    let holder1: SignerWithAddress;
    let holder2: SignerWithAddress;
    let ammPair: SignerWithAddress;
    let addrs: SignerWithAddress[];

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        [owner, marketingWallet, stakingWallet, holder1, holder2, ammPair, ...addrs] = await ethers.getSigners();
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
            const excludedFromFees = await fnx._isExcludedFromFees(marketingWallet.address, {gasLimit: GAS_LIMIT});
            console.log(`Limits in effect: ${limits}; trading active: ${ta}; excluded from fees: ${excludedFromFees}`);
        });

        it("Should transfer from owner, but fail between accounts (trading not active)", async function () {
            // Transfer 500 tokens from owner to holder1
            await fnx.transfer(holder1.address, 500, {gasLimit: GAS_LIMIT});
            const hld1Balance = await fnx.balanceOf(holder1.address, {gasLimit: GAS_LIMIT});
            expect(hld1Balance).to.equal(500);

            // Transfer 500 tokens from holder1 to holder2
            await expect(
                fnx.connect(holder1).transfer(holder2.address, 500, {gasLimit: GAS_LIMIT})
            ).to.be.revertedWith("Trading is not active.");
        });

        it("Should fail if sender doesn’t have enough tokens", async function () {
            const initialOwnerBalance = await fnx.balanceOf(owner.address, {gasLimit: GAS_LIMIT});

            // Try to send 1 token from marketing wallet (0 tokens) to owner (1000000 tokens).
            // `require` will evaluate false and revert the transaction.
            await expect(
                fnx.connect(marketingWallet).transfer(owner.address, 1, {gasLimit: GAS_LIMIT})
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

            // Owner balance shouldn't have changed.
            expect(await fnx.balanceOf(owner.address, {gasLimit: GAS_LIMIT})).to.equal(
                initialOwnerBalance
            );
        });

        it("Should update fees or reject if more than 6%", async function() {
            // update buy fees
            await fnx.updateBuyFees(2, 4, {gasLimit: GAS_LIMIT});
            // update sell fees
            await fnx.updateSellFees(1, 2, {gasLimit: GAS_LIMIT});
            const buyMarketingFee = await fnx.buyMarketingFee({gasLimit: GAS_LIMIT});
            const buyStakingFee = await fnx.buyStakingFee({gasLimit: GAS_LIMIT});
            const buyTotalFees = await fnx.buyTotalFees({gasLimit: GAS_LIMIT});

            const sellMarketingFee = await fnx.sellMarketingFee({gasLimit: GAS_LIMIT});
            const sellStakingFee = await fnx.sellStakingFee({gasLimit: GAS_LIMIT});
            const sellTotalFees = await fnx.sellTotalFees({gasLimit: GAS_LIMIT});
            console.log(
                buyMarketingFee, buyStakingFee, buyTotalFees,
                sellMarketingFee, sellStakingFee, sellTotalFees
            );
            expect(buyMarketingFee).to.equal(2);
            expect(buyStakingFee).to.equal(4);
            expect(buyTotalFees).to.equal(6);
            expect(sellMarketingFee).to.equal(1);
            expect(sellStakingFee).to.equal(2);
            expect(sellTotalFees).to.equal(3);
            await expect(
                fnx.updateSellFees(3, 4, {gasLimit: GAS_LIMIT})
            ).to.be.revertedWith("Must keep fees at 6% or less");
            await expect(
                fnx.updateBuyFees(3, 4, {gasLimit: GAS_LIMIT})
            ).to.be.revertedWith("Must keep fees at 6% or less");
        });

        it("Should transfer tokens after enabling trading", async function() {
            // Transfer 500 tokens from owner to holder1
            await fnx.transfer(holder1.address, 500, {gasLimit: GAS_LIMIT});
            let hld1Balance = await fnx.balanceOf(holder1.address, {gasLimit: GAS_LIMIT});
            expect(hld1Balance).to.equal(500);

            // enable trading
            await fnx.enableTrading({gasLimit: GAS_LIMIT});

            // Transfer 500 tokens from addr3 to addr4
            // We use .connect(signer) to send a transaction from another account
            await fnx.connect(holder1).transfer(holder2.address, 400, {gasLimit: GAS_LIMIT});
            hld1Balance = await fnx.balanceOf(holder1.address, {gasLimit: GAS_LIMIT});
            expect(hld1Balance).to.equal(100);
            const hld2Balance = await fnx.balanceOf(holder2.address, {gasLimit: GAS_LIMIT});
            expect(hld2Balance).to.equal(400);
        });

        it("Should sell tokens and take fee", async function() {
            const TOTAL_AMOUNT = 5000;
            // Transfer 5000 tokens from owner to holder1
            await fnx.transfer(holder1.address, TOTAL_AMOUNT, {gasLimit: GAS_LIMIT});
            let hld1Balance = await fnx.balanceOf(holder1.address, {gasLimit: GAS_LIMIT});
            expect(hld1Balance).to.equal(TOTAL_AMOUNT);

            // enable trading
            await fnx.enableTrading({gasLimit: GAS_LIMIT});
            // set automated market maker pair address
            await fnx.setAutomatedMarketMakerPair(ammPair.address, true, {gasLimit: GAS_LIMIT});
            // update sell fees
            await fnx.updateSellFees(1, 1, {gasLimit: GAS_LIMIT});
            // retrieve sell fees
            const sellTotalFees = await fnx.sellTotalFees({gasLimit: GAS_LIMIT});
            
            const SELL_AMOUNT = 4000;
            // "Sell" tokens
            // We use .connect(signer) to send a transaction from another account
            await fnx.connect(holder1).transfer(ammPair.address, SELL_AMOUNT, {gasLimit: GAS_LIMIT});
            hld1Balance = await fnx.balanceOf(holder1.address, {gasLimit: GAS_LIMIT});
            expect(hld1Balance).to.equal(TOTAL_AMOUNT - SELL_AMOUNT);
            const ammPairBalance = await fnx.balanceOf(ammPair.address, {gasLimit: GAS_LIMIT});
            expect(ammPairBalance).to.equal(SELL_AMOUNT - (SELL_AMOUNT * sellTotalFees / 100));
            const contractBalance = await fnx.balanceOf(fnx.address, {gasLimit: GAS_LIMIT});
            expect(contractBalance).to.equal(SELL_AMOUNT * sellTotalFees / 100);
            console.log(`Contract balance: ${contractBalance}`);
        });

        it("Checks that contract swaps for ETH only when balance more than 100 and it is a buy", async function() {
            const TOTAL_AMOUNT = 5000;
            // Transfer 5000 tokens from owner to holder1
            await fnx.transfer(holder1.address, TOTAL_AMOUNT, {gasLimit: GAS_LIMIT});
            let hld1Balance = await fnx.balanceOf(holder1.address, {gasLimit: GAS_LIMIT});
            expect(hld1Balance).to.equal(TOTAL_AMOUNT);

            // enable trading and swap
            await fnx.enableTrading({gasLimit: GAS_LIMIT});
            await fnx.updateSwapEnabled(true, {gasLimit: GAS_LIMIT});
            // set automated market maker pair address
            await fnx.setAutomatedMarketMakerPair(ammPair.address, true, {gasLimit: GAS_LIMIT});

            await fnx.updateBuyFees(2, 2, {gasLimit: GAS_LIMIT});

            // retrieve buy and sell fees
            const buyTotalFees = await fnx.buyTotalFees({gasLimit: GAS_LIMIT});
            const sellTotalFees = await fnx.sellTotalFees({gasLimit: GAS_LIMIT});

            // First sell tokens
            await fnx.connect(holder1).transfer(ammPair.address, 1000, {gasLimit: GAS_LIMIT});
            let contractBalance = await fnx.balanceOf(fnx.address, {gasLimit: GAS_LIMIT});
            let ammPairBalance = await fnx.balanceOf(ammPair.address, {gasLimit: GAS_LIMIT});
            expect(contractBalance).to.equal(1000 * sellTotalFees / 100);
            expect(ammPairBalance).to.equal(1000 - (1000 * sellTotalFees / 100));
            // contract: 60; amm pair: 940

            // Sell more
            await fnx.connect(holder1).transfer(ammPair.address, 500, {gasLimit: GAS_LIMIT});
            contractBalance = await fnx.balanceOf(fnx.address, {gasLimit: GAS_LIMIT});
            ammPairBalance = await fnx.balanceOf(ammPair.address, {gasLimit: GAS_LIMIT});
            expect(contractBalance).to.equal(1500 * sellTotalFees / 100);
            expect(ammPairBalance).to.equal(1500 - (1500 * sellTotalFees / 100));
            // contract: 90; amm pair: 1410

            // Now buy
            await fnx.connect(ammPair).transfer(holder2.address, 500, {gasLimit: GAS_LIMIT});
            contractBalance = await fnx.balanceOf(fnx.address, {gasLimit: GAS_LIMIT});
            ammPairBalance = await fnx.balanceOf(ammPair.address, {gasLimit: GAS_LIMIT});
            expect(contractBalance).to.equal((1500 * sellTotalFees / 100) + (500 * buyTotalFees / 100));
            expect(ammPairBalance).to.equal(1500 - (1500 * sellTotalFees / 100) - 500);
            // contract: 110; amm pair: 910

            // buy again
            await fnx.connect(ammPair).transfer(holder2.address, 500, {gasLimit: GAS_LIMIT});
            contractBalance = await fnx.balanceOf(fnx.address, {gasLimit: GAS_LIMIT});
            ammPairBalance = await fnx.balanceOf(ammPair.address, {gasLimit: GAS_LIMIT});
            expect(contractBalance).to.equal((1500 * sellTotalFees / 100) + (1000 * buyTotalFees / 100));
            expect(ammPairBalance).to.equal(1500 - (1500 * sellTotalFees / 100) - 500 - 500);
            // contract: 130; amm pair: 410

            // and now sell; this should trigger swapBack, but will fail due to INSUFFICIENT LIQUIDITY
            await expect(
                fnx.connect(holder1).transfer(ammPair.address, 500, {gasLimit: GAS_LIMIT})
            ).to.be.revertedWith("UniswapV2Library: INSUFFICIENT_LIQUIDITY");
            console.log(`Contract balance: ${contractBalance}; AMM pair balance: ${ammPairBalance}`);
            // contractBalance = await fnx.balanceOf(fnx.address, {gasLimit: GAS_LIMIT});
            // ammPairBalance = await fnx.balanceOf(ammPair.address, {gasLimit: GAS_LIMIT});
            // expect(contractBalance).to.equal(1500 * sellTotalFees / 100);
            // expect(ammPairBalance).to.equal(1500 - (1500 * sellTotalFees / 100) - 500 - 500 + (500 * sellTotalFees / 100));
            // contract: 30; amm pair: 880
            
        });
    });
});
