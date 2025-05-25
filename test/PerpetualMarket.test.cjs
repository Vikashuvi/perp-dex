const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// Import Chai extensions for Hardhat
require("@nomicfoundation/hardhat-chai-matchers");

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

    // Deploy MockCollateralManager
    const MockCollateralManager = await ethers.getContractFactory("MockCollateralManager");
    const collateralManager = await MockCollateralManager.deploy(await collateralToken.getAddress());
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

    // Verify authorization
    expect(await collateralManager.authorizedMarkets(await perpetualMarket.getAddress())).to.be.true;

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
    it("Should close a position and emit PositionClosed event", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Open position
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Verify position exists
      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(margin * BigInt(leverage));

      // Close position
      await expect(perpetualMarket.connect(trader1).closePosition())
        .to.emit(perpetualMarket, "PositionClosed");

      // Position should be deleted
      const closedPosition = await perpetualMarket.positions(trader1.address);
      expect(closedPosition.size).to.equal(0);
    });

    it("Should update open interest when closing a position", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Open position
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Check initial open interest
      expect(await perpetualMarket.openInterestLong()).to.equal(margin * BigInt(leverage));

      // Close position
      await perpetualMarket.connect(trader1).closePosition();

      // Open interest should be updated
      expect(await perpetualMarket.openInterestLong()).to.equal(0);
    });

    it("Should revert if no position exists", async function () {
      const { perpetualMarket, trader1 } = await loadFixture(deployPerpetualMarketFixture);

      await expect(perpetualMarket.connect(trader1).closePosition())
        .to.be.revertedWith("No position exists");
    });
  });
});
