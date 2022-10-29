# Contract code review - Questions and Suggestions

This file is a living document summarizing code review of Project Feenix token's contract.

Cosmetics:
- To make it more readable, re-formatted the code to have proper indents, white spaces etc. Saved newly formatted file under contract.sol. Original .sol is intact
- Add `// SPDX-License-Identifier: MIT` as first line
- Variable names:
  ```
  uint256 public buyTotalFees;
  uint256 public buyMarketingFee;
  uint256 public buydevFee; // should be 'buyDevFee'
  uint256 public buypartnerFee; // should be 'buyPartnerFee'
  ```
  Should probably use camel-case for all

Solidity version:
- Currently it is set as `0.8.9`. Should we change it to `0.8.15` or higher (using ^ in from of version):
  ```
  pragma solidity ^0.8.15;
  ```

Fees:
- This code declaring fees variables has an extra line with `uint256 publ;`; do we have variable missing or it is just not supposed to be there:
  ```
  uint256 public sellTotalFees;
  uint256 public sellMarketingFee;
  uint256 public selldevFee;
  uint256 publ; // <-- this line (I can guess it was copy paste from buy fees and then partner fee line was deleted partially)
  ```
- General question about buy and sell fees: in case of buy fees we have:
  ```
  buyTotalFees = buyMarketingFee + buypartnerFee; // marketing + partner
  ```
  while for sell fees it is:
  ```
  sellTotalFees = sellMarketingFee + selldevFee; // marketing + dev
  ```
  Why the difference and maybe you can expand on how fees are composed for buy and sell actions?
- Why do we still have Dev fee? I thought this was the reason for not complying with Sweden regulations...
- `buyPartnerFee` is not initialized, only marketing and dev. I guess it is implicitly set to zero by solidity. Didn't see any interface function to modify it:
  - Is it going to be added?
  - If not, how is it going to be set?
  - Also, if non-zero, it would affect all the buys by regular holders. Why should they be affected by partner fees?

Token contract:
- What is the purpose of the empty receive function: `receive() external payable { }`
