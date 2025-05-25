import * as fs from 'fs';
import * as path from 'path';

// This script updates the contract addresses in the frontend configuration
// after deploying to a testnet or mainnet

async function main() {
  const networkName = process.argv[2];
  if (!networkName) {
    console.error('Please provide a network name as an argument');
    process.exit(1);
  }

  console.log(`Updating contract configuration for network: ${networkName}`);

  // Path to the deployment file
  const deploymentsDir = path.join(__dirname, '../deployments');
  const deploymentPath = path.join(deploymentsDir, `${networkName}.json`);

  // Check if deployment file exists
  if (!fs.existsSync(deploymentPath)) {
    console.error(`Deployment file not found: ${deploymentPath}`);
    console.error('Please deploy contracts first using: npx hardhat run scripts/deploy.ts --network <network>');
    process.exit(1);
  }

  // Read deployment information
  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const { contracts, network: deployedNetwork } = deploymentInfo;

  // Path to the contracts configuration file
  const configPath = path.join(__dirname, '../src/config/contracts.ts');

  // Read current configuration
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Determine the network configuration to update
  let networkConfigName: string;
  switch (networkName) {
    case 'sepolia':
      networkConfigName = 'sepoliaConfig';
      break;
    case 'hardhat':
    case 'localhost':
      networkConfigName = 'hardhatConfig';
      break;
    default:
      console.error(`Unknown network: ${networkName}`);
      process.exit(1);
  }

  // Update the contract addresses in the configuration
  const contractsRegex = new RegExp(`(const ${networkConfigName}[\\s\\S]*?contracts:\\s*{[\\s\\S]*?)USDC:\\s*['"].*?['"]([\\s\\S]*?)PriceOracle:\\s*['"].*?['"]([\\s\\S]*?)CollateralManager:\\s*['"].*?['"]([\\s\\S]*?)LiquidityPool:\\s*['"].*?['"]([\\s\\S]*?)PerpetualMarket:\\s*['"].*?['"]([\\s\\S]*?})`);
  
  const updatedConfig = configContent.replace(
    contractsRegex,
    `$1USDC: '${contracts.USDC}'$2PriceOracle: '${contracts.PriceOracle}'$3CollateralManager: '${contracts.CollateralManager}'$4LiquidityPool: '${contracts.LiquidityPool}'$5PerpetualMarket: '${contracts.PerpetualMarket}'$6`
  );

  // Write updated configuration back to file
  fs.writeFileSync(configPath, updatedConfig);

  console.log(`Contract addresses updated in: ${configPath}`);
  console.log('Updated addresses:');
  console.log(`  USDC: ${contracts.USDC}`);
  console.log(`  PriceOracle: ${contracts.PriceOracle}`);
  console.log(`  CollateralManager: ${contracts.CollateralManager}`);
  console.log(`  LiquidityPool: ${contracts.LiquidityPool}`);
  console.log(`  PerpetualMarket: ${contracts.PerpetualMarket}`);
}

main()
  .then(() => {
    console.log('✅ Configuration updated successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Update failed:', error);
    process.exit(1);
  });
