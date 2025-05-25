const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Basic Contract Tests", function () {
  let deployer, trader1, trader2;
  let usdc, priceOracle, collateralManager, liquidityPool, perpetualMarket;

  beforeEach(async function () {
    [deployer, trader1, trader2] = await ethers.getSigners();

    // Deploy MockERC20 (USDC)
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();

    // Deploy PriceOracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    // Deploy CollateralManager
    const CollateralManager = await ethers.getContractFactory("CollateralManager");
    collateralManager = await CollateralManager.deploy(await usdc.getAddress());
    await collateralManager.waitForDeployment();

    // Deploy LiquidityPool
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    liquidityPool = await LiquidityPool.deploy(await usdc.getAddress(), await priceOracle.getAddress());
    await liquidityPool.waitForDeployment();

    // Deploy PerpetualMarket
    const PerpetualMarket = await ethers.getContractFactory("PerpetualMarket");
    perpetualMarket = await PerpetualMarket.deploy(
      await priceOracle.getAddress(),
      await collateralManager.getAddress(),
      await liquidityPool.getAddress(),
      "ETH-USD",
      3600, // 1 hour funding interval
      ethers.parseEther("0.001") // 0.1% trading fee
    );
    await perpetualMarket.waitForDeployment();

    // Setup
    await collateralManager.authorizeMarket(await perpetualMarket.getAddress());
    await priceOracle.updatePrice("ETH-USD", ethers.parseEther("2000"));

    // Mint and setup tokens for traders
    const mintAmount = ethers.parseUnits("10000", 6);
    await usdc.mint(trader1.address, mintAmount);
    await usdc.mint(trader2.address, mintAmount);

    await usdc.connect(trader1).approve(await collateralManager.getAddress(), mintAmount);
    await usdc.connect(trader2).approve(await collateralManager.getAddress(), mintAmount);

    await collateralManager.connect(trader1).depositCollateral(ethers.parseUnits("5000", 6));
    await collateralManager.connect(trader2).depositCollateral(ethers.parseUnits("5000", 6));
  });

  describe("Contract Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(await usdc.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await priceOracle.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await collateralManager.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await liquidityPool.getAddress()).to.not.equal(ethers.ZeroAddress);
      expect(await perpetualMarket.getAddress()).to.not.equal(ethers.ZeroAddress);
    });

    it("Should have correct initial configuration", async function () {
      expect(await perpetualMarket.marketSymbol()).to.equal("ETH-USD");
      expect(await perpetualMarket.tradingEnabled()).to.be.true;
      expect(await priceOracle.getPrice("ETH-USD")).to.equal(ethers.parseEther("2000"));
    });
  });

  describe("Collateral Management", function () {
    it("Should allow users to deposit and withdraw collateral", async function () {
      const balance = await collateralManager.userBalance(trader1.address);
      expect(balance).to.equal(ethers.parseUnits("5000", 6));

      const availableBalance = await collateralManager.getAvailableCollateral(trader1.address);
      expect(availableBalance).to.equal(ethers.parseUnits("5000", 6));
    });
  });

  describe("Position Management", function () {
    it("Should allow opening a position", async function () {
      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(margin * BigInt(leverage));
      expect(position.margin).to.equal(margin);
      expect(position.isLong).to.be.true;
    });

    it("Should allow closing a position", async function () {
      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      // Open position
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Close position
      await perpetualMarket.connect(trader1).closePosition();

      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);
    });

    it("Should update open interest correctly", async function () {
      const margin = ethers.parseUnits("1000", 6);
      const leverage = 5;

      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);
      expect(await perpetualMarket.openInterestLong()).to.equal(margin * BigInt(leverage));

      await perpetualMarket.connect(trader2).openPosition(margin, leverage, false);
      expect(await perpetualMarket.openInterestShort()).to.equal(margin * BigInt(leverage));
    });
  });

  describe("Price Oracle", function () {
    it("Should allow updating prices", async function () {
      await priceOracle.updatePrice("ETH-USD", ethers.parseEther("2100"));
      expect(await priceOracle.getPrice("ETH-USD")).to.equal(ethers.parseEther("2100"));
    });
  });

  describe("Liquidation", function () {
    it("Should allow liquidation of underwater positions", async function () {
      const margin = ethers.parseUnits("1000", 6);
      const leverage = 10; // High leverage

      // Open position
      await perpetualMarket.connect(trader1).openPosition(margin, leverage, true);

      // Drop price significantly
      await priceOracle.updatePrice("ETH-USD", ethers.parseEther("1800"));

      // Liquidate
      await perpetualMarket.connect(trader2).liquidatePosition(trader1.address);

      const position = await perpetualMarket.positions(trader1.address);
      expect(position.size).to.equal(0);
    });
  });
});