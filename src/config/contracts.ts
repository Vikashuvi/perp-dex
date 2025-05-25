// Contract addresses for different networks
interface ContractAddresses {
  USDC: string;
  PriceOracle: string;
  CollateralManager: string;
  LiquidityPool: string;
  PerpetualMarket: string;
}

interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl?: string;
  blockExplorer?: string;
  contracts: ContractAddresses;
}

// Hardhat local network
const hardhatConfig: NetworkConfig = {
  chainId: 1337,
  name: 'Hardhat',
  rpcUrl: 'http://localhost:8545',
  contracts: {
    USDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    PriceOracle: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    CollateralManager: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    LiquidityPool: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    PerpetualMarket: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
  }
};

// Sepolia testnet
const sepoliaConfig: NetworkConfig = {
  chainId: 11155111,
  name: 'Sepolia',
  rpcUrl: 'https://sepolia.infura.io/v3/your-infura-key',
  blockExplorer: 'https://sepolia.etherscan.io',
  contracts: {
    // These will be populated after deployment
    USDC: '',
    PriceOracle: '',
    CollateralManager: '',
    LiquidityPool: '',
    PerpetualMarket: ''
  }
};

// Map of network configurations by chainId
export const NETWORK_CONFIGS: { [chainId: number]: NetworkConfig } = {
  [hardhatConfig.chainId]: hardhatConfig,
  [sepoliaConfig.chainId]: sepoliaConfig,
};

// Default to hardhat for development
export const DEFAULT_CHAIN_ID = hardhatConfig.chainId;

// Helper function to get contract addresses for a specific network
export function getContractAddresses(chainId: number): ContractAddresses {
  const config = NETWORK_CONFIGS[chainId];
  if (!config) {
    throw new Error(`No configuration found for chainId ${chainId}`);
  }
  return config.contracts;
}

// Helper function to get network config
export function getNetworkConfig(chainId: number): NetworkConfig {
  const config = NETWORK_CONFIGS[chainId];
  if (!config) {
    throw new Error(`No configuration found for chainId ${chainId}`);
  }
  return config;
}
