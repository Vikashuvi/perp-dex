// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ICollateralManager.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockCollateralManager is ICollateralManager {
    IERC20 public collateralToken;
    mapping(address => uint256) public userBalance;
    mapping(address => uint256) public lockedCollateral;
    mapping(address => bool) public authorizedMarkets;

    // Events
    event CollateralDeposited(address indexed user, uint256 amount);
    event CollateralWithdrawn(address indexed user, uint256 amount);
    event CollateralLocked(address indexed user, uint256 amount);
    event CollateralReleased(address indexed user, uint256 amount);
    event MarketAuthorized(address indexed market);
    event MarketDeauthorized(address indexed market);

    constructor(address _collateralToken) {
        collateralToken = IERC20(_collateralToken);
    }

    function depositCollateral(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");

        // Transfer tokens from user to this contract
        collateralToken.transferFrom(msg.sender, address(this), _amount);

        // Update user balance
        userBalance[msg.sender] += _amount;

        emit CollateralDeposited(msg.sender, _amount);
    }

    function withdrawCollateral(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(userBalance[msg.sender] >= _amount, "Insufficient balance");

        // Check available collateral
        uint256 availableCollateral = userBalance[msg.sender] - lockedCollateral[msg.sender];
        require(availableCollateral >= _amount, "Insufficient available collateral");

        // Update user balance
        userBalance[msg.sender] -= _amount;

        // Transfer tokens to user
        collateralToken.transfer(msg.sender, _amount);

        emit CollateralWithdrawn(msg.sender, _amount);
    }

    function lockCollateral(address _user, uint256 _amount) external override {
        // In mock, we don't need to check authorization
        require(_amount > 0, "Amount must be greater than 0");

        uint256 availableCollateral = userBalance[_user] - lockedCollateral[_user];
        require(availableCollateral >= _amount, "Insufficient available collateral");

        lockedCollateral[_user] += _amount;

        emit CollateralLocked(_user, _amount);
    }

    function releaseCollateral(address _user, uint256 _amount) external override {
        // In mock, we don't need to check authorization
        require(_amount > 0, "Amount must be greater than 0");
        require(lockedCollateral[_user] >= _amount, "Insufficient locked collateral");

        // Release collateral
        lockedCollateral[_user] -= _amount;

        emit CollateralReleased(_user, _amount);
    }

    function getAvailableCollateral(address _user) external view override returns (uint256) {
        return userBalance[_user] - lockedCollateral[_user];
    }

    function authorizeMarket(address _market) external {
        require(_market != address(0), "Invalid market address");
        authorizedMarkets[_market] = true;
        emit MarketAuthorized(_market);
    }

    function deauthorizeMarket(address _market) external {
        authorizedMarkets[_market] = false;
        emit MarketDeauthorized(_market);
    }
}
