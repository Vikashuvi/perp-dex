# Deployment Guide

This guide explains how to deploy your Perpetual DEX contracts to a testnet or mainnet and update the frontend to use the deployed contracts.

## Prerequisites

Before deploying, make sure you have:

1. A wallet with ETH on the target network (for gas fees)
2. API keys for the target network's RPC provider (e.g., Infura, Alchemy)
3. Etherscan API key (for contract verification)

## Step 1: Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```
# Deployment
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
ETHERSCAN_API_KEY=your_etherscan_api_key

# For testnet deployment, you might want to use an existing USDC contract
USDC_ADDRESS=0x1234...  # Optional: existing USDC address on the target network
```

## Step 2: Deploy Contracts to Testnet

Run the deployment script targeting your desired network:

```bash
# For Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia
```

This will:
1. Deploy all contracts to the specified network
2. Set up initial configuration
3. Save deployment information to `deployments/<network>.json`
4. Output verification commands for Etherscan

## Step 3: Verify Contracts on Etherscan (Optional)

Verify your contracts on Etherscan using the commands output by the deployment script:

```bash
npx hardhat verify --network sepolia <PriceOracle_ADDRESS>
npx hardhat verify --network sepolia <CollateralManager_ADDRESS> "<USDC_ADDRESS>"
npx hardhat verify --network sepolia <LiquidityPool_ADDRESS> "<USDC_ADDRESS>"
npx hardhat verify --network sepolia <PerpetualMarket_ADDRESS> "<PriceOracle_ADDRESS>" "<CollateralManager_ADDRESS>" "<LiquidityPool_ADDRESS>" "ETH-USD" "3600" "1000000000000000"
```

## Step 4: Update Frontend Configuration

After deploying, update the frontend configuration to use the deployed contract addresses:

```bash
# For Sepolia testnet
npx ts-node scripts/update-contract-config.ts sepolia
```

This will update the contract addresses in `src/config/contracts.ts` based on the deployment information.

## Step 5: Build and Deploy Frontend

Build the frontend for production:

```bash
npm run build
```

Then deploy the built frontend to your hosting provider of choice (Netlify, Vercel, etc.).

## Testing the Deployment

1. Connect your wallet to the deployed frontend
2. Make sure you're connected to the correct network
3. Try interacting with the contracts (deposit collateral, open a position, etc.)
4. Check that events are being properly displayed in the UI

## Troubleshooting

### Contract Interaction Issues

If you encounter issues interacting with the contracts:

1. Check that you're connected to the correct network
2. Verify that the contract addresses in the frontend match the deployed addresses
3. Check the browser console for errors
4. Make sure you have enough ETH for gas and the appropriate tokens for interactions

### Network Configuration Issues

If the frontend doesn't recognize your network:

1. Check that the network is properly configured in `src/config/contracts.ts`
2. Make sure the chainId matches the network you're connected to
3. Try switching networks in your wallet and reconnecting

## Mainnet Deployment

For mainnet deployment, follow the same steps but use the `mainnet` network in Hardhat:

```bash
# Add mainnet configuration to hardhat.config.cjs first
npx hardhat run scripts/deploy.ts --network mainnet
```

**Important:** Before deploying to mainnet, thoroughly test your contracts on testnets and consider getting a security audit.
