// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./TokenManager.sol";
import "./FeesTaker.sol";

contract CryptoStore is TokenManager, FeesTaker {

    uint256 _balance;

    mapping(uint256 => uint256) public productPrices;
    mapping(string => uint256) public txInAmounts;
    mapping(string => address) public txInAddresses;

    constructor () {
        _balance = 0;
    }

    function AddOrUpdateProduct(uint256 productId, uint256 price) public OnlyOwner {
        require(price > 0, "Price should be greater than 0");
        productPrices[productId] = price;
    }

    function GetPriceWithFees(uint256 productId) public view returns(uint256) {
        require(productPrices[productId] > 0, "Invalid product ID");
        return productPrices[productId]  * (100 + TotalFees) / 100;
    }

    function MakePayment(uint256 productId, uint256 amount, string memory txId) public {
        uint256 fullPrice = GetPriceWithFees(productId);
        uint256 price = productPrices[productId];
        require(fullPrice == amount, "Wrong amount sent");
        require(txInAmounts[txId] == 0, "transacion ID already exists");
        require(txInAddresses[txId] == address(0), "transacion ID already exists");
        txInAmounts[txId] = amount;
        txInAddresses[txId] = msg.sender;
        _distributeFees(msg.sender, price);
        _distributePayment(msg.sender, price);
    }

    function _distributeFees(address sender, uint256 price) internal {
        _takeFees(_token, sender, price);
    }

    function _distributePayment(address sender, uint256 price) internal {
        _token.transferFrom(sender, address(this), price);
    }
}
