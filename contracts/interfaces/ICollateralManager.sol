// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICollateralManager
 * @dev Interface for collateral management
 */
interface ICollateralManager {
    /**
     * @dev Lock collateral for a position
     * @param _user Address of the user
     * @param _amount Amount of collateral to lock
     */
    function lockCollateral(address _user, uint256 _amount) external;
    
    /**
     * @dev Release collateral back to user
     * @param _user Address of the user
     * @param _amount Amount of collateral to release
     */
    function releaseCollateral(address _user, uint256 _amount) external;
    
    /**
     * @dev Get available collateral for a user
     * @param _user Address of the user
     * @return amount Available collateral amount
     */
    function getAvailableCollateral(address _user) external view returns (uint256);
}
