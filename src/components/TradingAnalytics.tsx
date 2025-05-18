import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/Hooks';

// Define types for analytics data
interface TradeStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageProfit: number;
  averageLoss: number;
  profitFactor: number;
  totalPnL: number;
}

interface Trade {
  id: string;
  market: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  pnlPercentage: number;
  openTime: number;
  closeTime: number;
}

interface PerformanceByMarket {
  market: string;
  trades: number;
  winRate: number;
  pnl: number;
}

interface PerformanceByDirection {
  direction: 'long' | 'short';
  trades: number;
  winRate: number;
  pnl: number;
}

const TradingAnalytics = () => {
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  
  // Local state
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [tradeStats, setTradeStats] = useState<TradeStats>({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    averageProfit: 0,
    averageLoss: 0,
    profitFactor: 0,
    totalPnL: 0
  });
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [performanceByMarket, setPerformanceByMarket] = useState<PerformanceByMarket[]>([]);
  const [performanceByDirection, setPerformanceByDirection] = useState<PerformanceByDirection[]>([]);
  
  // Mock data - in a real app, this would come from an API or blockchain
  useEffect(() => {
    if (isConnected) {
      // Generate mock data based on time range
      generateMockData(timeRange);
    }
  }, [isConnected, timeRange]);
  
  // Generate mock data
  const generateMockData = (range: 'day' | 'week' | 'month' | 'all') => {
    // Generate different data based on time range
    let mockTrades: Trade[] = [];
    const now = Date.now();
    
    // Define time range in milliseconds
    const timeRanges = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      all: 365 * 24 * 60 * 60 * 1000
    };
    
    // Number of trades to generate
    const tradeCount = {
      day: 5,
      week: 15,
      month: 40,
      all: 100
    };
    
    // Generate random trades
    for (let i = 0; i < tradeCount[range]; i++) {
      const isLong = Math.random() > 0.5;
      const market = ['ETH-USD', 'BTC-USD', 'SOL-USD'][Math.floor(Math.random() * 3)];
      const entryPrice = market === 'ETH-USD' ? 1800 + Math.random() * 100 : 
                         market === 'BTC-USD' ? 35000 + Math.random() * 1000 : 
                         45 + Math.random() * 5;
      
      // Randomize profit/loss with slight bias towards profit
      const isProfitable = Math.random() > 0.45;
      const pnlPercentage = isProfitable ? Math.random() * 10 : -Math.random() * 8;
      const exitPrice = isLong ? 
                        entryPrice * (1 + pnlPercentage / 100) : 
                        entryPrice * (1 - pnlPercentage / 100);
      
      const size = 100 + Math.random() * 900;
      const pnl = (size * pnlPercentage) / 100;
      
      // Random time within the selected range
      const closeTime = now - Math.random() * timeRanges[range];
      const openTime = closeTime - (1 + Math.random() * 24) * 60 * 60 * 1000; // 1-25 hours before close
      
      mockTrades.push({
        id: `trade-${i}`,
        market,
        side: isLong ? 'long' : 'short',
        entryPrice,
        exitPrice,
        size,
        pnl,
        pnlPercentage,
        openTime,
        closeTime
      });
    }
    
    // Sort by close time (most recent first)
    mockTrades.sort((a, b) => b.closeTime - a.closeTime);
    
    // Calculate trade stats
    const winningTrades = mockTrades.filter(t => t.pnl > 0);
    const losingTrades = mockTrades.filter(t => t.pnl <= 0);
    
    const totalPnL = mockTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalWinnings = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    
    const stats: TradeStats = {
      totalTrades: mockTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: mockTrades.length > 0 ? (winningTrades.length / mockTrades.length) * 100 : 0,
      averageProfit: winningTrades.length > 0 ? totalWinnings / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      profitFactor: totalLosses > 0 ? totalWinnings / totalLosses : 0,
      totalPnL
    };
    
    // Calculate performance by market
    const markets = ['ETH-USD', 'BTC-USD', 'SOL-USD'];
    const marketPerformance = markets.map(market => {
      const marketTrades = mockTrades.filter(t => t.market === market);
      const marketWins = marketTrades.filter(t => t.pnl > 0);
      return {
        market,
        trades: marketTrades.length,
        winRate: marketTrades.length > 0 ? (marketWins.length / marketTrades.length) * 100 : 0,
        pnl: marketTrades.reduce((sum, trade) => sum + trade.pnl, 0)
      };
    });
    
    // Calculate performance by direction
    const longTrades = mockTrades.filter(t => t.side === 'long');
    const shortTrades = mockTrades.filter(t => t.side === 'short');
    const longWins = longTrades.filter(t => t.pnl > 0);
    const shortWins = shortTrades.filter(t => t.pnl > 0);
    
    const directionPerformance = [
      {
        direction: 'long' as const,
        trades: longTrades.length,
        winRate: longTrades.length > 0 ? (longWins.length / longTrades.length) * 100 : 0,
        pnl: longTrades.reduce((sum, trade) => sum + trade.pnl, 0)
      },
      {
        direction: 'short' as const,
        trades: shortTrades.length,
        winRate: shortTrades.length > 0 ? (shortWins.length / shortTrades.length) * 100 : 0,
        pnl: shortTrades.reduce((sum, trade) => sum + trade.pnl, 0)
      }
    ];
    
    // Update state
    setTradeStats(stats);
    setRecentTrades(mockTrades.slice(0, 10)); // Only show 10 most recent trades
    setPerformanceByMarket(marketPerformance);
    setPerformanceByDirection(directionPerformance);
  };
  
  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };
  
  if (!isConnected) {
    return (
      <div className="trading-analytics mt-6 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Trading Analytics</h2>
        <p className="text-gray-500">Connect your wallet to view your trading analytics</p>
      </div>
    );
  }
  
  return (
    <div className="trading-analytics mt-6">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Trading Analytics</h2>
          
          {/* Time range selector */}
          <div className="flex space-x-2">
            {['day', 'week', 'month', 'all'].map((range) => (
              <button
                key={range}
                className={`px-3 py-1 text-sm rounded ${
                  timeRange === range ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
                onClick={() => setTimeRange(range as any)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total PnL</div>
              <div className={`text-xl font-medium ${tradeStats.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${tradeStats.totalPnL.toFixed(2)}
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Win Rate</div>
              <div className="text-xl font-medium">{tradeStats.winRate.toFixed(1)}%</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Total Trades</div>
              <div className="text-xl font-medium">{tradeStats.totalTrades}</div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">Profit Factor</div>
              <div className="text-xl font-medium">{tradeStats.profitFactor.toFixed(2)}</div>
            </div>
          </div>
          
          {/* Performance by market */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Performance by Market</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trades
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Win Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PnL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {performanceByMarket.map((item) => (
                    <tr key={item.market}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {item.market}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.trades}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.winRate.toFixed(1)}%
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                        item.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        ${item.pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Performance by direction */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Performance by Direction</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceByDirection.map((item) => (
                <div key={item.direction} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">
                      {item.direction === 'long' ? 'Long Positions' : 'Short Positions'}
                    </div>
                    <div className={`${
                      item.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      ${item.pnl.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>Trades: {item.trades}</div>
                    <div>Win Rate: {item.winRate.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent trades */}
          <div>
            <h3 className="text-lg font-medium mb-3">Recent Trades</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Market
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Side
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entry/Exit
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PnL
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Close Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTrades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {trade.market}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trade.side === 'long' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {trade.side === 'long' ? 'Long' : 'Short'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        ${trade.size.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        ${trade.entryPrice.toFixed(2)} / ${trade.exitPrice.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                        trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        ${trade.pnl.toFixed(2)} ({trade.pnlPercentage.toFixed(2)}%)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(trade.closeTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingAnalytics;
