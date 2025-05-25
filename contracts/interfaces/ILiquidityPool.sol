// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ILiquidityPool
 * @dev Interface for liquidity pool contracts
 */
interface ILiquidityPool {
    /**
     * @dev Get total liquidity in the pool
     * @return Total liquidity amount
     */
    function totalLiquidity() external view returns (uint256);
    
    /**
     * @dev Get current utilization rate
     * @return Current utilization rate
     */
    function utilizationRate() external view returns (uint256);
    
    /**
     * @dev Add liquidity to the pool
     * @param _amount Amount of collateral tokens to add
     */
    function addLiquidity(uint256 _amount) external;
    
    /**
     * @dev Remove liquidity from the pool
     * @param _amount Amount of collateral tokens to remove
     */
    function removeLiquidity(uint256 _amount) external;
    
    /**
     * @dev Collect fees from trading
     * @param _amount Amount of fees to collect
     */
    function collectFees(uint256 _amount) external;
    
    /**
     * @dev Claim accrued rewards
     */
    function claimRewards() external;
    
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
    );
    
    /**
     * @dev Update utilization rate
     * @param _newRate New utilization rate (scaled by PRECISION)
     */
    function updateUtilizationRate(uint256 _newRate) external;
    
    /**
     * @dev Use insurance fund to cover losses
     * @param _amount Amount to use from insurance fund
     * @return success Whether the operation was successful
     */
    function useInsuranceFund(uint256 _amount) external returns (bool);
}
