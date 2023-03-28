// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./TokenApprover.sol";
import "./FeesTaker.sol";

contract CryptoStore is TokenApprover, FeesTaker {

    uint256 _balance;

    mapping(uint256 => uint256) public productPrices;
    mapping(string => uint256) public txInAmounts;
    mapping(string => address) public txInAddresses;

    constructor () {
        _balance = 0;
    }

    function GetContractTokenBalance() public OnlyOwner view returns(uint256) {
        return _token.balanceOf(address(this));
    }

    function GetPriceWithFees(uint256 productId) public view returns(uint256) {
        require(productPrices[productId] > 0, "Invalid product ID");
        return productPrices[productId]  * (100 + TotalFees) / 100;
    }

    function MakePayment(uint256 productId, uint256 amount, string memory txId) public {
        require(productPrices[productId] > 0, "Invalid product ID");
        require(productPrices[productId] == amount, "Wrong amount sent");
        require(txInAmounts[txId] == 0, "transacion ID already exists");
        require(txInAddresses[txId] == address(0), "transacion ID already exists");
        txInAmounts[txId] = amount;
        txInAddresses[txId] = msg.sender;
        _distributeFees(msg.sender, amount);
        _distributePayment(msg.sender, amount);
    }

    function _distributeFees(address sender, uint256 amount) internal {
        _takeFees(_token, sender, amount);
    }

    function _distributePayment(address sender, uint256 amount) internal {
        uint256 paymentAmount = amount * (100 - TotalFees) / 100;
        _token.transferFrom(sender, address(this), paymentAmount);
    }

}
