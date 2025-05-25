// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IPriceOracle.sol";
import "./interfaces/ICollateralManager.sol";
import "./interfaces/ILiquidityPool.sol";

/**
 * @title PerpetualMarket
 * @dev Core contract for perpetual futures trading
 */
contract PerpetualMarket {
    // Constants
    uint256 public constant PRECISION = 1e18;
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80% collateral ratio
    uint256 public constant MAX_LEVERAGE = 20; // 20x max leverage

    // Structs
    struct Position {
        uint256 size;        // Position size in USD value
        uint256 margin;      // Margin amount in collateral token
        uint256 entryPrice;  // Entry price of the position
        bool isLong;         // Long (true) or Short (false)
        uint256 lastFundingPayment; // Timestamp of last funding payment
    }

    // State variables
    IPriceOracle public oracle;
    ICollateralManager public collateralManager;
    ILiquidityPool public liquidityPool;
    mapping(address => Position) public positions;
    uint256 public openInterestLong;
    uint256 public openInterestShort;
    uint256 public fundingRate;
    uint256 public lastFundingTime;
    uint256 public fundingInterval;
    string public marketSymbol;
    bool public tradingEnabled;
    uint256 public tradingFee; // Fee percentage (scaled by PRECISION)

    // Events
    event PositionOpened(address indexed trader, uint256 size, uint256 margin, bool isLong, uint256 price);
    event PositionClosed(address indexed trader, uint256 size, uint256 margin, bool isLong, uint256 price, int256 pnl);
    event PositionLiquidated(address indexed trader, uint256 size, uint256 margin, bool isLong, uint256 price);
    event FundingRateUpdated(uint256 newFundingRate);
    event MarketPaused();
    event MarketResumed();

    // Modifiers
    modifier onlyWhenTradingEnabled() {
        require(tradingEnabled, "Trading is currently disabled");
        _;
    }

    modifier positionExists() {
        require(positions[msg.sender].size > 0, "No position exists");
        _;
    }

    /**
     * @dev Constructor
     * @param _oracle Address of the price oracle
     * @param _collateralManager Address of the collateral manager
     * @param _liquidityPool Address of the liquidity pool
     * @param _marketSymbol Symbol of the market (e.g., "ETH-USD")
     * @param _fundingInterval Interval for funding rate updates (in seconds)
     * @param _tradingFee Trading fee percentage (scaled by PRECISION)
     */
    constructor(
        address _oracle,
        address _collateralManager,
        address _liquidityPool,
        string memory _marketSymbol,
        uint256 _fundingInterval,
        uint256 _tradingFee
    ) {
        oracle = IPriceOracle(_oracle);
        collateralManager = ICollateralManager(_collateralManager);
        liquidityPool = ILiquidityPool(_liquidityPool);
        marketSymbol = _marketSymbol;
        fundingInterval = _fundingInterval;
        tradingFee = _tradingFee;
        lastFundingTime = block.timestamp;
        tradingEnabled = true;
    }

    /**
     * @dev Open a new position
     * @param _margin Amount of collateral to use as margin
     * @param _leverage Leverage multiplier (1-20x)
     * @param _isLong Whether position is long (true) or short (false)
     */
    function openPosition(
        uint256 _margin,
        uint256 _leverage,
        bool _isLong
    ) external onlyWhenTradingEnabled {
        require(_leverage > 0 && _leverage <= MAX_LEVERAGE, "Invalid leverage");
        require(_margin > 0, "Margin must be greater than 0");
        require(positions[msg.sender].size == 0, "Position already exists");

        // Get current price from oracle
        uint256 currentPrice = oracle.getPrice(marketSymbol);
        require(currentPrice > 0, "Invalid price");

        // Calculate position size
        uint256 positionSize = _margin * _leverage;

        // Calculate and collect trading fee
        uint256 tradingFeeAmount = (positionSize * tradingFee) / PRECISION;

        // Transfer collateral from user (including fee)
        collateralManager.lockCollateral(msg.sender, _margin);

        // Send fee to liquidity pool
        if (tradingFeeAmount > 0) {
            liquidityPool.collectFees(tradingFeeAmount);
        }

        // Create position
        positions[msg.sender] = Position({
            size: positionSize,
            margin: _margin,
            entryPrice: currentPrice,
            isLong: _isLong,
            lastFundingPayment: block.timestamp
        });

        // Update open interest
        if (_isLong) {
            openInterestLong += positionSize;
        } else {
            openInterestShort += positionSize;
        }

        // Update liquidity pool utilization rate
        uint256 totalOpenInterest = openInterestLong + openInterestShort;
        uint256 totalLiquidity = liquidityPool.totalLiquidity();
        uint256 utilizationRate = totalLiquidity > 0
            ? (totalOpenInterest * PRECISION) / (totalLiquidity * 2)
            : 0;
        liquidityPool.updateUtilizationRate(utilizationRate);

        // Apply funding if needed
        _applyFunding();

        emit PositionOpened(msg.sender, positionSize, _margin, _isLong, currentPrice);
    }

    /**
     * @dev Close an existing position
     */
    function closePosition() external positionExists {
        Position memory position = positions[msg.sender];

        // Get current price from oracle
        uint256 currentPrice = oracle.getPrice(marketSymbol);
        require(currentPrice > 0, "Invalid price");

        // Calculate PnL
        int256 pnl = _calculatePnL(position, currentPrice);

        // Apply funding
        _applyFunding();

        // Update open interest
        if (position.isLong) {
            openInterestLong -= position.size;
        } else {
            openInterestShort -= position.size;
        }

        // Calculate and collect trading fee
        uint256 tradingFeeAmount = (position.size * tradingFee) / PRECISION;

        // Send fee to liquidity pool
        if (tradingFeeAmount > 0) {
            liquidityPool.collectFees(tradingFeeAmount);
        }

        // Return collateral to user (including PnL, minus fee)
        if (pnl >= 0) {
            uint256 amountToReturn = position.margin + uint256(pnl);
            if (amountToReturn > tradingFeeAmount) {
                collateralManager.releaseCollateral(msg.sender, amountToReturn - tradingFeeAmount);
            }
        } else {
            uint256 remainingMargin = position.margin > uint256(-pnl) ? position.margin - uint256(-pnl) : 0;
            if (remainingMargin > tradingFeeAmount) {
                collateralManager.releaseCollateral(msg.sender, remainingMargin - tradingFeeAmount);
            }
        }

        // Update liquidity pool utilization rate
        uint256 totalOpenInterest = openInterestLong + openInterestShort;
        uint256 totalLiquidity = liquidityPool.totalLiquidity();
        uint256 utilizationRate = totalLiquidity > 0 && totalOpenInterest > 0
            ? (totalOpenInterest * PRECISION) / (totalLiquidity * 2)
            : 0;
        liquidityPool.updateUtilizationRate(utilizationRate);

        emit PositionClosed(msg.sender, position.size, position.margin, position.isLong, currentPrice, pnl);

        // Delete position
        delete positions[msg.sender];
    }

    /**
     * @dev Calculate profit/loss for a position
     * @param _position The position to calculate PnL for
     * @param _currentPrice Current market price
     * @return pnl Profit (positive) or loss (negative)
     */
    function _calculatePnL(Position memory _position, uint256 _currentPrice) internal pure returns (int256) {
        if (_position.isLong) {
            // For long positions: (currentPrice - entryPrice) * size / entryPrice
            if (_currentPrice > _position.entryPrice) {
                return int256((_currentPrice - _position.entryPrice) * _position.size / _position.entryPrice);
            } else {
                return -int256((_position.entryPrice - _currentPrice) * _position.size / _position.entryPrice);
            }
        } else {
            // For short positions: (entryPrice - currentPrice) * size / entryPrice
            if (_position.entryPrice > _currentPrice) {
                return int256((_position.entryPrice - _currentPrice) * _position.size / _position.entryPrice);
            } else {
                return -int256((_currentPrice - _position.entryPrice) * _position.size / _position.entryPrice);
            }
        }
    }

    /**
     * @dev Apply funding payments
     */
    function _applyFunding() internal {
        // Update funding rate if needed
        if (block.timestamp >= lastFundingTime + fundingInterval) {
            _updateFundingRate();
        }
    }

    /**
     * @dev Update the funding rate based on market imbalance
     */
    function _updateFundingRate() internal {
        if (openInterestLong == 0 && openInterestShort == 0) {
            fundingRate = 0;
        } else {
            // Calculate imbalance between longs and shorts
            int256 imbalance;
            if (openInterestLong > openInterestShort) {
                imbalance = int256((openInterestLong - openInterestShort) * PRECISION / (openInterestLong + openInterestShort));
            } else {
                imbalance = -int256((openInterestShort - openInterestLong) * PRECISION / (openInterestLong + openInterestShort));
            }

            // Funding rate is proportional to imbalance (simplified)
            fundingRate = uint256(imbalance > 0 ? imbalance : -imbalance) / 100;
        }

        lastFundingTime = block.timestamp;
        emit FundingRateUpdated(fundingRate);
    }

    /**
     * @dev Liquidate an underwater position
     * @param _trader Address of the trader to liquidate
     */
    function liquidatePosition(address _trader) external {
        Position memory position = positions[_trader];
        require(position.size > 0, "No position exists");

        uint256 currentPrice = oracle.getPrice(marketSymbol);
        require(currentPrice > 0, "Invalid price");

        int256 pnl = _calculatePnL(position, currentPrice);

        // Check if position is underwater (margin ratio below liquidation threshold)
        uint256 remainingMargin = pnl < 0 ? (position.margin > uint256(-pnl) ? position.margin - uint256(-pnl) : 0) : position.margin;
        uint256 marginRatio = remainingMargin * 100 / position.size;

        require(marginRatio < LIQUIDATION_THRESHOLD, "Position not liquidatable");

        // Update open interest
        if (position.isLong) {
            openInterestLong -= position.size;
        } else {
            openInterestShort -= position.size;
        }

        // Calculate liquidation fee (1% of position size, but limited to available margin)
        uint256 liquidationFee = position.size / 100;
        if (liquidationFee > position.margin) {
            liquidationFee = position.margin;
        }

        // Calculate deficit (how much the position is underwater)
        uint256 deficit = pnl < 0 && uint256(-pnl) > position.margin
            ? uint256(-pnl) - position.margin
            : 0;

        // Use insurance fund to cover deficit if needed
        if (deficit > 0) {
            liquidityPool.useInsuranceFund(deficit);
        }

        // Release remaining collateral from the liquidated position
        uint256 remainingCollateral = position.margin;
        if (remainingCollateral > liquidationFee) {
            // Release the liquidation fee portion to the liquidator
            // Note: In a real implementation, this would transfer tokens directly
            // For now, we'll just release the remaining collateral back to the position owner
            collateralManager.releaseCollateral(_trader, remainingCollateral - liquidationFee);
        }

        // Update liquidity pool utilization rate
        uint256 totalOpenInterest = openInterestLong + openInterestShort;
        uint256 totalLiquidity = liquidityPool.totalLiquidity();
        uint256 utilizationRate = totalLiquidity > 0 && totalOpenInterest > 0
            ? (totalOpenInterest * PRECISION) / (totalLiquidity * 2)
            : 0;
        liquidityPool.updateUtilizationRate(utilizationRate);

        emit PositionLiquidated(_trader, position.size, position.margin, position.isLong, currentPrice);

        // Delete position
        delete positions[_trader];
    }

    /**
     * @dev Pause trading
     */
    function pauseTrading() external {
        // In production, add access control
        tradingEnabled = false;
        emit MarketPaused();
    }

    /**
     * @dev Resume trading
     */
    function resumeTrading() external {
        // In production, add access control
        tradingEnabled = true;
        emit MarketResumed();
    }
}
