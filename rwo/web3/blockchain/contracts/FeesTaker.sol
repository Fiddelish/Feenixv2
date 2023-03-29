// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract FeesTaker is Ownable {

    address payable public Dev3Wallet = payable(0);
    address payable public Dev2Wallet = payable(0);
    address payable public Dev1Wallet = payable(0);
    address payable public FNXWallet = payable(0);
    address payable public RWOWallet = payable(0);
    address public contractAddress = address(this);

    uint256 public TotalFees;
    uint256 public Dev3Fee;
    uint256 public Dev2Fee;
    uint256 public Dev1Fee;
    uint256 public FNXFee;
    uint256 public RWOFee;

    event Dev1WalletUpdated(address indexed newWallet, address indexed oldWallet);
    event Dev2WalletUpdated(address indexed newWallet, address indexed oldWallet);
    event Dev3WalletUpdated(address indexed newWallet, address indexed oldWallet);
    event RWOWalletUpdated(address indexed newWallet, address indexed oldWallet);
    event FNXWalletUpdated(address indexed newWallet, address indexed oldWallet);

    constructor() {
        uint256 _FNXFee = 2;
        uint256 _RWOFee = 2;
        uint256 _Dev1Fee = 1;
        uint256 _Dev2Fee = 1;
        uint256 _Dev3Fee = 1;

        FNXFee = _FNXFee;
        RWOFee = _RWOFee;
        Dev1Fee = _Dev1Fee;
        Dev2Fee = _Dev2Fee;
        Dev3Fee = _Dev3Fee;
        TotalFees = FNXFee + FNXFee + Dev1Fee + Dev2Fee + Dev3Fee;
    }

    function UpdateFees(
        uint256 _RWOFee, uint256 _FNXFee,
        uint256 _Dev1Fee, uint256 _Dev2Fee, uint256 _Dev3Fee) external OnlyOwner {
        FNXFee = _FNXFee;
        RWOFee = _RWOFee;
        Dev1Fee = _Dev1Fee;
        Dev2Fee = _Dev2Fee;
        Dev3Fee = _Dev3Fee;

        TotalFees = TotalFees = FNXFee + FNXFee + Dev1Fee + Dev2Fee + Dev3Fee;
        require(TotalFees <= 10, "Must keep fees at 10% or less");
    }

    function UpdateDev1Wallet(address dev1) external OnlyOwner {
        require(dev1 != address(0), "Zero address");
        require(dev1 != address(Dev1Wallet), "Same dev1 wallet");
        Dev1Wallet = payable(dev1);
    }

    function UpdateDev2Wallet(address dev2) external OnlyOwner {
        require(dev2 != address(0), "Zero address");
        require(dev2 != address(Dev2Wallet), "Same dev2 wallet");
        Dev2Wallet = payable(dev2);
    }

    function UpdateDev3Wallet(address dev3) external OnlyOwner {
        require(dev3 != address(0), "Zero address");
        require(dev3 != address(Dev3Wallet), "Same dev3 wallet");
        Dev3Wallet = payable(dev3);
    }

    function UpdateRWOWallet(address rwo) external OnlyOwner {
        require(rwo != address(0), "Zero address");
        require(rwo != address(RWOWallet), "Same rwo wallet");
        RWOWallet = payable(rwo);
    }

    function UpdateFNXWallet(address fnx) external OnlyOwner {
        require(fnx != address(0), "Zero address");
        require(fnx != address(FNXWallet), "Same fnx wallet");
        FNXWallet = payable(fnx);
    }

    function _takeFees(IERC20Metadata token, address sender, uint256 price) internal {
        uint256 dev1Amount = Dev1Fee * price / 100;
        uint256 dev2Amount = Dev2Fee * price / 100;
        uint256 dev3Amount = Dev3Fee * price / 100;
        uint256 rwoAmount = RWOFee * price / 100;
        uint256 fnxAmount = FNXFee * price / 100;
        token.transferFrom(sender, Dev1Wallet, dev1Amount);
        token.transferFrom(sender, Dev2Wallet, dev2Amount);
        token.transferFrom(sender, Dev3Wallet, dev3Amount);
        token.transferFrom(sender, RWOWallet, rwoAmount);
        token.transferFrom(sender, FNXWallet, fnxAmount);
    }
}
