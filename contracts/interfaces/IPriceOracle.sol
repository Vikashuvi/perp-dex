// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IPriceOracle
 * @dev Interface for price oracle contracts
 */
interface IPriceOracle {
    /**
     * @dev Get the current price for a market
     * @param _marketSymbol Symbol of the market (e.g., "ETH-USD")
     * @return price Current price with 18 decimals
     */
    function getPrice(string memory _marketSymbol) external view returns (uint256);
    
    /**
     * @dev Update the price for a market (called by authorized price feeders)
     * @param _marketSymbol Symbol of the market
     * @param _price New price with 18 decimals
     */
    function updatePrice(string memory _marketSymbol, uint256 _price) external;
}
