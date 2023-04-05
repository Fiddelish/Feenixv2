// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./Ownable.sol";

contract TokenManager is Ownable {
    IERC20Metadata _token;

    constructor() {
        _token = IERC20Metadata(address(0));
    }

    function SetTokenAddress(address tokenAddress) external OnlyOwner {
        require(address(_token) == address(0), "Token address already set");
        _token = IERC20Metadata(tokenAddress);
    }

    function GetContractTokenBalance() public view OnlyOwner returns (uint256) {
        return _token.balanceOf(address(this));
    }

    function GetAllowance() public view returns (uint256) {
        return _token.allowance(msg.sender, address(this));
    }

    function GetTokenDecimals() public view returns (uint8) {
        return _token.decimals();
    }

    function GetTokenName() public view returns (string) {
        return _token.name();
    }
}
