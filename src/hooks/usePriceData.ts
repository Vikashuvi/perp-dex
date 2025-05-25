import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { contractUtils } from '../utils/ContractUtils';

// Define types for price data
export interface PriceData {
  symbol: string;
  price: bigint;
  timestamp: number;
}

export interface HistoricalPriceData {
  symbol: string;
  prices: {
    price: number;
    timestamp: number;
  }[];
}

// Main hook for price data
export const usePriceData = (symbol: string = 'ETH-USD') => {
  const [currentPrice, setCurrentPrice] = useState<bigint>(BigInt(0));
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPriceData>({
    symbol,
    prices: []
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch current price
  const fetchCurrentPrice = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const price = await contractUtils.getCurrentPrice(symbol);
      setCurrentPrice(price);
      
      // Add to historical prices
      const formattedPrice = parseFloat(ethers.formatEther(price));
      setHistoricalPrices(prev => ({
        ...prev,
        prices: [
          ...prev.prices,
          {
            price: formattedPrice,
            timestamp: Date.now()
          }
        ].slice(-100) // Keep only the last 100 data points
      }));
      
      return price;
    } catch (err) {
      console.error('Error fetching price:', err);
      setError((err as Error).message);
      return BigInt(0);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Mock function to generate historical price data
  // In a real app, this would fetch from an API or blockchain
  const generateMockHistoricalData = useCallback(() => {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const prices = [];
    
    // Generate 24 hours of hourly data
    for (let i = 24; i >= 0; i--) {
      const basePrice = 2000; // Base price around $2000
      const randomVariation = (Math.random() - 0.5) * 100; // Random variation of ±$50
      
      prices.push({
        price: basePrice + randomVariation,
        timestamp: now - (i * oneHour)
      });
    }
    
    setHistoricalPrices({
      symbol,
      prices
    });
  }, [symbol]);

  // Initialize historical data
  useEffect(() => {
    generateMockHistoricalData();
  }, [generateMockHistoricalData]);

  // Fetch price on mount and set up interval
  useEffect(() => {
    // Fetch initial price
    fetchCurrentPrice();
    
    // Set up interval to fetch price every 10 seconds
    const intervalId = setInterval(() => {
      fetchCurrentPrice();
    }, 10000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchCurrentPrice]);

  // Format price for display
  const formatPrice = (price: bigint): string => {
    return contractUtils.formatPrice(price);
  };

  return {
    currentPrice,
    historicalPrices,
    loading,
    error,
    fetchCurrentPrice,
    formatPrice
  };
};
