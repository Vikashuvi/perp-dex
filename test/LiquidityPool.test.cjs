const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// Import Chai extensions for Hardhat
require("@nomicfoundation/hardhat-chai-matchers");

describe("LiquidityPool", function () {
  // Test fixtures
  async function deployLiquidityPoolFixture() {
    const [owner, provider1, provider2, market] = await ethers.getSigners();

    // Deploy mock ERC20 token for collateral
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const collateralToken = await MockERC20.deploy("USDC", "USDC", 6);
    await collateralToken.waitForDeployment();

    // Deploy PriceOracle mock
    const MockPriceOracle = await ethers.getContractFactory("MockPriceOracle");
    const priceOracle = await MockPriceOracle.deploy();
    await priceOracle.waitForDeployment();

    // Deploy LiquidityPool
    const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
    const liquidityPool = await LiquidityPool.deploy(
      await collateralToken.getAddress(),
      await priceOracle.getAddress()
    );
    await liquidityPool.waitForDeployment();

    // Mint tokens to providers
    const initialBalance = ethers.parseUnits("10000", 6); // 10,000 USDC
    await collateralToken.mint(provider1.address, initialBalance);
    await collateralToken.mint(provider2.address, initialBalance);

    // Approve liquidity pool to spend tokens
    await collateralToken.connect(provider1).approve(await liquidityPool.getAddress(), initialBalance);
    await collateralToken.connect(provider2).approve(await liquidityPool.getAddress(), initialBalance);

    return {
      liquidityPool,
      collateralToken,
      priceOracle,
      owner,
      provider1,
      provider2,
      market,
      initialBalance
    };
  }

  describe("Deployment", function () {
    it("Should set the correct collateral token", async function () {
      const { liquidityPool, collateralToken } = await loadFixture(deployLiquidityPoolFixture);
      expect(await liquidityPool.collateralToken()).to.equal(await collateralToken.getAddress());
    });

    it("Should set the correct price oracle", async function () {
      const { liquidityPool, priceOracle } = await loadFixture(deployLiquidityPoolFixture);
      expect(await liquidityPool.priceOracle()).to.equal(await priceOracle.getAddress());
    });

    it("Should set the correct owner", async function () {
      const { liquidityPool, owner } = await loadFixture(deployLiquidityPoolFixture);
      expect(await liquidityPool.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero total liquidity", async function () {
      const { liquidityPool } = await loadFixture(deployLiquidityPoolFixture);
      expect(await liquidityPool.totalLiquidity()).to.equal(0);
    });

    it("Should initialize with zero utilization rate", async function () {
      const { liquidityPool } = await loadFixture(deployLiquidityPoolFixture);
      expect(await liquidityPool.utilizationRate()).to.equal(0);
    });

    it("Should initialize with correct fee rates", async function () {
      const { liquidityPool } = await loadFixture(deployLiquidityPoolFixture);
      expect(await liquidityPool.feeRate()).to.equal(ethers.parseEther("0.005")); // 0.5%
      expect(await liquidityPool.insuranceFundRate()).to.equal(ethers.parseEther("0.01")); // 1%
    });
  });

  describe("Liquidity Addition", function () {
    it("Should allow users to add liquidity", async function () {
      const { liquidityPool, provider1 } = await loadFixture(deployLiquidityPoolFixture);

      const addAmount = ethers.parseUnits("1000", 6);
      await expect(liquidityPool.connect(provider1).addLiquidity(addAmount))
        .to.emit(liquidityPool, "LiquidityAdded")
        .withArgs(provider1.address, addAmount, ethers.parseEther("1"));

      expect(await liquidityPool.totalLiquidity()).to.equal(addAmount);
      
      const providerInfo = await liquidityPool.getProviderInfo(provider1.address);
      expect(providerInfo[0]).to.equal(addAmount); // amount
      expect(providerInfo[1]).to.equal(ethers.parseEther("1")); // sharePercentage (100%)
    });

    it("Should correctly calculate share percentages for multiple providers", async function () {
      const { liquidityPool, provider1, provider2 } = await loadFixture(deployLiquidityPoolFixture);

      const addAmount1 = ethers.parseUnits("1000", 6);
      const addAmount2 = ethers.parseUnits("4000", 6);

      // First provider adds liquidity
      await liquidityPool.connect(provider1).addLiquidity(addAmount1);
      
      // Second provider adds liquidity
      await liquidityPool.connect(provider2).addLiquidity(addAmount2);

      // Total liquidity should be sum of both
      expect(await liquidityPool.totalLiquidity()).to.equal(addAmount1 + addAmount2);
      
      // Check share percentages
      const provider1Info = await liquidityPool.getProviderInfo(provider1.address);
      const provider2Info = await liquidityPool.getProviderInfo(provider2.address);
      
      // Provider1 should have 20% share (1000/5000)
      expect(provider1Info[1]).to.equal(ethers.parseEther("0.2"));
      
      // Provider2 should have 80% share (4000/5000)
      expect(provider2Info[1]).to.equal(ethers.parseEther("0.8"));
    });

    it("Should revert if amount is zero", async function () {
      const { liquidityPool, provider1 } = await loadFixture(deployLiquidityPoolFixture);

      await expect(liquidityPool.connect(provider1).addLiquidity(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert if user has insufficient token balance", async function () {
      const { liquidityPool, provider1, initialBalance } = await loadFixture(deployLiquidityPoolFixture);

      const addAmount = initialBalance + ethers.parseUnits("1", 6); // More than user has

      await expect(liquidityPool.connect(provider1).addLiquidity(addAmount))
        .to.be.reverted; // ERC20 transfer will fail
    });
  });

  describe("Liquidity Removal", function () {
    it("Should allow users to remove liquidity", async function () {
      const { liquidityPool, provider1 } = await loadFixture(deployLiquidityPoolFixture);

      const addAmount = ethers.parseUnits("1000", 6);
      const removeAmount = ethers.parseUnits("400", 6);

      // Add liquidity first
      await liquidityPool.connect(provider1).addLiquidity(addAmount);
      
      // Remove liquidity
      await expect(liquidityPool.connect(provider1).removeLiquidity(removeAmount))
        .to.emit(liquidityPool, "LiquidityRemoved")
        .withArgs(provider1.address, removeAmount);

      // Check remaining liquidity
      expect(await liquidityPool.totalLiquidity()).to.equal(addAmount - removeAmount);
      
      const providerInfo = await liquidityPool.getProviderInfo(provider1.address);
      expect(providerInfo[0]).to.equal(addAmount - removeAmount);
    });

    it("Should revert if trying to remove more than provided", async function () {
      const { liquidityPool, provider1 } = await loadFixture(deployLiquidityPoolFixture);

      const addAmount = ethers.parseUnits("1000", 6);
      const removeAmount = ethers.parseUnits("1500", 6); // More than added

      // Add liquidity first
      await liquidityPool.connect(provider1).addLiquidity(addAmount);
      
      // Try to remove more than provided
      await expect(liquidityPool.connect(provider1).removeLiquidity(removeAmount))
        .to.be.revertedWith("Insufficient liquidity");
    });

    it("Should revert if trying to remove when utilization is high", async function () {
      const { liquidityPool, provider1, market } = await loadFixture(deployLiquidityPoolFixture);

      const addAmount = ethers.parseUnits("1000", 6);
      const removeAmount = ethers.parseUnits("500", 6);

      // Add liquidity first
      await liquidityPool.connect(provider1).addLiquidity(addAmount);
      
      // Set high utilization rate (90%)
      await liquidityPool.updateUtilizationRate(ethers.parseEther("0.9"));
      
      // Try to remove liquidity when utilization is high
      await expect(liquidityPool.connect(provider1).removeLiquidity(removeAmount))
        .to.be.revertedWith("Insufficient available liquidity");
    });
  });

  describe("Fee Collection and Rewards", function () {
    it("Should collect fees and distribute to providers", async function () {
      const { liquidityPool, provider1, provider2, market, owner } = await loadFixture(deployLiquidityPoolFixture);

      const addAmount1 = ethers.parseUnits("1000", 6);
      const addAmount2 = ethers.parseUnits("4000", 6);
      const feeAmount = ethers.parseUnits("100", 6);

      // Add liquidity
      await liquidityPool.connect(provider1).addLiquidity(addAmount1);
      await liquidityPool.connect(provider2).addLiquidity(addAmount2);

      // Collect fees (in a real scenario, this would be called by the market contract)
      await liquidityPool.collectFees(feeAmount);

      // Check rewards accrued
      const provider1Info = await liquidityPool.getProviderInfo(provider1.address);
      const provider2Info = await liquidityPool.getProviderInfo(provider2.address);

      // Calculate expected rewards
      // 1% of fees go to insurance fund, 99% distributed to providers
      const distributedFees = feeAmount * BigInt(99) / BigInt(100);
      const provider1ExpectedReward = distributedFees * BigInt(20) / BigInt(100); // 20% share
      const provider2ExpectedReward = distributedFees * BigInt(80) / BigInt(100); // 80% share

      // Check rewards (with some tolerance for rounding)
      expect(provider1Info[2]).to.be.closeTo(provider1ExpectedReward, 10);
      expect(provider2Info[2]).to.be.closeTo(provider2ExpectedReward, 10);
    });
  });
});
