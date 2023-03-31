import { ethers } from "ethers";

export function toJSNumberString(bn: ethers.BigNumber, decimals: number): string {
    return parseFloat(
        ethers.utils.formatUnits(bn, decimals)
    ).toFixed(2);
}

export function toJSNumber(bn: ethers.BigNumber, decimals: number): number {
    return parseFloat(
        ethers.utils.formatUnits(bn, decimals)
    );
}
