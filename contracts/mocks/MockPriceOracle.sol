// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IPriceOracle.sol";

contract MockPriceOracle is IPriceOracle {
    mapping(string => uint256) private prices;
    mapping(string => uint256) private lastUpdated;

    function setPrice(string memory symbol, uint256 price) external {
        prices[symbol] = price;
        lastUpdated[symbol] = block.timestamp;
    }

    function getPrice(string memory symbol) external view override returns (uint256) {
        return prices[symbol];
    }

    function updatePrice(string memory symbol, uint256 price) external override {
        prices[symbol] = price;
        lastUpdated[symbol] = block.timestamp;
    }

    function getLastUpdated(string memory symbol) external view returns (uint256) {
        return lastUpdated[symbol];
    }
}