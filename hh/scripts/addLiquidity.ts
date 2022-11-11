import { ethers } from "hardhat";
import UniswapV2 from "./UniswapV2.json";

const FNX_ADDRESS = "0x69c0AfB1Fa6D929C55bEb251Ff19dA3900777621"
const MATIC_ADDRESS = "0x0000000000000000000000000000000000001010"
const UNISWAP_ROUTER_ADDRESS = "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff"

const GAS_LIMIT: number = 1000000;


async function getUniswapV2Contract() {
    const [signer] = await ethers.getSigners();
    const UniswapV2Contract = new ethers.Contract(
        UNISWAP_ROUTER_ADDRESS,
        UniswapV2,
        signer
    );
    return UniswapV2Contract;
}

async function main() {
    const [signer] = await ethers.getSigners();
    const FNX = await ethers.getContractFactory("Token");
    const fnx = await FNX.attach("0x69c0AfB1Fa6D929C55bEb251Ff19dA3900777621");
    const uniswapV2 = await getUniswapV2Contract();
    const allowance = await fnx.allowance(signer.address, UNISWAP_ROUTER_ADDRESS);
    console.log(`FNX allowance: ${allowance}`);
    // const wethAddress = await uniswapV2.WETH({gasLimit: GAS_LIMIT});
    // console.log(`WETH address: ${wethAddress}`);
    // fnx.approve(UNISWAP_ROUTER_ADDRESS, 10000);

    const res = await uniswapV2.addLiquidity(
        MATIC_ADDRESS,
        FNX_ADDRESS,
        ethers.utils.parseEther("1"),
        10000,
        ethers.utils.parseEther("1"),
        10000,
        signer.address,
        Date.now() + 20000,
        {gasLimit: GAS_LIMIT}
    );
    console.log(res);
    /*
    const res = await uniswapV2.addLiquidityETH(
        FNX_ADDRESS,
        5000,
        5000,
        ethers.utils.parseEther("1"),
        signer.address,
        Date.now() + 20000,
        {gasLimit: GAS_LIMIT, value: ethers.utils.parseEther("1")}
    );
    console.log(res);
    */
    const threshold = await fnx.swapTokensAtAmount({gasLimit: GAS_LIMIT});
    if (!threshold.eq(100)) {
        await fnx.updateSwapTokensAtAmount(100, {gasLimit: GAS_LIMIT});
        console.log(`Updated swap tokens at amount`);
    } else {
        console.log("No need to update swap at amount");
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});