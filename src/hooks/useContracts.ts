import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { useAppSelector, useAppDispatch } from '../store/Hooks';
import { contractUtils } from '../utils/ContractUtils';
import { addNotification } from '../store/NotificationSlice';

// Define types for our hook
export interface ContractPosition {
  size: bigint;
  margin: bigint;
  entryPrice: bigint;
  isLong: boolean;
  lastFundingPayment: bigint;
}

export interface MarketData {
  symbol: string;
  currentPrice: bigint;
  openInterestLong: bigint;
  openInterestShort: bigint;
  fundingRate: bigint;
  tradingEnabled: boolean;
}

export interface UserBalance {
  total: bigint;
  available: bigint;
  locked: bigint;
}

// Main hook for contract interactions
export const useContracts = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  
  // State for contract data
  const [position, setPosition] = useState<ContractPosition | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [userBalance, setUserBalance] = useState<UserBalance | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    position: false,
    marketData: false,
    userBalance: false,
    usdcBalance: false,
    openPosition: false,
    closePosition: false,
    depositCollateral: false,
    withdrawCollateral: false
  });
  const [error, setError] = useState<{[key: string]: string | null}>({
    position: null,
    marketData: null,
    userBalance: null,
    usdcBalance: null,
    openPosition: null,
    closePosition: null,
    depositCollateral: null,
    withdrawCollateral: null
  });

  // Function to fetch user's position
  const fetchPosition = useCallback(async () => {
    if (!isConnected || !address) return;
    
    setLoading(prev => ({ ...prev, position: true }));
    setError(prev => ({ ...prev, position: null }));
    
    try {
      const userPosition = await contractUtils.getUserPosition(address);
      setPosition(userPosition);
    } catch (err) {
      console.error('Error fetching position:', err);
      setError(prev => ({ ...prev, position: (err as Error).message }));
      setPosition(null);
    } finally {
      setLoading(prev => ({ ...prev, position: false }));
    }
  }, [address, isConnected]);

  // Function to fetch market data
  const fetchMarketData = useCallback(async (symbol: string = 'ETH-USD') => {
    setLoading(prev => ({ ...prev, marketData: true }));
    setError(prev => ({ ...prev, marketData: null }));
    
    try {
      const data = await contractUtils.getMarketData(symbol);
      setMarketData(data);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(prev => ({ ...prev, marketData: (err as Error).message }));
      setMarketData(null);
    } finally {
      setLoading(prev => ({ ...prev, marketData: false }));
    }
  }, []);

  // Function to fetch user balance
  const fetchUserBalance = useCallback(async () => {
    if (!isConnected || !address) return;
    
    setLoading(prev => ({ ...prev, userBalance: true }));
    setError(prev => ({ ...prev, userBalance: null }));
    
    try {
      const balance = await contractUtils.getUserBalance(address);
      setUserBalance(balance);
    } catch (err) {
      console.error('Error fetching user balance:', err);
      setError(prev => ({ ...prev, userBalance: (err as Error).message }));
      setUserBalance(null);
    } finally {
      setLoading(prev => ({ ...prev, userBalance: false }));
    }
  }, [address, isConnected]);

  // Function to fetch USDC balance
  const fetchUsdcBalance = useCallback(async () => {
    if (!isConnected || !address) return;
    
    setLoading(prev => ({ ...prev, usdcBalance: true }));
    setError(prev => ({ ...prev, usdcBalance: null }));
    
    try {
      const balance = await contractUtils.getUSDCBalance(address);
      setUsdcBalance(balance);
    } catch (err) {
      console.error('Error fetching USDC balance:', err);
      setError(prev => ({ ...prev, usdcBalance: (err as Error).message }));
      setUsdcBalance(BigInt(0));
    } finally {
      setLoading(prev => ({ ...prev, usdcBalance: false }));
    }
  }, [address, isConnected]);

  // Function to open a position
  const openPosition = useCallback(async (margin: bigint, leverage: number, isLong: boolean) => {
    if (!isConnected) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please connect your wallet first'
      }));
      return;
    }
    
    setLoading(prev => ({ ...prev, openPosition: true }));
    setError(prev => ({ ...prev, openPosition: null }));
    
    try {
      const tx = await contractUtils.openPosition(margin, leverage, isLong);
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...'
      }));
      
      await tx.wait();
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: `Successfully opened ${isLong ? 'long' : 'short'} position`
      }));
      
      // Refresh data
      fetchPosition();
      fetchUserBalance();
      fetchMarketData();
      
      return tx;
    } catch (err) {
      console.error('Error opening position:', err);
      setError(prev => ({ ...prev, openPosition: (err as Error).message }));
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: `Failed to open position: ${(err as Error).message}`
      }));
      
      return null;
    } finally {
      setLoading(prev => ({ ...prev, openPosition: false }));
    }
  }, [isConnected, dispatch, fetchPosition, fetchUserBalance, fetchMarketData]);

  // Function to close a position
  const closePosition = useCallback(async () => {
    if (!isConnected) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please connect your wallet first'
      }));
      return;
    }
    
    setLoading(prev => ({ ...prev, closePosition: true }));
    setError(prev => ({ ...prev, closePosition: null }));
    
    try {
      const tx = await contractUtils.closePosition();
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...'
      }));
      
      await tx.wait();
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: 'Successfully closed position'
      }));
      
      // Refresh data
      fetchPosition();
      fetchUserBalance();
      fetchMarketData();
      
      return tx;
    } catch (err) {
      console.error('Error closing position:', err);
      setError(prev => ({ ...prev, closePosition: (err as Error).message }));
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: `Failed to close position: ${(err as Error).message}`
      }));
      
      return null;
    } finally {
      setLoading(prev => ({ ...prev, closePosition: false }));
    }
  }, [isConnected, dispatch, fetchPosition, fetchUserBalance, fetchMarketData]);

  // Function to deposit collateral
  const depositCollateral = useCallback(async (amount: bigint) => {
    if (!isConnected) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please connect your wallet first'
      }));
      return;
    }
    
    setLoading(prev => ({ ...prev, depositCollateral: true }));
    setError(prev => ({ ...prev, depositCollateral: null }));
    
    try {
      const tx = await contractUtils.depositCollateral(amount);
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...'
      }));
      
      await tx.wait();
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: `Successfully deposited ${contractUtils.formatUSDC(amount)} USDC`
      }));
      
      // Refresh data
      fetchUserBalance();
      fetchUsdcBalance();
      
      return tx;
    } catch (err) {
      console.error('Error depositing collateral:', err);
      setError(prev => ({ ...prev, depositCollateral: (err as Error).message }));
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: `Failed to deposit collateral: ${(err as Error).message}`
      }));
      
      return null;
    } finally {
      setLoading(prev => ({ ...prev, depositCollateral: false }));
    }
  }, [isConnected, dispatch, fetchUserBalance, fetchUsdcBalance]);

  // Function to withdraw collateral
  const withdrawCollateral = useCallback(async (amount: bigint) => {
    if (!isConnected) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'Please connect your wallet first'
      }));
      return;
    }
    
    setLoading(prev => ({ ...prev, withdrawCollateral: true }));
    setError(prev => ({ ...prev, withdrawCollateral: null }));
    
    try {
      const tx = await contractUtils.withdrawCollateral(amount);
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'info',
        message: 'Transaction submitted. Waiting for confirmation...'
      }));
      
      await tx.wait();
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'success',
        message: `Successfully withdrew ${contractUtils.formatUSDC(amount)} USDC`
      }));
      
      // Refresh data
      fetchUserBalance();
      fetchUsdcBalance();
      
      return tx;
    } catch (err) {
      console.error('Error withdrawing collateral:', err);
      setError(prev => ({ ...prev, withdrawCollateral: (err as Error).message }));
      
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: `Failed to withdraw collateral: ${(err as Error).message}`
      }));
      
      return null;
    } finally {
      setLoading(prev => ({ ...prev, withdrawCollateral: false }));
    }
  }, [isConnected, dispatch, fetchUserBalance, fetchUsdcBalance]);

  // Load data when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchPosition();
      fetchUserBalance();
      fetchUsdcBalance();
      fetchMarketData();
    }
  }, [isConnected, address, fetchPosition, fetchUserBalance, fetchUsdcBalance, fetchMarketData]);

  return {
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
    fetchPosition,
    fetchMarketData,
    fetchUserBalance,
    fetchUsdcBalance,
    openPosition,
    closePosition,
    depositCollateral,
    withdrawCollateral,
    
    // Utility functions
    formatUSDC: contractUtils.formatUSDC,
    parseUSDC: contractUtils.parseUSDC,
    formatPrice: contractUtils.formatPrice,
    parsePrice: contractUtils.parsePrice
  };
};
