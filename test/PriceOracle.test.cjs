const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

// Import Chai extensions for Hardhat
require("@nomicfoundation/hardhat-chai-matchers");

describe("PriceOracle", function () {
  // Test fixtures
  async function deployPriceOracleFixture() {
    const [owner, feeder1, feeder2, user] = await ethers.getSigners();

    // Deploy PriceOracle
    const PriceOracle = await ethers.getContractFactory("PriceOracle");
    const priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    return {
      priceOracle,
      owner,
      feeder1,
      feeder2,
      user
    };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { priceOracle, owner } = await loadFixture(deployPriceOracleFixture);
      expect(await priceOracle.owner()).to.equal(owner.address);
    });

    it("Should initialize with no authorized feeders", async function () {
      const { priceOracle, feeder1 } = await loadFixture(deployPriceOracleFixture);
      expect(await priceOracle.authorizedFeeders(feeder1.address)).to.be.false;
    });
  });

  describe("Feeder Authorization", function () {
    it("Should allow owner to authorize feeders", async function () {
      const { priceOracle, owner, feeder1 } = await loadFixture(deployPriceOracleFixture);

      await expect(priceOracle.connect(owner).authorizeFeeder(feeder1.address))
        .to.emit(priceOracle, "FeederAuthorized")
        .withArgs(feeder1.address);

      expect(await priceOracle.authorizedFeeders(feeder1.address)).to.be.true;
    });

    it("Should allow owner to deauthorize feeders", async function () {
      const { priceOracle, owner, feeder1 } = await loadFixture(deployPriceOracleFixture);

      // Authorize first
      await priceOracle.connect(owner).authorizeFeeder(feeder1.address);

      // Then deauthorize
      await expect(priceOracle.connect(owner).deauthorizeFeeder(feeder1.address))
        .to.emit(priceOracle, "FeederDeauthorized")
        .withArgs(feeder1.address);

      expect(await priceOracle.authorizedFeeders(feeder1.address)).to.be.false;
    });

    it("Should revert if non-owner tries to authorize feeder", async function () {
      const { priceOracle, feeder1, feeder2 } = await loadFixture(deployPriceOracleFixture);

      await expect(priceOracle.connect(feeder1).authorizeFeeder(feeder2.address))
        .to.be.revertedWithCustomError(priceOracle, "OwnableUnauthorizedAccount");
    });

    it("Should revert if trying to authorize zero address", async function () {
      const { priceOracle, owner } = await loadFixture(deployPriceOracleFixture);

      await expect(priceOracle.connect(owner).authorizeFeeder(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid feeder address");
    });
  });

  describe("Price Updates", function () {
    it("Should allow owner to update prices", async function () {
      const { priceOracle, owner } = await loadFixture(deployPriceOracleFixture);

      const marketSymbol = "ETH-USD";
      const price = ethers.parseEther("2000"); // $2000

      await expect(priceOracle.connect(owner).updatePrice(marketSymbol, price))
        .to.emit(priceOracle, "PriceUpdated")
        .withArgs(marketSymbol, price);

      expect(await priceOracle.prices(marketSymbol)).to.equal(price);
    });

    it("Should allow authorized feeders to update prices", async function () {
      const { priceOracle, owner, feeder1 } = await loadFixture(deployPriceOracleFixture);

      // Authorize feeder
      await priceOracle.connect(owner).authorizeFeeder(feeder1.address);

      const marketSymbol = "BTC-USD";
      const price = ethers.parseEther("40000"); // $40000

      await expect(priceOracle.connect(feeder1).updatePrice(marketSymbol, price))
        .to.emit(priceOracle, "PriceUpdated")
        .withArgs(marketSymbol, price);

      expect(await priceOracle.prices(marketSymbol)).to.equal(price);
    });

    it("Should revert if unauthorized user tries to update price", async function () {
      const { priceOracle, user } = await loadFixture(deployPriceOracleFixture);

      const marketSymbol = "ETH-USD";
      const price = ethers.parseEther("2000");

      await expect(priceOracle.connect(user).updatePrice(marketSymbol, price))
        .to.be.revertedWith("Not authorized");
    });

    it("Should revert if price is zero", async function () {
      const { priceOracle, owner } = await loadFixture(deployPriceOracleFixture);

      const marketSymbol = "ETH-USD";
      const price = 0;

      await expect(priceOracle.connect(owner).updatePrice(marketSymbol, price))
        .to.be.revertedWith("Price must be greater than 0");
    });
  });

  describe("Price Retrieval", function () {
    it("Should return the correct price for a market", async function () {
      const { priceOracle, owner } = await loadFixture(deployPriceOracleFixture);

      const marketSymbol = "ETH-USD";
      const price = ethers.parseEther("2000");

      // Set price first
      await priceOracle.connect(owner).updatePrice(marketSymbol, price);

      // Get price
      expect(await priceOracle.getPrice(marketSymbol)).to.equal(price);
    });

    it("Should revert if price is not available", async function () {
      const { priceOracle } = await loadFixture(deployPriceOracleFixture);

      const marketSymbol = "NONEXISTENT-USD";

      await expect(priceOracle.getPrice(marketSymbol))
        .to.be.revertedWith("Price not available");
    });
  });

  describe("Multiple Markets", function () {
    it("Should handle multiple market prices correctly", async function () {
      const { priceOracle, owner } = await loadFixture(deployPriceOracleFixture);

      const markets = [
        { symbol: "ETH-USD", price: ethers.parseEther("2000") },
        { symbol: "BTC-USD", price: ethers.parseEther("40000") },
        { symbol: "LINK-USD", price: ethers.parseEther("20") },
        { symbol: "UNI-USD", price: ethers.parseEther("5") }
      ];

      // Set prices for all markets
      for (const market of markets) {
        await priceOracle.connect(owner).updatePrice(market.symbol, market.price);
      }

      // Verify all prices
      for (const market of markets) {
        expect(await priceOracle.getPrice(market.symbol)).to.equal(market.price);
      }
    });
  });
});
