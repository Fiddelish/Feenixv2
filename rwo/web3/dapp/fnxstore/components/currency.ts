import { ethers } from "ethers";

export function toJSNumber(bn: ethers.BigNumber, decimals: number): number {
    return parseInt(ethers.utils.formatUnits(bn, decimals), 10);
}
