// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IPriceOracle.sol";

/**
 * @title LiquidityPool
 * @dev Contract for managing liquidity in the perpetual DEX
 */
contract LiquidityPool is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // State variables
    IERC20 public collateralToken;
    IPriceOracle public priceOracle;
    
    uint256 public constant PRECISION = 1e18;
    uint256 public totalLiquidity;
    uint256 public utilizationRate;
    uint256 public feeRate = 5 * 1e15; // 0.5% fee
    uint256 public insuranceFundRate = 1 * 1e16; // 1% to insurance fund
    uint256 public insuranceFund;
    
    // Liquidity provider data
    struct LiquidityProvider {
        uint256 amount;
        uint256 sharePercentage;
        uint256 lastRewardTimestamp;
        uint256 rewardsAccrued;
    }
    
    mapping(address => LiquidityProvider) public liquidityProviders;
    address[] public providerAddresses;
    
    // Events
    event LiquidityAdded(address indexed provider, uint256 amount, uint256 sharePercentage);
    event LiquidityRemoved(address indexed provider, uint256 amount);
    event FeeCollected(uint256 amount, uint256 insuranceAmount);
    event RewardPaid(address indexed provider, uint256 amount);
    event UtilizationRateUpdated(uint256 newRate);
    event FeeRateUpdated(uint256 newRate);
    event InsuranceFundRateUpdated(uint256 newRate);
    
    /**
     * @dev Constructor
     * @param _collateralToken Address of the ERC20 token used as collateral
     * @param _priceOracle Address of the price oracle
     */
    constructor(address _collateralToken, address _priceOracle) Ownable(msg.sender) {
        collateralToken = IERC20(_collateralToken);
        priceOracle = IPriceOracle(_priceOracle);
    }
    
    /**
     * @dev Add liquidity to the pool
     * @param _amount Amount of collateral tokens to add
     */
    function addLiquidity(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to this contract
        collateralToken.safeTransferFrom(msg.sender, address(this), _amount);
        
        // Calculate share percentage
        uint256 sharePercentage;
        if (totalLiquidity == 0) {
            sharePercentage = PRECISION; // 100% for first provider
        } else {
            sharePercentage = (_amount * PRECISION) / totalLiquidity;
        }
        
        // Update liquidity provider data
        if (liquidityProviders[msg.sender].amount == 0) {
            providerAddresses.push(msg.sender);
            liquidityProviders[msg.sender] = LiquidityProvider({
                amount: _amount,
                sharePercentage: sharePercentage,
                lastRewardTimestamp: block.timestamp,
                rewardsAccrued: 0
            });
        } else {
            // Pay out any pending rewards first
            _payRewards(msg.sender);
            
            // Update provider data
            liquidityProviders[msg.sender].amount += _amount;
            liquidityProviders[msg.sender].sharePercentage = 
                (liquidityProviders[msg.sender].amount * PRECISION) / (totalLiquidity + _amount);
            liquidityProviders[msg.sender].lastRewardTimestamp = block.timestamp;
        }
        
        // Update total liquidity
        totalLiquidity += _amount;
        
        // Recalculate all share percentages
        _recalculateShares();
        
        emit LiquidityAdded(msg.sender, _amount, liquidityProviders[msg.sender].sharePercentage);
    }
    
    /**
     * @dev Remove liquidity from the pool
     * @param _amount Amount of collateral tokens to remove
     */
    function removeLiquidity(uint256 _amount) external nonReentrant {
        LiquidityProvider storage provider = liquidityProviders[msg.sender];
        require(provider.amount >= _amount, "Insufficient liquidity");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Check if there's enough available liquidity (not being used by traders)
        uint256 availableLiquidity = totalLiquidity * (PRECISION - utilizationRate) / PRECISION;
        require(availableLiquidity >= _amount, "Insufficient available liquidity");
        
        // Pay out any pending rewards first
        _payRewards(msg.sender);
        
        // Update provider data
        provider.amount -= _amount;
        
        // Update total liquidity
        totalLiquidity -= _amount;
        
        // Recalculate all share percentages
        _recalculateShares();
        
        // Remove provider if they have no more liquidity
        if (provider.amount == 0) {
            _removeProvider(msg.sender);
        }
        
        // Transfer tokens to user
        collateralToken.safeTransfer(msg.sender, _amount);
        
        emit LiquidityRemoved(msg.sender, _amount);
    }
    
    /**
     * @dev Collect fees from trading
     * @param _amount Amount of fees to collect
     */
    function collectFees(uint256 _amount) external {
        // Only callable by PerpetualMarket contract
        // In production, add access control
        
        require(_amount > 0, "Amount must be greater than 0");
        
        // Calculate insurance fund amount
        uint256 insuranceAmount = (_amount * insuranceFundRate) / PRECISION;
        uint256 liquidityAmount = _amount - insuranceAmount;
        
        // Add to insurance fund
        insuranceFund += insuranceAmount;
        
        // Distribute remaining fees to liquidity providers
        for (uint256 i = 0; i < providerAddresses.length; i++) {
            address providerAddress = providerAddresses[i];
            LiquidityProvider storage provider = liquidityProviders[providerAddress];
            
            uint256 providerReward = (liquidityAmount * provider.sharePercentage) / PRECISION;
            provider.rewardsAccrued += providerReward;
        }
        
        emit FeeCollected(_amount, insuranceAmount);
    }
    
    /**
     * @dev Claim accrued rewards
     */
    function claimRewards() external nonReentrant {
        _payRewards(msg.sender);
    }
    
    /**
     * @dev Get provider info
     * @param _provider Address of the liquidity provider
     * @return amount Amount of liquidity provided
     * @return sharePercentage Share percentage (scaled by PRECISION)
     * @return rewardsAccrued Rewards accrued but not yet claimed
     */
    function getProviderInfo(address _provider) external view returns (
        uint256 amount,
        uint256 sharePercentage,
        uint256 rewardsAccrued
    ) {
        LiquidityProvider memory provider = liquidityProviders[_provider];
        return (provider.amount, provider.sharePercentage, provider.rewardsAccrued);
    }
    
    /**
     * @dev Update utilization rate
     * @param _newRate New utilization rate (scaled by PRECISION)
     */
    function updateUtilizationRate(uint256 _newRate) external {
        // Only callable by PerpetualMarket contract
        // In production, add access control
        
        require(_newRate <= PRECISION, "Rate cannot exceed 100%");
        utilizationRate = _newRate;
        
        emit UtilizationRateUpdated(_newRate);
    }
    
    /**
     * @dev Update fee rate
     * @param _newRate New fee rate (scaled by PRECISION)
     */
    function updateFeeRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 5 * 1e16, "Fee rate cannot exceed 5%");
        feeRate = _newRate;
        
        emit FeeRateUpdated(_newRate);
    }
    
    /**
     * @dev Update insurance fund rate
     * @param _newRate New insurance fund rate (scaled by PRECISION)
     */
    function updateInsuranceFundRate(uint256 _newRate) external onlyOwner {
        require(_newRate <= 2 * 1e16, "Insurance fund rate cannot exceed 2%");
        insuranceFundRate = _newRate;
        
        emit InsuranceFundRateUpdated(_newRate);
    }
    
    /**
     * @dev Use insurance fund to cover losses
     * @param _amount Amount to use from insurance fund
     * @return success Whether the operation was successful
     */
    function useInsuranceFund(uint256 _amount) external returns (bool) {
        // Only callable by PerpetualMarket contract
        // In production, add access control
        
        if (_amount > insuranceFund) {
            return false;
        }
        
        insuranceFund -= _amount;
        return true;
    }
    
    /**
     * @dev Internal function to pay rewards to a provider
     * @param _provider Address of the liquidity provider
     */
    function _payRewards(address _provider) internal {
        LiquidityProvider storage provider = liquidityProviders[_provider];
        if (provider.rewardsAccrued > 0) {
            uint256 rewardAmount = provider.rewardsAccrued;
            provider.rewardsAccrued = 0;
            
            // Transfer rewards to provider
            collateralToken.safeTransfer(_provider, rewardAmount);
            
            emit RewardPaid(_provider, rewardAmount);
        }
    }
    
    /**
     * @dev Internal function to recalculate all share percentages
     */
    function _recalculateShares() internal {
        for (uint256 i = 0; i < providerAddresses.length; i++) {
            address providerAddress = providerAddresses[i];
            LiquidityProvider storage provider = liquidityProviders[providerAddress];
            
            provider.sharePercentage = (provider.amount * PRECISION) / totalLiquidity;
        }
    }
    
    /**
     * @dev Internal function to remove a provider from the array
     * @param _provider Address of the liquidity provider to remove
     */
    function _removeProvider(address _provider) internal {
        for (uint256 i = 0; i < providerAddresses.length; i++) {
            if (providerAddresses[i] == _provider) {
                // Replace with the last element and pop
                providerAddresses[i] = providerAddresses[providerAddresses.length - 1];
                providerAddresses.pop();
                break;
            }
        }
    }
}
