# Contract code review - Questions and Suggestions

This file is a living document summarizing code review of Project Feenix token's contract.

Cosmetics:
- To make it more readable, re-formatted the code and removed extra white spaces
- Fixed variable names (proper camel casing for `buyStakingFees`, `sellStakingFees` etc.)

Solidity version:
- Currently it is set as `0.8.9`. Should we change it to `0.8.15` or higher (using ^ in from of version):
  ```
  pragma solidity ^0.8.15;
  ```

Interface:
- What is the purpose of the empty receive function: `receive() external payable { }`

Black list:
- Is it a good practice to have contract owner with the ability to blacklist wallets? I am not trusting such contracts. I mean this function:
  ```
  function blacklistAccount (address account, bool isBlacklisted) public onlyOwner {
      blacklist[account] = isBlacklisted;
  }
  ```

Questions and comments about `_transfer` function:
- This block should be probably the last one under the `if (limitsInEffect...)` condition, because there are additional `require` statements coming after it and you want to execute them first, before setting the txBlock:
  ```
  if (transferDelayEnabled){
      if (to != owner() && to != address(uniswapV2Router) && to != address(uniswapV2Pair)){
          require(_holderLastTransferTimestamp[tx.origin] < block.number, "_transfer:: Transfer Delay enabled.  Only one purchase per block allowed.");
          _holderLastTransferTimestamp[tx.origin] = block.number;
      }
  }
  ```
- There are many variables (esp. booleans) and a lot of conditions that are slightly hard to read. Some are pretty self-explanatory, but still Would be nice to have an explanation about each and their purpose:
  - limitsInEffect
  - swapping
  - tradingActive
  - antiBotEnabled
  - canSwap
  - swapEnabled
  - takeFee
- These two lines made me wonder:
  ```
  uint256 contractTokenBalance = balanceOf(address(this));
  bool canSwap = contractTokenBalance >= swapTokensAtAmount;
  ```
  Why do we need tokens balance on the contract itself? Aren't we swapping against Liquidity Pool?

`swapBack` function:
- It requires some clarifications
  - what is its role?
  - why we return if `totalTokensToSwap` is 100?
  ```
  if(contractBalance == 0 || totalTokensToSwap == 100) {return;}
  ```
- it is pretty short, so instead of asking line by line questions, we can simply discuss it during our chat
