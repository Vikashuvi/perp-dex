# Contract Integration Guide

This guide explains how to connect your frontend UI to the smart contracts in your perpetual DEX application.

## Overview

The integration between your frontend and smart contracts is handled through several key components:

1. **ContractUtils** - A utility class that provides methods for interacting with contracts
2. **React Hooks** - Custom hooks that make contract data available to your components
3. **Redux Store** - State management for wallet connection and other application state

## Getting Started

### 1. Connect Your Wallet

The first step is to connect your wallet using the WalletConnect component. This component uses the `contractUtils.connectWallet()` method to establish a connection to your Ethereum wallet (like MetaMask).

```jsx
// Example from WalletConnect.tsx
const connectWallet = async () => {
  setLoading(true);
  try {
    // Use contractUtils to connect wallet
    const connectedAddress = await contractUtils.connectWallet();
    
    if (connectedAddress) {
      const chainId = await window.ethereum!.request({
        method: 'eth_chainId'
      });
      
      dispatch(setWalletConnection({
        address: connectedAddress,
        chainId
      }));
    }
  } catch (error) {
    console.error('Error connecting to wallet:', error);
  } finally {
    setLoading(false);
  }
};
```

### 2. Use Contract Hooks

Once your wallet is connected, you can use the custom hooks to interact with the contracts:

#### useContracts Hook

This hook provides methods for interacting with all contracts in the system:

```jsx
import { useContracts } from '../hooks/useContracts';

function MyComponent() {
  const { 
    // Data
    position,
    marketData,
    userBalance,
    usdcBalance,
    
    // Loading states
    loading,
    
    // Error states
    error,
    
    // Functions
    openPosition,
    closePosition,
    depositCollateral,
    withdrawCollateral,
    
    // Utility functions
    formatUSDC,
    parseUSDC
  } = useContracts();
  
  // Now you can use these functions and data in your component
}
```

#### usePriceData Hook

This hook provides real-time price data:

```jsx
import { usePriceData } from '../hooks/usePriceData';

function PriceDisplay() {
  const { 
    currentPrice,
    historicalPrices,
    loading,
    error,
    formatPrice
  } = usePriceData('ETH-USD');
  
  // Now you can display the price data
  return (
    <div>
      <h2>Current Price: ${formatPrice(currentPrice)}</h2>
    </div>
  );
}
```

## Common Tasks

### Opening a Position

To open a trading position:

```jsx
const { openPosition, parseUSDC } = useContracts();

// Later in your code:
const handleOpenPosition = async () => {
  try {
    const marginAmount = parseUSDC("1000"); // 1000 USDC
    const leverage = 5; // 5x leverage
    const isLong = true; // Long position
    
    const tx = await openPosition(marginAmount, leverage, isLong);
    
    if (tx) {
      // Transaction successful
      console.log("Position opened successfully!");
    }
  } catch (error) {
    console.error("Error opening position:", error);
  }
};
```

### Closing a Position

To close an existing position:

```jsx
const { closePosition } = useContracts();

// Later in your code:
const handleClosePosition = async () => {
  try {
    const tx = await closePosition();
    
    if (tx) {
      // Transaction successful
      console.log("Position closed successfully!");
    }
  } catch (error) {
    console.error("Error closing position:", error);
  }
};
```

### Depositing Collateral

To deposit collateral:

```jsx
const { depositCollateral, parseUSDC } = useContracts();

// Later in your code:
const handleDepositCollateral = async () => {
  try {
    const amount = parseUSDC("500"); // 500 USDC
    
    const tx = await depositCollateral(amount);
    
    if (tx) {
      // Transaction successful
      console.log("Collateral deposited successfully!");
    }
  } catch (error) {
    console.error("Error depositing collateral:", error);
  }
};
```

### Withdrawing Collateral

To withdraw collateral:

```jsx
const { withdrawCollateral, parseUSDC } = useContracts();

// Later in your code:
const handleWithdrawCollateral = async () => {
  try {
    const amount = parseUSDC("200"); // 200 USDC
    
    const tx = await withdrawCollateral(amount);
    
    if (tx) {
      // Transaction successful
      console.log("Collateral withdrawn successfully!");
    }
  } catch (error) {
    console.error("Error withdrawing collateral:", error);
  }
};
```

## Contract Addresses

The contract addresses are defined in the `ContractUtils.ts` file:

```typescript
export const CONTRACT_ADDRESSES = {
  USDC: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  PriceOracle: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  CollateralManager: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  LiquidityPool: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  PerpetualMarket: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
};
```

These addresses should be updated when you deploy your contracts to different networks.

## Error Handling

All contract interactions include error handling. You can access error states from the hooks:

```jsx
const { error, loading } = useContracts();

// Later in your component:
if (loading.openPosition) {
  return <div>Opening position...</div>;
}

if (error.openPosition) {
  return <div>Error: {error.openPosition}</div>;
}
```

## Next Steps

1. **Deploy Contracts to Testnet** - Deploy your contracts to a testnet like Sepolia or Goerli
2. **Update Contract Addresses** - Update the addresses in ContractUtils.ts
3. **Add More UI Components** - Create more UI components that use the contract hooks
4. **Implement Event Listeners** - Listen for contract events to update the UI in real-time

## Troubleshooting

### Common Issues

1. **Wallet Not Connected** - Make sure your wallet is connected before trying to interact with contracts
2. **Wrong Network** - Ensure you're connected to the correct network where your contracts are deployed
3. **Insufficient Funds** - Make sure you have enough ETH for gas and enough USDC for collateral
4. **Transaction Errors** - Check the console for detailed error messages from failed transactions

### Getting Help

If you encounter issues, check the following resources:
- Contract code in the `contracts/` directory
- Test files in the `test/` directory
- Implementation details in `src/utils/ContractUtils.ts`
