import React, { useState } from 'react';
import { useAppSelector } from '../store/Hooks';
import AdvancedOrderForm from './AdvancedOrderForm';
import AdvancedPositionsList from './AdvancedPositionsList';
import PriceChart from './PriceChart';
import OrderBook from './OrderBook';

const AdvancedTradingInterface = () => {
  const { isConnected } = useAppSelector((state) => state.wallet);
  const [activeTab, setActiveTab] = useState('trade');
  const [chartTimeframe, setChartTimeframe] = useState('1h');

  if (!isConnected) {
    return (
      <div className="advanced-trading-interface mt-6 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Advanced Trading Interface</h2>
        <p className="text-gray-500">Connect your wallet to access advanced trading features</p>
      </div>
    );
  }

  return (
    <div className="advanced-trading-interface mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left column - Chart */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Price Chart</h2>
              
              {/* Timeframe selector */}
              <div className="flex space-x-1">
                {['5m', '15m', '1h', '4h', '1d'].map((timeframe) => (
                  <button
                    key={timeframe}
                    className={`px-2 py-1 text-xs rounded ${
                      chartTimeframe === timeframe 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => setChartTimeframe(timeframe)}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="h-96">
              <PriceChart />
            </div>
          </div>
        </div>

        {/* Right column - Order form and tabs */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 border-b">
              <div className="flex">
                <button
                  className={`py-3 px-4 font-medium ${
                    activeTab === 'trade' 
                      ? 'border-b-2 border-blue-500 text-blue-500' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('trade')}
                >
                  Trade
                </button>
                <button
                  className={`py-3 px-4 font-medium ${
                    activeTab === 'positions' 
                      ? 'border-b-2 border-blue-500 text-blue-500' 
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('positions')}
                >
                  Positions
                </button>
              </div>
            </div>

            <div className="p-4">
              {activeTab === 'trade' ? (
                <AdvancedOrderForm />
              ) : (
                <AdvancedPositionsList />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order book */}
      <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 p-3 border-b">
          <h2 className="text-lg font-semibold">Order Book</h2>
        </div>
        <div className="p-4">
          <OrderBook />
        </div>
      </div>
    </div>
  );
};

export default AdvancedTradingInterface;
