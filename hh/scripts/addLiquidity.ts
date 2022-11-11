import { ethers } from "hardhat";
import UniswapV2 from "./UniswapV2.json";

const FNX_ADDRESS = "0x69c0AfB1Fa6D929C55bEb251Ff19dA3900777621"
const MATIC_ADDRESS = "0xe864787E23Ce07D84f951Da7008111a3e8b88d5a"


async function getUniswapV2Contract() {
    const [signer] = await ethers.getSigners();
    const UniswapV2Contract = new ethers.Contract(
        "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff",
        UniswapV2,
        signer
    );
    return UniswapV2Contract;
}

async function main() {
    const [signer] = await ethers.getSigners();
    const FNX = await ethers.getContractFactory("FNXToken");
    const fnx = await FNX.attach("0x69c0AfB1Fa6D929C55bEb251Ff19dA3900777621");
    const uniswapV2 = await getUniswapV2Contract();
    await uniswapV2.addLiquidity(
        MATIC_ADDRESS,
        FNX_ADDRESS,
        1,
        10000,
        1,
        10000,
        signer.address,
        Date.now() + 20000
    );
    console.log(`Added liquidity`);
    const threshold = await fnx.swapTokensAtAmount();
    if (threshold !== ethers.BigNumber.from(100)) {
        await fnx.updateSwapTokensAtAmount(100);
        console.log(`Updated swap tokens at amount`);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});