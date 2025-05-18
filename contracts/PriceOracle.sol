// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPriceOracle.sol";

/**
 * @title PriceOracle
 * @dev Oracle for price feeds
 */
contract PriceOracle is IPriceOracle, Ownable {
    // State variables
    mapping(string => uint256) public prices;
    mapping(address => bool) public authorizedFeeders;
    
    // Events
    event PriceUpdated(string indexed marketSymbol, uint256 price);
    event FeederAuthorized(address indexed feeder);
    event FeederDeauthorized(address indexed feeder);
    
    // Modifiers
    modifier onlyAuthorizedFeeder() {
        require(authorizedFeeders[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }
    
    /**
     * @dev Constructor
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Get the current price for a market
     * @param _marketSymbol Symbol of the market (e.g., "ETH-USD")
     * @return Current price with 18 decimals
     */
    function getPrice(string memory _marketSymbol) external view override returns (uint256) {
        uint256 price = prices[_marketSymbol];
        require(price > 0, "Price not available");
        return price;
    }
    
    /**
     * @dev Update the price for a market
     * @param _marketSymbol Symbol of the market
     * @param _price New price with 18 decimals
     */
    function updatePrice(string memory _marketSymbol, uint256 _price) external override onlyAuthorizedFeeder {
        require(_price > 0, "Price must be greater than 0");
        prices[_marketSymbol] = _price;
        emit PriceUpdated(_marketSymbol, _price);
    }
    
    /**
     * @dev Authorize a price feeder
     * @param _feeder Address of the feeder
     */
    function authorizeFeeder(address _feeder) external onlyOwner {
        require(_feeder != address(0), "Invalid feeder address");
        authorizedFeeders[_feeder] = true;
        emit FeederAuthorized(_feeder);
    }
    
    /**
     * @dev Deauthorize a price feeder
     * @param _feeder Address of the feeder
     */
    function deauthorizeFeeder(address _feeder) external onlyOwner {
        authorizedFeeders[_feeder] = false;
        emit FeederDeauthorized(_feeder);
    }
}
