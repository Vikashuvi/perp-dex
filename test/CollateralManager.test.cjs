const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// Import Chai extensions for Hardhat
require("@nomicfoundation/hardhat-chai-matchers");

describe("CollateralManager", function () {
  // Test fixtures
  async function deployCollateralManagerFixture() {
    const [owner, user1, user2, market] = await ethers.getSigners();

    // Deploy mock ERC20 token for collateral
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const collateralToken = await MockERC20.deploy("USDC", "USDC", 6);
    await collateralToken.waitForDeployment();

    // Deploy CollateralManager
    const CollateralManager = await ethers.getContractFactory("CollateralManager");
    const collateralManager = await CollateralManager.deploy(await collateralToken.getAddress());
    await collateralManager.waitForDeployment();

    // Mint tokens to users
    const initialBalance = ethers.parseUnits("10000", 6); // 10,000 USDC
    await collateralToken.mint(user1.address, initialBalance);
    await collateralToken.mint(user2.address, initialBalance);

    // Approve collateral manager to spend tokens
    await collateralToken.connect(user1).approve(await collateralManager.getAddress(), initialBalance);
    await collateralToken.connect(user2).approve(await collateralManager.getAddress(), initialBalance);

    return {
      collateralManager,
      collateralToken,
      owner,
      user1,
      user2,
      market,
      initialBalance
    };
  }

  describe("Deployment", function () {
    it("Should set the correct collateral token", async function () {
      const { collateralManager, collateralToken } = await loadFixture(deployCollateralManagerFixture);
      expect(await collateralManager.collateralToken()).to.equal(await collateralToken.getAddress());
    });

    it("Should set the correct owner", async function () {
      const { collateralManager, owner } = await loadFixture(deployCollateralManagerFixture);
      expect(await collateralManager.owner()).to.equal(owner.address);
    });
  });

  describe("Collateral Deposit", function () {
    it("Should allow users to deposit collateral", async function () {
      const { collateralManager, user1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      await expect(collateralManager.connect(user1).depositCollateral(depositAmount))
        .to.emit(collateralManager, "CollateralDeposited")
        .withArgs(user1.address, depositAmount);

      expect(await collateralManager.userBalance(user1.address)).to.equal(depositAmount);
    });

    it("Should revert if amount is zero", async function () {
      const { collateralManager, user1 } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.connect(user1).depositCollateral(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert if user has insufficient token balance", async function () {
      const { collateralManager, user1, initialBalance } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = initialBalance + ethers.parseUnits("1", 6); // More than user has

      await expect(collateralManager.connect(user1).depositCollateral(depositAmount))
        .to.be.reverted; // ERC20 transfer will fail
    });
  });

  describe("Collateral Withdrawal", function () {
    it("Should allow users to withdraw collateral", async function () {
      const { collateralManager, collateralToken, user1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const withdrawAmount = ethers.parseUnits("400", 6);

      // Deposit first
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Get initial token balance
      const initialTokenBalance = await collateralToken.balanceOf(user1.address);

      // Withdraw
      await expect(collateralManager.connect(user1).withdrawCollateral(withdrawAmount))
        .to.emit(collateralManager, "CollateralWithdrawn")
        .withArgs(user1.address, withdrawAmount);

      // Check updated user balance in contract
      expect(await collateralManager.userBalance(user1.address)).to.equal(depositAmount - withdrawAmount);

      // Check token balance increased
      const finalTokenBalance = await collateralToken.balanceOf(user1.address);
      expect(finalTokenBalance).to.equal(initialTokenBalance + withdrawAmount);
    });

    it("Should revert if amount is zero", async function () {
      const { collateralManager, user1 } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.connect(user1).withdrawCollateral(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert if user has insufficient balance", async function () {
      const { collateralManager, user1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const withdrawAmount = ethers.parseUnits("1500", 6); // More than deposited

      // Deposit first
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Try to withdraw more than deposited
      await expect(collateralManager.connect(user1).withdrawCollateral(withdrawAmount))
        .to.be.revertedWith("Insufficient available collateral");
    });

    it("Should revert if trying to withdraw locked collateral", async function () {
      const { collateralManager, user1, market, owner } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("600", 6);
      const withdrawAmount = ethers.parseUnits("500", 6);

      // Deposit first
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Authorize market
      await collateralManager.connect(owner).authorizeMarket(market.address);

      // Lock collateral
      await collateralManager.connect(market).lockCollateral(user1.address, lockAmount);

      // Try to withdraw more than available
      await expect(collateralManager.connect(user1).withdrawCollateral(withdrawAmount))
        .to.be.revertedWith("Insufficient available collateral");
    });
  });

  describe("Collateral Locking", function () {
    it("Should allow authorized markets to lock collateral", async function () {
      const { collateralManager, user1, market, owner } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("600", 6);

      // Deposit first
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Authorize market
      await collateralManager.connect(owner).authorizeMarket(market.address);

      // Lock collateral
      await expect(collateralManager.connect(market).lockCollateral(user1.address, lockAmount))
        .to.emit(collateralManager, "CollateralLocked")
        .withArgs(user1.address, lockAmount);

      expect(await collateralManager.lockedCollateral(user1.address)).to.equal(lockAmount);
      expect(await collateralManager.getAvailableCollateral(user1.address)).to.equal(depositAmount - lockAmount);
    });

    it("Should revert if non-authorized market tries to lock collateral", async function () {
      const { collateralManager, user1, market } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("600", 6);

      // Deposit first
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Try to lock without authorization
      await expect(collateralManager.connect(market).lockCollateral(user1.address, lockAmount))
        .to.be.revertedWith("Not an authorized market");
    });

    it("Should revert if trying to lock more than available", async function () {
      const { collateralManager, user1, market, owner } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("1200", 6); // More than deposited

      // Deposit first
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Authorize market
      await collateralManager.connect(owner).authorizeMarket(market.address);

      // Try to lock more than available
      await expect(collateralManager.connect(market).lockCollateral(user1.address, lockAmount))
        .to.be.revertedWith("Insufficient available collateral");
    });
  });

  describe("Collateral Release", function () {
    it("Should allow authorized markets to release collateral", async function () {
      const { collateralManager, user1, market, owner } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("600", 6);
      const releaseAmount = ethers.parseUnits("400", 6);

      // Deposit first
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Authorize market
      await collateralManager.connect(owner).authorizeMarket(market.address);

      // Lock collateral
      await collateralManager.connect(market).lockCollateral(user1.address, lockAmount);

      // Release collateral
      await expect(collateralManager.connect(market).releaseCollateral(user1.address, releaseAmount))
        .to.emit(collateralManager, "CollateralReleased")
        .withArgs(user1.address, releaseAmount);

      expect(await collateralManager.lockedCollateral(user1.address)).to.equal(lockAmount - releaseAmount);
      expect(await collateralManager.getAvailableCollateral(user1.address)).to.equal(depositAmount - lockAmount + releaseAmount);
    });

    it("Should revert if non-authorized market tries to release collateral", async function () {
      const { collateralManager, user1, market, owner } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("600", 6);
      const releaseAmount = ethers.parseUnits("400", 6);

      // Deposit first
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Authorize market
      await collateralManager.connect(owner).authorizeMarket(market.address);

      // Lock collateral
      await collateralManager.connect(market).lockCollateral(user1.address, lockAmount);

      // Deauthorize market
      await collateralManager.connect(owner).deauthorizeMarket(market.address);

      // Try to release without authorization
      await expect(collateralManager.connect(market).releaseCollateral(user1.address, releaseAmount))
        .to.be.revertedWith("Not an authorized market");
    });

    it("Should revert if trying to release more than locked", async function () {
      const { collateralManager, user1, market, owner } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("600", 6);
      const releaseAmount = ethers.parseUnits("800", 6); // More than locked

      // Deposit first
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Authorize market
      await collateralManager.connect(owner).authorizeMarket(market.address);

      // Lock collateral
      await collateralManager.connect(market).lockCollateral(user1.address, lockAmount);

      // Try to release more than locked
      await expect(collateralManager.connect(market).releaseCollateral(user1.address, releaseAmount))
        .to.be.revertedWith("Insufficient locked collateral");
    });
  });

  describe("Market Authorization", function () {
    it("Should allow owner to authorize markets", async function () {
      const { collateralManager, market, owner } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.connect(owner).authorizeMarket(market.address))
        .to.emit(collateralManager, "MarketAuthorized")
        .withArgs(market.address);

      expect(await collateralManager.authorizedMarkets(market.address)).to.be.true;
    });

    it("Should allow owner to deauthorize markets", async function () {
      const { collateralManager, market, owner } = await loadFixture(deployCollateralManagerFixture);

      // Authorize first
      await collateralManager.connect(owner).authorizeMarket(market.address);

      // Then deauthorize
      await expect(collateralManager.connect(owner).deauthorizeMarket(market.address))
        .to.emit(collateralManager, "MarketDeauthorized")
        .withArgs(market.address);

      expect(await collateralManager.authorizedMarkets(market.address)).to.be.false;
    });

    it("Should revert if non-owner tries to authorize market", async function () {
      const { collateralManager, market, user1 } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.connect(user1).authorizeMarket(market.address))
        .to.be.revertedWithCustomError(collateralManager, "OwnableUnauthorizedAccount");
    });

    it("Should revert if trying to authorize zero address", async function () {
      const { collateralManager, owner } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.connect(owner).authorizeMarket(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid market address");
    });
  });
});
