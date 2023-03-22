// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./TokenApprover.sol";
import "./TaxTaker.sol";

contract CryptoStore is TokenApprover, TaxTaker {

    uint256 _balance;

    constructor () {
        _balance = 0;
    }

    function GetContractBalance() public view OnlyOwner returns(uint256) { 
       return _balance;
    }

}
