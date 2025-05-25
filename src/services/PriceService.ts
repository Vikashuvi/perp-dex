import { ethers } from 'ethers';
import { contractUtils } from '../utils/ContractUtils';

// Types for price data
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

// Event listeners for price updates
type PriceUpdateCallback = (data: PriceData) => void;

class PriceService {
  private priceListeners: Map<string, Set<PriceUpdateCallback>> = new Map();
  private pollingIntervals: Map<string, NodeJS.Timeout> = new Map();
  private cachedPrices: Map<string, PriceData> = new Map();
  private historicalData: Map<string, HistoricalPriceData> = new Map();
  
  // Default polling interval in milliseconds
  private defaultPollingInterval = 10000; // 10 seconds
  
  constructor() {
    // Initialize with some default symbols
    this.startPolling('ETH-USD');
    this.generateMockHistoricalData('ETH-USD');
  }
  
  // Get current price for a symbol
  async getCurrentPrice(symbol: string): Promise<PriceData> {
    try {
      const price = await contractUtils.getCurrentPrice(symbol);
      
      const priceData: PriceData = {
        symbol,
        price,
        timestamp: Date.now()
      };
      
      // Update cache
      this.cachedPrices.set(symbol, priceData);
      
      // Add to historical data
      this.addToHistoricalData(symbol, parseFloat(ethers.formatEther(price)));
      
      // Notify listeners
      this.notifyListeners(symbol, priceData);
      
      return priceData;
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
      
      // Return cached price if available
      const cachedPrice = this.cachedPrices.get(symbol);
      if (cachedPrice) {
        return cachedPrice;
      }
      
      // Return default price if no cached price
      return {
        symbol,
        price: BigInt(0),
        timestamp: Date.now()
      };
    }
  }
  
  // Subscribe to price updates
  subscribeToPriceUpdates(symbol: string, callback: PriceUpdateCallback): () => void {
    // Create set of listeners for this symbol if it doesn't exist
    if (!this.priceListeners.has(symbol)) {
      this.priceListeners.set(symbol, new Set());
    }
    
    // Add callback to listeners
    this.priceListeners.get(symbol)!.add(callback);
    
    // Start polling if not already polling
    if (!this.pollingIntervals.has(symbol)) {
      this.startPolling(symbol);
    }
    
    // Return unsubscribe function
    return () => {
      const listeners = this.priceListeners.get(symbol);
      if (listeners) {
        listeners.delete(callback);
        
        // If no more listeners, stop polling
        if (listeners.size === 0) {
          this.stopPolling(symbol);
        }
      }
    };
  }
  
  // Get historical price data
  getHistoricalPriceData(symbol: string): HistoricalPriceData {
    // Return historical data if available
    if (this.historicalData.has(symbol)) {
      return this.historicalData.get(symbol)!;
    }
    
    // Generate mock data if not available
    this.generateMockHistoricalData(symbol);
    return this.historicalData.get(symbol)!;
  }
  
  // Private methods
  
  // Start polling for price updates
  private startPolling(symbol: string) {
    // Clear existing interval if any
    this.stopPolling(symbol);
    
    // Fetch initial price
    this.getCurrentPrice(symbol);
    
    // Set up interval
    const intervalId = setInterval(() => {
      this.getCurrentPrice(symbol);
    }, this.defaultPollingInterval);
    
    // Store interval ID
    this.pollingIntervals.set(symbol, intervalId);
  }
  
  // Stop polling for price updates
  private stopPolling(symbol: string) {
    const intervalId = this.pollingIntervals.get(symbol);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(symbol);
    }
  }
  
  // Notify listeners of price updates
  private notifyListeners(symbol: string, priceData: PriceData) {
    const listeners = this.priceListeners.get(symbol);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(priceData);
        } catch (error) {
          console.error('Error in price update callback:', error);
        }
      });
    }
  }
  
  // Add price to historical data
  private addToHistoricalData(symbol: string, price: number) {
    if (!this.historicalData.has(symbol)) {
      this.generateMockHistoricalData(symbol);
    }
    
    const data = this.historicalData.get(symbol)!;
    
    // Add new price
    data.prices.push({
      price,
      timestamp: Date.now()
    });
    
    // Keep only the last 100 data points
    if (data.prices.length > 100) {
      data.prices = data.prices.slice(-100);
    }
    
    // Update historical data
    this.historicalData.set(symbol, data);
  }
  
  // Generate mock historical data
  private generateMockHistoricalData(symbol: string) {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const prices = [];
    
    let basePrice = 0;
    
    // Set base price based on symbol
    switch (symbol) {
      case 'ETH-USD':
        basePrice = 2000;
        break;
      case 'BTC-USD':
        basePrice = 40000;
        break;
      case 'LINK-USD':
        basePrice = 20;
        break;
      default:
        basePrice = 100;
    }
    
    // Generate 24 hours of hourly data
    for (let i = 24; i >= 0; i--) {
      const randomVariation = (Math.random() - 0.5) * (basePrice * 0.05); // Random variation of ±2.5%
      
      prices.push({
        price: basePrice + randomVariation,
        timestamp: now - (i * oneHour)
      });
    }
    
    this.historicalData.set(symbol, {
      symbol,
      prices
    });
  }
}

// Export singleton instance
export const priceService = new PriceService();
