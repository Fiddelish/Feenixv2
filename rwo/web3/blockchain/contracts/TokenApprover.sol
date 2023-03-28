// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./Ownable.sol";

contract TokenApprover is Ownable {

    IERC20Metadata _token;

    constructor () {
        _token = IERC20Metadata(address(0));
    }

    function SetTokenAddress(address tokenAddress) external OnlyOwner {
        _token = IERC20Metadata(tokenAddress);
    }

  
    function GetUserTokenBalance() public view returns(uint256){ 
        return _token.balanceOf(msg.sender);// balancdOf function is already declared in ERC20 token function
    }
   
   
    function ApproveTokens(uint256 amount) public returns(bool){
        _token.approve(address(this), amount);
        return true;
    }
   
   
    function GetAllowance() public view returns(uint256){
        return _token.allowance(msg.sender, address(this));
    }

    function GetTokenDecimals() public view returns(uint256){
        return _token.decimals();
    }
}
