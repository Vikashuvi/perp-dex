import { ethers, network } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [deployer] = await ethers.getSigners();
  const networkName = network.name;

  console.log(`Deploying contracts to network: ${networkName}`);
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  let usdc: any;
  // For testnets, we might want to use an existing USDC contract
  if (networkName === 'hardhat' || networkName === 'localhost') {
    // Deploy mock ERC20 token for collateral (USDC)
    console.log("\n1. Deploying MockERC20 (USDC)...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();
    console.log("USDC deployed to:", await usdc.getAddress());
  } else {
    // For testnets, you might want to use an existing USDC address
    // This is a placeholder - replace with the actual USDC address on your target network
    const usdcAddress = process.env.USDC_ADDRESS;
    if (!usdcAddress) {
      throw new Error(`USDC_ADDRESS not set for network ${networkName}`);
    }
    console.log(`\n1. Using existing USDC at: ${usdcAddress}`);
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    usdc = MockERC20.attach(usdcAddress);
  }

  // Deploy PriceOracle
  console.log("\n2. Deploying PriceOracle...");
  const PriceOracle = await ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy();
  await priceOracle.waitForDeployment();
  console.log("PriceOracle deployed to:", await priceOracle.getAddress());

  // Deploy CollateralManager
  console.log("\n3. Deploying CollateralManager...");
  const CollateralManager = await ethers.getContractFactory("CollateralManager");
  const collateralManager = await CollateralManager.deploy(await usdc.getAddress());
  await collateralManager.waitForDeployment();
  console.log("CollateralManager deployed to:", await collateralManager.getAddress());

  // Deploy LiquidityPool
  console.log("\n4. Deploying LiquidityPool...");
  const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy(await usdc.getAddress());
  await liquidityPool.waitForDeployment();
  console.log("LiquidityPool deployed to:", await liquidityPool.getAddress());

  // Deploy PerpetualMarket
  console.log("\n5. Deploying PerpetualMarket...");
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
  console.log("PerpetualMarket deployed to:", await perpetualMarket.getAddress());

  // Setup initial configuration
  console.log("\n6. Setting up initial configuration...");

  // Authorize PerpetualMarket in CollateralManager
  await collateralManager.authorizeMarket(await perpetualMarket.getAddress());
  console.log("✓ PerpetualMarket authorized in CollateralManager");

  // Set initial prices in PriceOracle
  await priceOracle.updatePrice("ETH-USD", ethers.parseEther("2000")); // $2000
  await priceOracle.updatePrice("BTC-USD", ethers.parseEther("40000")); // $40000
  console.log("✓ Initial prices set in PriceOracle");

  // Mint some USDC to deployer for testing (only on local networks)
  if (networkName === 'hardhat' || networkName === 'localhost') {
    const mintAmount = ethers.parseUnits("100000", 6); // 100,000 USDC
    await usdc.mint(deployer.address, mintAmount);
    console.log("✓ Minted 100,000 USDC to deployer");
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Network:", networkName);
  console.log("USDC:", await usdc.getAddress());
  console.log("PriceOracle:", await priceOracle.getAddress());
  console.log("CollateralManager:", await collateralManager.getAddress());
  console.log("LiquidityPool:", await liquidityPool.getAddress());
  console.log("PerpetualMarket:", await perpetualMarket.getAddress());

  // Save deployment addresses to a file
  const deploymentInfo = {
    network: networkName,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      USDC: await usdc.getAddress(),
      PriceOracle: await priceOracle.getAddress(),
      CollateralManager: await collateralManager.getAddress(),
      LiquidityPool: await liquidityPool.getAddress(),
      PerpetualMarket: await perpetualMarket.getAddress()
    }
  };

  // Save deployment info to a JSON file
  const deploymentPath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(
    deploymentPath,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`\nDeployment information saved to: ${deploymentPath}`);

  console.log("\n=== Contract ABIs will be available in artifacts/ directory ===");
  console.log("Frontend can import ABIs from:");
  console.log("- artifacts/contracts/PerpetualMarket.sol/PerpetualMarket.json");
  console.log("- artifacts/contracts/CollateralManager.sol/CollateralManager.json");
  console.log("- artifacts/contracts/LiquidityPool.sol/LiquidityPool.json");
  console.log("- artifacts/contracts/PriceOracle.sol/PriceOracle.json");

  // For verification on Etherscan (for testnets and mainnet)
  if (networkName !== 'hardhat' && networkName !== 'localhost') {
    console.log("\n=== Verification Information ===");
    console.log("To verify contracts on Etherscan, run:");
    console.log(`npx hardhat verify --network ${networkName} ${await priceOracle.getAddress()}`);
    console.log(`npx hardhat verify --network ${networkName} ${await collateralManager.getAddress()} "${await usdc.getAddress()}"`);
    console.log(`npx hardhat verify --network ${networkName} ${await liquidityPool.getAddress()} "${await usdc.getAddress()}"`);
    console.log(`npx hardhat verify --network ${networkName} ${await perpetualMarket.getAddress()} "${await priceOracle.getAddress()}" "${await collateralManager.getAddress()}" "${await liquidityPool.getAddress()}" "ETH-USD" "3600" "${ethers.parseEther("0.001")}"`);
  }

  return deploymentInfo;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then((deploymentInfo) => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });