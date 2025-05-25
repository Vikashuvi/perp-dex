// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ILiquidityPool.sol";

contract MockLiquidityPool is ILiquidityPool {
    uint256 private _totalLiquidity = 1000000 * 1e18; // 1M default liquidity
    uint256 private _utilizationRate;
    uint256 private _insuranceFund = 100000 * 1e18; // 100K default insurance fund

    function totalLiquidity() external view override returns (uint256) {
        return _totalLiquidity;
    }

    function utilizationRate() external view override returns (uint256) {
        return _utilizationRate;
    }

    function addLiquidity(uint256 _amount) external override {
        // Mock implementation - just update total liquidity
        _totalLiquidity += _amount;
    }

    function removeLiquidity(uint256 _amount) external override {
        // Mock implementation - just update total liquidity
        require(_totalLiquidity >= _amount, "Insufficient liquidity");
        _totalLiquidity -= _amount;
    }

    function collectFees(uint256 amount) external override {
        // Mock implementation - just emit event or do nothing
    }

    function claimRewards() external override {
        // Mock implementation - do nothing
    }

    function getProviderInfo(address _provider) external view override returns (
        uint256 amount,
        uint256 sharePercentage,
        uint256 rewardsAccrued
    ) {
        // Mock implementation - return default values
        return (0, 0, 0);
    }

    function updateUtilizationRate(uint256 newRate) external override {
        _utilizationRate = newRate;
    }

    function useInsuranceFund(uint256 amount) external override returns (bool) {
        if (_insuranceFund >= amount) {
            _insuranceFund -= amount;
            return true;
        }
        return false;
    }

    function getInsuranceFund() external view returns (uint256) {
        return _insuranceFund;
    }

    function setTotalLiquidity(uint256 amount) external {
        _totalLiquidity = amount;
    }

    function setInsuranceFund(uint256 amount) external {
        _insuranceFund = amount;
    }
}