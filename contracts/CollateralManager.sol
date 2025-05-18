// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ICollateralManager.sol";

/**
 * @title CollateralManager
 * @dev Manages collateral for perpetual trading positions
 */
contract CollateralManager is ICollateralManager, Ownable {
    // State variables
    IERC20 public collateralToken;
    mapping(address => uint256) public lockedCollateral;
    mapping(address => uint256) public userBalance;
    mapping(address => bool) public authorizedMarkets;
    
    // Events
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event CollateralLocked(address indexed user, uint256 amount);
    event CollateralReleased(address indexed user, uint256 amount);
    event MarketAuthorized(address indexed market);
    event MarketDeauthorized(address indexed market);
    
    // Modifiers
    modifier onlyAuthorizedMarket() {
        require(authorizedMarkets[msg.sender], "Not an authorized market");
        _;
    }
    
    /**
     * @dev Constructor
     * @param _collateralToken Address of the ERC20 token used as collateral
     */
    constructor(address _collateralToken) Ownable(msg.sender) {
        collateralToken = IERC20(_collateralToken);
    }
    
    /**
     * @dev Deposit collateral into the system
     * @param _amount Amount of collateral to deposit
     */
    function depositCollateral(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to this contract
        require(collateralToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        
        // Update user balance
        userBalance[msg.sender] += _amount;
        
        emit CollateralDeposited(msg.sender, _amount);
    }
    
    /**
     * @dev Withdraw available collateral from the system
     * @param _amount Amount of collateral to withdraw
     */
    function withdrawCollateral(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        
        uint256 availableAmount = userBalance[msg.sender] - lockedCollateral[msg.sender];
        require(availableAmount >= _amount, "Insufficient available collateral");
        
        // Update user balance
        userBalance[msg.sender] -= _amount;
        
        // Transfer tokens to user
        require(collateralToken.transfer(msg.sender, _amount), "Transfer failed");
        
        emit CollateralWithdrawn(msg.sender, _amount);
    }
    
    /**
     * @dev Lock collateral for a position (called by authorized markets)
     * @param _user Address of the user
     * @param _amount Amount of collateral to lock
     */
    function lockCollateral(address _user, uint256 _amount) external override onlyAuthorizedMarket {
        require(_amount > 0, "Amount must be greater than 0");
        
        uint256 availableAmount = userBalance[_user] - lockedCollateral[_user];
        require(availableAmount >= _amount, "Insufficient available collateral");
        
        // Lock collateral
        lockedCollateral[_user] += _amount;
        
        emit CollateralLocked(_user, _amount);
    }
    
    /**
     * @dev Release collateral back to user (called by authorized markets)
     * @param _user Address of the user
     * @param _amount Amount of collateral to release
     */
    function releaseCollateral(address _user, uint256 _amount) external override onlyAuthorizedMarket {
        require(_amount > 0, "Amount must be greater than 0");
        require(lockedCollateral[_user] >= _amount, "Insufficient locked collateral");
        
        // Release collateral
        lockedCollateral[_user] -= _amount;
        
        emit CollateralReleased(_user, _amount);
    }
    
    /**
     * @dev Get available collateral for a user
     * @param _user Address of the user
     * @return Available collateral amount
     */
    function getAvailableCollateral(address _user) external view override returns (uint256) {
        return userBalance[_user] - lockedCollateral[_user];
    }
    
    /**
     * @dev Authorize a market to lock/release collateral
     * @param _market Address of the market contract
     */
    function authorizeMarket(address _market) external onlyOwner {
        require(_market != address(0), "Invalid market address");
        authorizedMarkets[_market] = true;
        emit MarketAuthorized(_market);
    }
    
    /**
     * @dev Deauthorize a market
     * @param _market Address of the market contract
     */
    function deauthorizeMarket(address _market) external onlyOwner {
        authorizedMarkets[_market] = false;
        emit MarketDeauthorized(_market);
    }
}
