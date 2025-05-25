import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// Import Chai extensions for Hardhat
import "@nomicfoundation/hardhat-chai-matchers";

describe("PerpetualMarket", function () {
  // Test fixtures
  async function deployPerpetualMarketFixture() {
    const [owner, trader1, trader2, liquidator] = await ethers.getSigners();

    // Deploy mock ERC20 token for collateral
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const collateralToken = await MockERC20.deploy("USDC", "USDC", 6);
    await collateralToken.waitForDeployment();

    // Deploy PriceOracle mock
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const priceOracle = await MockPriceOracle.deploy();
    await priceOracle.waitForDeployment();

    // Deploy CollateralManager
    const CollateralManager = await ethers.getContractFactory("CollateralManager");
    const collateralManager = await CollateralManager.deploy(await collateralToken.getAddress());
    await collateralManager.waitForDeployment();

    // Deploy LiquidityPool mock
    const MockLiquidityPool = await ethers.getContractFactory("MockLiquidityPool");
    const liquidityPool = await MockLiquidityPool.deploy();
    await liquidityPool.waitForDeployment();

    // Deploy PerpetualMarket
    const PerpetualMarket = await ethers.getContractFactory("PerpetualMarket");
    const perpetualMarket = await PerpetualMarket.deploy(
      await priceOracle.getAddress(),
      await collateralManager.getAddress(),
      await liquidityPool.getAddress(),
      "ETH-USD",
      3600, // 1 hour funding interval
      ethers.parseEther("0.001") // 0.1% trading fee
    );
    await perpetualMarket.waitForDeployment();

    // Authorize the perpetual market in collateral manager
    await collateralManager.authorizeMarket(await perpetualMarket.getAddress());

    // Set initial price in oracle
    await priceOracle.setPrice("ETH-USD", ethers.parseEther("2000")); // $2000

    // Mint tokens to traders
    const initialBalance = ethers.parseUnits("10000", 6); // 10,000 USDC
    await collateralToken.mint(trader1.address, initialBalance);
    await collateralToken.mint(trader2.address, initialBalance);

    // Approve collateral manager to spend tokens
    await collateralToken.connect(trader1).approve(await collateralManager.getAddress(), initialBalance);
    await collateralToken.connect(trader2).approve(await collateralManager.getAddress(), initialBalance);

    // Deposit collateral
    await collateralManager.connect(trader1).depositCollateral(ethers.parseUnits("5000", 6));
    await collateralManager.connect(trader2).depositCollateral(ethers.parseUnits("5000", 6));

    return {
      perpetualMarket,
      collateralManager,
      priceOracle,
      liquidityPool,
      collateralToken,
      owner,
      trader1,
      trader2,
      liquidator
    };
  }

  describe("Deployment", function () {
    it("Should set the correct initial values", async function () {
      const { perpetualMarket, priceOracle, collateralManager, liquidityPool } = await loadFixture(deployPerpetualMarketFixture);

      expect(await perpetualMarket.oracle()).to.equal(await priceOracle.getAddress());
      expect(await perpetualMarket.collateralManager()).to.equal(await collateralManager.getAddress());
      expect(await perpetualMarket.liquidityPool()).to.equal(await liquidityPool.getAddress());
      expect(await perpetualMarket.marketSymbol()).to.equal("ETH-USD");
      expect(await perpetualMarket.tradingEnabled()).to.be.true;
      expect(await perpetualMarket.fundingInterval()).to.equal(3600);
      expect(await perpetualMarket.tradingFee()).to.equal(ethers.parseEther("0.001"));
    });

    it("Should have correct constants", async function () {
      const { perpetualMarket } = await loadFixture(deployPerpetualMarketFixture);

      expect(await perpetualMarket.PRECISION()).to.equal(ethers.parseEther("1"));
      expect(await perpetualMarket.LIQUIDATION_THRESHOLD()).to.equal(80);
      expect(await perpetualMarket.MAX_LEVERAGE()).to.equal(20);
    });
  });

  describe("Position Opening", function () {
    it("Should open a long position successfully", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 5;

      await expect(perpetualMarket.connect(trader1).openPosition(margin, leverage, true))
        .to.emit(perpetualMarket, "PositionOpened")
        .withArgs(trader1.address, margin * BigInt(leverage), margin, true, ethers.parseEther("2000"));

      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(margin * BigInt(leverage));
      expect(position.margin).to.equal(margin);
      expect(position.entryPrice).to.equal(ethers.parseEther("2000"));
      expect(position.isLong).to.be.true;
    });

    it("Should open a short position successfully", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6); // 1000 USDC
      const leverage = 3;

      await expect(perpetualMarket.connect(trader1).openPosition(margin, leverage, false))
        .to.emit(perpetualMarket, "PositionOpened")
        .withArgs(trader1.address, margin * BigInt(leverage), margin, false, ethers.parseEther("2000"));

      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(margin * BigInt(leverage));
      expect(position.margin).to.equal(margin);
      expect(position.entryPrice).to.equal(ethers.parseEther("2000"));
      expect(position.isLong).to.be.false;
    });

    it("Should update open interest correctly", async function () {
      const { perpetualMarket, trader1, trader2 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Open long position
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);
      expect(await perpetualMarket.openInterestLong()).to.equal(margin * BigInt(leverage));
      expect(await perpetualMarket.openInterestShort()).to.equal(0);

      // Open short position
      await perpetualMarket.connect(trader2).openPosition(margin, leverage, false);
      expect(await perpetualMarket.openInterestLong()).to.equal(margin * BigInt(leverage));
      expect(await perpetualMarket.openInterestShort()).to.equal(margin * BigInt(leverage));
    });

    it("Should revert if leverage is invalid", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);

      await expect(perpetualMarket.connect(trader1).openPosition(margin, 0, true))
        .to.be.revertedWith("Invalid leverage");

      await expect(perpetualMarket.connect(trader1).openPosition(margin, 21, true))
        .to.be.revertedWith("Invalid leverage");
    });

    it("Should revert if margin is zero", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      await expect(perpetualMarket.connect(trader1).openPosition(0, 5, true))
        .to.be.revertedWith("Margin must be greater than 0");
    });

    it("Should revert if position already exists", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      await expect(perpetualMarket.connect(trader1).openPosition(margin, leverage, true))
        .to.be.revertedWith("Position already exists");
    });

    it("Should revert if trading is disabled", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      await perpetualMarket.pauseTrading();

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      await expect(perpetualMarket.connect(trader1).openPosition(margin, leverage, true))
        .to.be.revertedWith("Trading is currently disabled");
    });
  });

  describe("Position Closing", function () {
    it("Should close a profitable long position", async function () {
      const { perpetualMarket, priceOracle, trader1, collateralManager } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Open long position at $2000
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Price increases to $2200 (10% increase)
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("2200"));

      // Get initial collateral balance
      const initialAvailableCollateral = await collateralManager.getAvailableCollateral(trader1.address);

      // Close position
      await expect(perpetualMarket.connect(trader1).closePosition())
        .to.emit(perpetualMarket, "PositionClosed");

      // Position should be deleted
      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);

      // Check that profit was added to available collateral
      const finalAvailableCollateral = await collateralManager.getAvailableCollateral(trader1.address);
      expect(finalAvailableCollateral).to.be.gt(initialAvailableCollateral);

      // Calculate expected profit: 10% price increase * 5x leverage = 50% profit on margin
      const expectedProfit = margin * BigInt(50) / BigInt(100);
      const tradingFee = (margin * BigInt(leverage) * BigInt(ethers.parseEther("0.001")) / BigInt(ethers.parseEther("1")));

      // Check that profit is approximately correct (accounting for fees)
      expect(finalAvailableCollateral - initialAvailableCollateral).to.be.closeTo(
        margin + expectedProfit - tradingFee,
        ethers.parseUnits("10", 6) // Allow for small rounding differences
      );
    });

    it("Should close a profitable short position", async function () {
      const { perpetualMarket, priceOracle, trader1, collateralManager } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 3;

      // Open short position at $2000
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, false);

      // Price decreases to $1800 (10% decrease)
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("1800"));

      // Get initial collateral balance
      const initialAvailableCollateral = await collateralManager.getAvailableCollateral(trader1.address);

      // Close position
      await expect(perpetualMarket.connect(trader1).closePosition())
        .to.emit(perpetualMarket, "PositionClosed");

      // Position should be deleted
      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);

      // Check that profit was added to available collateral
      const finalAvailableCollateral = await collateralManager.getAvailableCollateral(trader1.address);
      expect(finalAvailableCollateral).to.be.gt(initialAvailableCollateral);

      // Calculate expected profit: 10% price decrease * 3x leverage = 30% profit on margin
      const expectedProfit = margin * BigInt(30) / BigInt(100);
      const tradingFee = (margin * BigInt(leverage) * BigInt(ethers.parseEther("0.001")) / BigInt(ethers.parseEther("1")));

      // Check that profit is approximately correct (accounting for fees)
      expect(finalAvailableCollateral - initialAvailableCollateral).to.be.closeTo(
        margin + expectedProfit - tradingFee,
        ethers.parseUnits("10", 6) // Allow for small rounding differences
      );
    });

    it("Should close a losing long position", async function () {
      const { perpetualMarket, priceOracle, trader1, collateralManager } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Open long position at $2000
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Price decreases to $1800 (10% decrease)
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("1800"));

      // Get initial collateral balance
      const initialAvailableCollateral = await collateralManager.getAvailableCollateral(trader1.address);

      // Close position
      await expect(perpetualMarket.connect(trader1).closePosition())
        .to.emit(perpetualMarket, "PositionClosed");

      // Position should be deleted
      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);

      // Check that loss was subtracted from available collateral
      const finalAvailableCollateral = await collateralManager.getAvailableCollateral(trader1.address);
      expect(finalAvailableCollateral).to.be.lt(initialAvailableCollateral);

      // Calculate expected loss: 10% price decrease * 5x leverage = 50% loss on margin
      const expectedLoss = margin * BigInt(50) / BigInt(100);
      const tradingFee = (margin * BigInt(leverage) * BigInt(ethers.parseEther("0.001")) / BigInt(ethers.parseEther("1")));

      // Check that loss is approximately correct (accounting for fees)
      expect(initialAvailableCollateral - finalAvailableCollateral).to.be.closeTo(
        expectedLoss + tradingFee,
        ethers.parseUnits("10", 6) // Allow for small rounding differences
      );
    });

    it("Should close a losing short position", async function () {
      const { perpetualMarket, priceOracle, trader1, collateralManager } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 3;

      // Open short position at $2000
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, false);

      // Price increases to $2100 (5% increase, bad for short)
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("2100"));

      // Get initial collateral balance
      const initialAvailableCollateral = await collateralManager.getAvailableCollateral(trader1.address);

      // Close position
      await expect(perpetualMarket.connect(trader1).closePosition())
        .to.emit(perpetualMarket, "PositionClosed");

      // Position should be deleted
      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);

      // Check that loss was subtracted from available collateral
      const finalAvailableCollateral = await collateralManager.getAvailableCollateral(trader1.address);
      expect(finalAvailableCollateral).to.be.lt(initialAvailableCollateral);

      // Calculate expected loss: 5% price increase * 3x leverage = 15% loss on margin
      const expectedLoss = margin * BigInt(15) / BigInt(100);
      const tradingFee = (margin * BigInt(leverage) * BigInt(ethers.parseEther("0.001")) / BigInt(ethers.parseEther("1")));

      // Check that loss is approximately correct (accounting for fees)
      expect(initialAvailableCollateral - finalAvailableCollateral).to.be.closeTo(
        expectedLoss + tradingFee,
        ethers.parseUnits("10", 6) // Allow for small rounding differences
      );
    });

    it("Should update open interest when closing", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);
      expect(await perpetualMarket.openInterestLong()).to.equal(margin * BigInt(leverage));

      await perpetualMarket.connect(trader1).closePosition();
      expect(await perpetualMarket.openInterestLong()).to.equal(0);
    });

    it("Should revert if no position exists", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      await expect(perpetualMarket.connect(trader1).closePosition())
        .to.be.revertedWith("No position exists");
    });
  });

  describe("Liquidation", function () {
    it("Should liquidate an underwater long position", async function () {
      const { perpetualMarket, priceOracle, trader1, liquidator, collateralManager } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 10; // High leverage for easier liquidation

      // Open long position at $2000
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Price drops significantly to trigger liquidation
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("1850")); // ~7.5% drop, which with 10x leverage is 75% loss

      // Check initial locked collateral
      const initialLockedCollateral = await collateralManager.lockedCollateral(trader1.address);
      expect(initialLockedCollateral).to.equal(margin);

      await expect(perpetualMarket.connect(liquidator).liquidatePosition(trader1.address))
        .to.emit(perpetualMarket, "PositionLiquidated")
        .withArgs(trader1.address, margin * BigInt(leverage), margin, true, ethers.parseEther("1850"));

      // Position should be deleted
      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);

      // Check that collateral was released (partially, after liquidation fee)
      const finalLockedCollateral = await collateralManager.lockedCollateral(trader1.address);
      expect(finalLockedCollateral).to.be.lt(initialLockedCollateral);
    });

    it("Should liquidate an underwater short position", async function () {
      const { perpetualMarket, priceOracle, trader1, liquidator, collateralManager } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 10; // High leverage for easier liquidation

      // Open short position at $2000
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, false);

      // Price increases significantly to trigger liquidation
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("2150")); // 7.5% increase, which with 10x leverage is 75% loss

      // Check initial locked collateral
      const initialLockedCollateral = await collateralManager.lockedCollateral(trader1.address);
      expect(initialLockedCollateral).to.equal(margin);

      await expect(perpetualMarket.connect(liquidator).liquidatePosition(trader1.address))
        .to.emit(perpetualMarket, "PositionLiquidated")
        .withArgs(trader1.address, margin * BigInt(leverage), margin, false, ethers.parseEther("2150"));

      // Position should be deleted
      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);

      // Check that collateral was released (partially, after liquidation fee)
      const finalLockedCollateral = await collateralManager.lockedCollateral(trader1.address);
      expect(finalLockedCollateral).to.be.lt(initialLockedCollateral);
    });

    it("Should update open interest after liquidation", async function () {
      const { perpetualMarket, priceOracle, trader1, trader2, liquidator } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 10;

      // Open positions
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true); // Long
      await perpetualMarket.connect(trader2).openPosition(margin, leverage, false); // Short

      // Check initial open interest
      expect(await perpetualMarket.openInterestLong()).to.equal(margin * BigInt(leverage));
      expect(await perpetualMarket.openInterestShort()).to.equal(margin * BigInt(leverage));

      // Price drops to liquidate long position
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("1850"));

      // Liquidate long position
      await perpetualMarket.connect(liquidator).liquidatePosition(trader1.address);

      // Check updated open interest
      expect(await perpetualMarket.openInterestLong()).to.equal(0);
      expect(await perpetualMarket.openInterestShort()).to.equal(margin * BigInt(leverage));
    });

    it("Should use insurance fund for underwater positions", async function () {
      const { perpetualMarket, priceOracle, trader1, liquidator, liquidityPool } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 20; // Maximum leverage for maximum loss

      // Open long position at $2000
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Price drops dramatically to cause complete loss
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("1500")); // 25% drop, which with 20x leverage is 500% loss (exceeding margin)

      // Get initial insurance fund amount
      const initialInsuranceFund = await liquidityPool.getInsuranceFund();

      // Liquidate position
      await perpetualMarket.connect(liquidator).liquidatePosition(trader1.address);

      // Check that insurance fund was used
      const finalInsuranceFund = await liquidityPool.getInsuranceFund();
      expect(finalInsuranceFund).to.be.lt(initialInsuranceFund);
    });

    it("Should calculate liquidation threshold correctly", async function () {
      const { perpetualMarket, priceOracle, trader1, liquidator } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Open long position at $2000
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Price drops, but not enough to trigger liquidation
      // With 5x leverage, a 10% price drop causes a 50% loss on margin
      // Liquidation threshold is 80%, so position is still safe
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("1800")); // 10% drop

      // Try to liquidate - should fail
      await expect(perpetualMarket.connect(liquidator).liquidatePosition(trader1.address))
        .to.be.revertedWith("Position not liquidatable");

      // Price drops further, now enough to trigger liquidation
      // With 5x leverage, a 16% price drop causes an 80% loss on margin
      // Liquidation threshold is 80%, so position should be liquidatable
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("1680")); // 16% drop

      // Liquidate position - should succeed
      await expect(perpetualMarket.connect(liquidator).liquidatePosition(trader1.address))
        .to.emit(perpetualMarket, "PositionLiquidated");
    });

    it("Should revert liquidation if position is not underwater", async function () {
      const { perpetualMarket, trader1, liquidator } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Open position
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Try to liquidate without price movement
      await expect(perpetualMarket.connect(liquidator).liquidatePosition(trader1.address))
        .to.be.revertedWith("Position not liquidatable");
    });

    it("Should revert if no position exists for liquidation", async function () {
      const { perpetualMarket, trader1, liquidator } = await loadFixture(deployPerpetualMarketFixture);

      await expect(perpetualMarket.connect(liquidator).liquidatePosition(trader1.address))
        .to.be.revertedWith("No position exists");
    });
  });

  describe("Funding Rate", function () {
    it("Should update funding rate based on long-heavy open interest imbalance", async function () {
      const { perpetualMarket, trader1, trader2 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Create imbalance with more longs (3x more long than short)
      await perpetualMarket.connect(trader1).openPosition(margin * BigInt(3), leverage, true); // 3000 USDC long
      await perpetualMarket.connect(trader2).openPosition(margin, leverage, false); // 1000 USDC short

      // Trigger funding rate update by advancing time
      await ethers.provider.send("evm_increaseTime", [3601]); // Advance by 1 hour + 1 second
      await ethers.provider.send("evm_mine", []);

      // Open another position to trigger funding update
      const [, , , newTrader] = await ethers.getSigners();
      await perpetualMarket.connect(newTrader).openPosition(margin, leverage, true);

      // Check funding rate (should be positive when longs > shorts)
      const fundingRate = await perpetualMarket.fundingRate();
      expect(fundingRate).to.be.greaterThan(0);
    });

    it("Should update funding rate based on short-heavy open interest imbalance", async function () {
      const { perpetualMarket, trader1, trader2 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Create imbalance with more shorts (3x more short than long)
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true); // 1000 USDC long
      await perpetualMarket.connect(trader2).openPosition(margin * BigInt(3), leverage, false); // 3000 USDC short

      // Trigger funding rate update by advancing time
      await ethers.provider.send("evm_increaseTime", [3601]); // Advance by 1 hour + 1 second
      await ethers.provider.send("evm_mine", []);

      // Open another position to trigger funding update
      const [, , , newTrader] = await ethers.getSigners();
      await perpetualMarket.connect(newTrader).openPosition(margin, leverage, false);

      // Check funding rate (should be positive when shorts > longs)
      // Note: The contract implementation uses absolute value for funding rate
      const fundingRate = await perpetualMarket.fundingRate();
      expect(fundingRate).to.be.greaterThan(0);
    });

    it("Should have zero funding rate when open interest is balanced", async function () {
      const { perpetualMarket, trader1, trader2 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Create balanced open interest
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true); // 1000 USDC long
      await perpetualMarket.connect(trader2).openPosition(margin, leverage, false); // 1000 USDC short

      // Trigger funding rate update by advancing time
      await ethers.provider.send("evm_increaseTime", [3601]); // Advance by 1 hour + 1 second
      await ethers.provider.send("evm_mine", []);

      // Check funding rate (should be zero when balanced)
      const fundingRate = await perpetualMarket.fundingRate();
      expect(fundingRate).to.equal(0);
    });

    it("Should have zero funding rate when no open interest", async function () {
      const { perpetualMarket } = await loadFixture(deployPerpetualMarketFixture);

      // Trigger funding rate update by advancing time
      await ethers.provider.send("evm_increaseTime", [3601]); // Advance by 1 hour + 1 second
      await ethers.provider.send("evm_mine", []);

      // Check funding rate (should be zero when no positions)
      const fundingRate = await perpetualMarket.fundingRate();
      expect(fundingRate).to.equal(0);
    });

    it("Should emit FundingRateUpdated event when funding rate changes", async function () {
      const { perpetualMarket, trader1, trader2 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Create imbalance
      await perpetualMarket.connect(trader1).openPosition(margin * BigInt(3), leverage, true);
      await perpetualMarket.connect(trader2).openPosition(margin, leverage, false);

      // Trigger funding rate update by advancing time
      await ethers.provider.send("evm_increaseTime", [3601]); // Advance by 1 hour + 1 second
      await ethers.provider.send("evm_mine", []);

      // Open another position to trigger funding update and check for event
      const [, , , newTrader] = await ethers.getSigners();
      await expect(perpetualMarket.connect(newTrader).openPosition(margin, leverage, true))
        .to.emit(perpetualMarket, "FundingRateUpdated");
    });

    it("Should update lastFundingTime when funding rate is updated", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Get initial lastFundingTime
      const initialLastFundingTime = await perpetualMarket.lastFundingTime();

      // Create position
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Trigger funding rate update by advancing time
      await ethers.provider.send("evm_increaseTime", [3601]); // Advance by 1 hour + 1 second
      await ethers.provider.send("evm_mine", []);

      // Close position to trigger funding update
      await perpetualMarket.connect(trader1).closePosition();

      // Check that lastFundingTime was updated
      const finalLastFundingTime = await perpetualMarket.lastFundingTime();
      expect(finalLastFundingTime).to.be.gt(initialLastFundingTime);
    });
  });

  describe("Trading Controls", function () {
    it("Should pause and resume trading", async function () {
      const { perpetualMarket } = await loadFixture(deployPerpetualMarketFixture);

      await expect(perpetualMarket.pauseTrading())
        .to.emit(perpetualMarket, "MarketPaused");

      expect(await perpetualMarket.tradingEnabled()).to.be.false;

      await expect(perpetualMarket.resumeTrading())
        .to.emit(perpetualMarket, "MarketResumed");

      expect(await perpetualMarket.tradingEnabled()).to.be.true;
    });

    it("Should prevent opening positions when trading is paused", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      // Pause trading
      await perpetualMarket.pauseTrading();
      expect(await perpetualMarket.tradingEnabled()).to.be.false;

      // Try to open a position
      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      await expect(perpetualMarket.connect(trader1).openPosition(margin, leverage, true))
        .to.be.revertedWith("Trading is currently disabled");
    });

    it("Should allow closing positions when trading is paused", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      // Open a position first
      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Pause trading
      await perpetualMarket.pauseTrading();
      expect(await perpetualMarket.tradingEnabled()).to.be.false;

      // Should still be able to close position
      await expect(perpetualMarket.connect(trader1).closePosition())
        .to.emit(perpetualMarket, "PositionClosed");

      // Position should be deleted
      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);
    });

    it("Should allow liquidations when trading is paused", async function () {
      const { perpetualMarket, priceOracle, trader1, liquidator } = await loadFixture(deployPerpetualMarketFixture);

      // Open a position first
      const margin = ethers.parseUnits("1000", 6);
      const leverage = 10;
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Price drops significantly to trigger liquidation
      await priceOracle.setPrice("ETH-USD", ethers.parseEther("1850")); // ~7.5% drop, which with 10x leverage is 75% loss

      // Pause trading
      await perpetualMarket.pauseTrading();
      expect(await perpetualMarket.tradingEnabled()).to.be.false;

      // Should still be able to liquidate
      await expect(perpetualMarket.connect(liquidator).liquidatePosition(trader1.address))
        .to.emit(perpetualMarket, "PositionLiquidated");

      // Position should be deleted
      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);
    });

    it("Should resume trading correctly after being paused", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      // Pause trading
      await perpetualMarket.pauseTrading();
      expect(await perpetualMarket.tradingEnabled()).to.be.false;

      // Resume trading
      await perpetualMarket.resumeTrading();
      expect(await perpetualMarket.tradingEnabled()).to.be.true;

      // Should be able to open a position now
      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      await expect(perpetualMarket.connect(trader1).openPosition(margin, leverage, true))
        .to.emit(perpetualMarket, "PositionOpened");
    });
  });
});