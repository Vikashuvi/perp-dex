import React, { useState } from 'react';
import { useAppSelector } from '../store/Hooks';

interface Trade {
  id: string;
  trader: string;
  market: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  timestamp: number;
  fee: number;
}

// Mock data - in a real app, this would come from an API or blockchain
const mockTrades: Trade[] = [
  {
    id: '1',
    trader: '0x1234...5678',
    market: 'ETH-USD',
    side: 'buy',
    size: 5.2,
    price: 1805.25,
    timestamp: Date.now() - 120000, // 2 minutes ago
    fee: 2.35
  },
  {
    id: '2',
    trader: '0x8765...4321',
    market: 'ETH-USD',
    side: 'sell',
    size: 10.5,
    price: 1802.75,
    timestamp: Date.now() - 180000, // 3 minutes ago
    fee: 4.73
  },
  {
    id: '3',
    trader: '0x5678...1234',
    market: 'ETH-USD',
    side: 'buy',
    size: 2.8,
    price: 1800.50,
    timestamp: Date.now() - 240000, // 4 minutes ago
    fee: 1.26
  },
  {
    id: '4',
    trader: '0x4321...8765',
    market: 'ETH-USD',
    side: 'sell',
    size: 7.3,
    price: 1798.25,
    timestamp: Date.now() - 300000, // 5 minutes ago
    fee: 3.28
  },
  {
    id: '5',
    trader: '0x1234...5678',
    market: 'ETH-USD',
    side: 'buy',
    size: 3.1,
    price: 1795.75,
    timestamp: Date.now() - 360000, // 6 minutes ago
    fee: 1.39
  }
];

const TradeHistory = () => {
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const { address } = useAppSelector((state) => state.wallet);
  
  // Format timestamp to readable time
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return new Date(timestamp).toLocaleTimeString();
    }
  };
  
  // Filter trades based on selected filter
  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    return trade.side === filter;
  });
  
  return (
    <div className="trade-history mt-6">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Trades</h2>
          
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 text-sm rounded ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${filter === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('buy')}
            >
              Buys
            </button>
            <button
              className={`px-3 py-1 text-sm rounded ${filter === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setFilter('sell')}
            >
              Sells
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Side
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fee
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrades.map((trade) => (
                <tr key={trade.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTime(trade.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {trade.market}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      trade.side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.side === 'buy' ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    ${trade.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {trade.size.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                    ${trade.fee.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTrades.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No trades found
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeHistory;
