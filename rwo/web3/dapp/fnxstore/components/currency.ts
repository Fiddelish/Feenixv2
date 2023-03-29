import { ethers } from "ethers";

export function toJSNumber(bn: ethers.BigNumber, decimals: number): string {
    return parseFloat(
        ethers.utils.formatUnits(bn, decimals)
    ).toFixed(2);
}
