// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./IERC20.sol";
import "./Ownable.sol";

contract TokenApprover is Ownable {

    IERC20 token;

    constructor () {
        token = IERC20(address(0));
    }

    function SetTokenAddress(address tokenAddress) external OnlyOwner {
        token = IERC20(tokenAddress);
    }

  
   function GetUserTokenBalance() public view returns(uint256){ 
       return token.balanceOf(msg.sender);// balancdOf function is already declared in ERC20 token function
   }
   
   
   function ApproveTokens(uint256 _token) public returns(bool){
       token.approve(address(this), _token);
       return true;
   }
   
   
   function GetAllowance() public view returns(uint256){
       return token.allowance(msg.sender, address(this));
   }
   
   function AcceptPayment(uint256 _tokenamount) public returns(bool) {
       // require(_tokenamount > GetAllowance(), "Please approve tokens before transferring");
       token.transferFrom(msg.sender, address(this), _tokenamount);
       return true;
   }
   
   
   function GetContractTokenBalance() public OnlyOwner view returns(uint256){
       return token.balanceOf(address(this));
   }


}
