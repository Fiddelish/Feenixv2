import { ethers } from "hardhat";
import UniswapV2 from "./UniswapV2.json";
import UniswapV2Factory from "./UniswapV2Factory.json";

const FNX_ADDRESS = "0xDfa09e7464e8AF32D7374E3Be2b5BdBbc0049754"
const UNISWAP_ROUTER_ADDRESS = "0xd99d1c33f9fc3444f8101754abc46c52416550d1"
const UNISWAP_FACTORY_ADDRESS = "0xB7926C0430Afb07AA7DEfDE6DA862aE0Bde767bc"
const AMM_PAIR = "0xbb619759c43caf43d5677a4a219b7ff4f4e184fd"

const GAS_LIMIT: number = 2500000;


async function getUniswapV2Contract() {
    const [signer] = await ethers.getSigners();
    const UniswapV2Contract = new ethers.Contract(
        UNISWAP_ROUTER_ADDRESS,
        UniswapV2,
        signer
    );
    return UniswapV2Contract;
}

async function getUniswapV2FactoryContract() {
    const [signer] = await ethers.getSigners();
    const UniswapV2FactoryContract = new ethers.Contract(
        UNISWAP_FACTORY_ADDRESS,
        UniswapV2Factory,
        signer
    );
    return UniswapV2FactoryContract;
}

async function main() {
    const [owner, holder] = await ethers.getSigners();
    const FNX = await ethers.getContractFactory("Token");
    const fnx = await FNX.attach(FNX_ADDRESS);
    await fnx.connect(holder).approve(AMM_PAIR, 1000000);
    await fnx.connect(holder).approve(UNISWAP_ROUTER_ADDRESS, 1000000);
    await fnx.approve(holder.address, 1000000);
    const allowance = await fnx.allowance(holder.address, AMM_PAIR);
    console.log(`Allowance for AMM pair: ${allowance}`);
    const uniswapV2 = await getUniswapV2Contract();
    const uniswapV2Factory = await getUniswapV2FactoryContract();
    const weth = await uniswapV2.WETH();

    // const pair = await uniswapV2Factory.getPair(FNX_ADDRESS, weth);
    // console.log(pair);
    const res = await uniswapV2.connect(owner).swapExactTokensForETH(
        1000000,
        0,
        [
            FNX_ADDRESS,
            weth
        ],
        holder.address,
        Date.now() + 20000,
        {gasLimit: GAS_LIMIT}
    )
    const receipt = await res.wait()
    console.log(receipt);
    console.log(res);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});