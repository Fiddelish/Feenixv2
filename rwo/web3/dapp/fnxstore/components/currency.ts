import { ethers } from "ethers";

export function toJSNumberString(bn: ethers.BigNumber, decimals: number, fixed: number = 2): string {
    return parseFloat(
        ethers.utils.formatUnits(bn, decimals)
    ).toFixed(fixed);
}

export function toJSNumber(bn: ethers.BigNumber, decimals: number): number {
    return parseFloat(
        ethers.utils.formatUnits(bn, decimals)
    );
}
