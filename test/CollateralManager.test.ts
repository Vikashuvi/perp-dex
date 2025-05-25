import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

// Import Chai extensions for Hardhat
import "@nomicfoundation/hardhat-chai-matchers";

describe("CollateralManager", function () {
  // Test fixtures
  async function deployCollateralManagerFixture() {
    const [owner, user1, user2, market1, market2] = await ethers.getSigners();

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

    return {
      collateralManager,
      collateralToken,
      owner,
      user1,
      user2,
      market1,
      market2,
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
      const { collateralManager, collateralToken, user1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);

      // Approve the collateral manager to spend tokens
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);

      // Deposit collateral
      await expect(collateralManager.connect(user1).depositCollateral(depositAmount))
        .to.emit(collateralManager, "CollateralDeposited")
        .withArgs(user1.address, depositAmount);

      // Check user balance
      expect(await collateralManager.userBalance(user1.address)).to.equal(depositAmount);
    });

    it("Should revert if deposit amount is zero", async function () {
      const { collateralManager, user1 } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.connect(user1).depositCollateral(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert if user has insufficient token balance", async function () {
      const { collateralManager, collateralToken, user1, initialBalance } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = initialBalance + ethers.parseUnits("1", 6); // More than user has

      // Approve the collateral manager to spend tokens
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);

      await expect(collateralManager.connect(user1).depositCollateral(depositAmount))
        .to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
  });

  describe("Collateral Withdrawal", function () {
    it("Should allow users to withdraw available collateral", async function () {
      const { collateralManager, collateralToken, user1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const withdrawAmount = ethers.parseUnits("500", 6);

      // Deposit first
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      // Withdraw
      await expect(collateralManager.connect(user1).withdrawCollateral(withdrawAmount))
        .to.emit(collateralManager, "CollateralWithdrawn")
        .withArgs(user1.address, withdrawAmount);

      // Check remaining balance
      expect(await collateralManager.userBalance(user1.address)).to.equal(depositAmount - withdrawAmount);
    });

    it("Should revert if withdrawal amount is zero", async function () {
      const { collateralManager, user1 } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.connect(user1).withdrawCollateral(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should revert if user has insufficient available collateral", async function () {
      const { collateralManager, collateralToken, user1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const withdrawAmount = ethers.parseUnits("1500", 6); // More than deposited

      // Deposit first
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      await expect(collateralManager.connect(user1).withdrawCollateral(withdrawAmount))
        .to.be.revertedWith("Insufficient available collateral");
    });
  });

  describe("Market Authorization", function () {
    it("Should allow owner to authorize markets", async function () {
      const { collateralManager, market1 } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.authorizeMarket(market1.address))
        .to.emit(collateralManager, "MarketAuthorized")
        .withArgs(market1.address);

      expect(await collateralManager.authorizedMarkets(market1.address)).to.be.true;
    });

    it("Should allow owner to deauthorize markets", async function () {
      const { collateralManager, market1 } = await loadFixture(deployCollateralManagerFixture);

      // Authorize first
      await collateralManager.authorizeMarket(market1.address);

      // Then deauthorize
      await expect(collateralManager.deauthorizeMarket(market1.address))
        .to.emit(collateralManager, "MarketDeauthorized")
        .withArgs(market1.address);

      expect(await collateralManager.authorizedMarkets(market1.address)).to.be.false;
    });

    it("Should revert if non-owner tries to authorize market", async function () {
      const { collateralManager, user1, market1 } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.connect(user1).authorizeMarket(market1.address))
        .to.be.revertedWithCustomError(collateralManager, "OwnableUnauthorizedAccount");
    });

    it("Should revert if trying to authorize zero address", async function () {
      const { collateralManager } = await loadFixture(deployCollateralManagerFixture);

      await expect(collateralManager.authorizeMarket(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid market address");
    });
  });

  describe("Collateral Locking", function () {
    it("Should allow authorized markets to lock collateral", async function () {
      const { collateralManager, collateralToken, user1, market1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("500", 6);

      // Setup: deposit collateral and authorize market
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);
      await collateralManager.connect(user1).depositCollateral(depositAmount);
      await collateralManager.authorizeMarket(market1.address);

      // Lock collateral
      await expect(collateralManager.connect(market1).lockCollateral(user1.address, lockAmount))
        .to.emit(collateralManager, "CollateralLocked")
        .withArgs(user1.address, lockAmount);

      expect(await collateralManager.lockedCollateral(user1.address)).to.equal(lockAmount);
      expect(await collateralManager.getAvailableCollateral(user1.address)).to.equal(depositAmount - lockAmount);
    });

    it("Should revert if unauthorized market tries to lock collateral", async function () {
      const { collateralManager, collateralToken, user1, market1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("500", 6);

      // Setup: deposit collateral but don't authorize market
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);
      await collateralManager.connect(user1).depositCollateral(depositAmount);

      await expect(collateralManager.connect(market1).lockCollateral(user1.address, lockAmount))
        .to.be.revertedWith("Not an authorized market");
    });

    it("Should revert if trying to lock more than available", async function () {
      const { collateralManager, collateralToken, user1, market1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("1500", 6); // More than available

      // Setup
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);
      await collateralManager.connect(user1).depositCollateral(depositAmount);
      await collateralManager.authorizeMarket(market1.address);

      await expect(collateralManager.connect(market1).lockCollateral(user1.address, lockAmount))
        .to.be.revertedWith("Insufficient available collateral");
    });
  });

  describe("Collateral Release", function () {
    it("Should allow authorized markets to release collateral", async function () {
      const { collateralManager, collateralToken, user1, market1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("500", 6);
      const releaseAmount = ethers.parseUnits("200", 6);

      // Setup: deposit, authorize, and lock
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);
      await collateralManager.connect(user1).depositCollateral(depositAmount);
      await collateralManager.authorizeMarket(market1.address);
      await collateralManager.connect(market1).lockCollateral(user1.address, lockAmount);

      // Release collateral
      await expect(collateralManager.connect(market1).releaseCollateral(user1.address, releaseAmount))
        .to.emit(collateralManager, "CollateralReleased")
        .withArgs(user1.address, releaseAmount);

      expect(await collateralManager.lockedCollateral(user1.address)).to.equal(lockAmount - releaseAmount);
      expect(await collateralManager.getAvailableCollateral(user1.address)).to.equal(depositAmount - (lockAmount - releaseAmount));
    });

    it("Should revert if unauthorized market tries to release collateral", async function () {
      const { collateralManager, user1, market1 } = await loadFixture(deployCollateralManagerFixture);

      const releaseAmount = ethers.parseUnits("200", 6);

      await expect(collateralManager.connect(market1).releaseCollateral(user1.address, releaseAmount))
        .to.be.revertedWith("Not an authorized market");
    });

    it("Should revert if trying to release more than locked", async function () {
      const { collateralManager, collateralToken, user1, market1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("500", 6);
      const releaseAmount = ethers.parseUnits("600", 6); // More than locked

      // Setup
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);
      await collateralManager.connect(user1).depositCollateral(depositAmount);
      await collateralManager.authorizeMarket(market1.address);
      await collateralManager.connect(market1).lockCollateral(user1.address, lockAmount);

      await expect(collateralManager.connect(market1).releaseCollateral(user1.address, releaseAmount))
        .to.be.revertedWith("Insufficient locked collateral");
    });
  });

  describe("Available Collateral Calculation", function () {
    it("Should correctly calculate available collateral", async function () {
      const { collateralManager, collateralToken, user1, market1 } = await loadFixture(deployCollateralManagerFixture);

      const depositAmount = ethers.parseUnits("1000", 6);
      const lockAmount = ethers.parseUnits("300", 6);

      // Setup
      await collateralToken.connect(user1).approve(await collateralManager.getAddress(), depositAmount);
      await collateralManager.connect(user1).depositCollateral(depositAmount);
      await collateralManager.authorizeMarket(market1.address);
      await collateralManager.connect(market1).lockCollateral(user1.address, lockAmount);

      const availableCollateral = await collateralManager.getAvailableCollateral(user1.address);
      expect(availableCollateral).to.equal(depositAmount - lockAmount);
    });
  });
});