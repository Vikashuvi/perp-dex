import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/Hooks';
import OrderForm from './OrderForm';
import PositionsList from './PositionsList';
import PriceChart from './PriceChart';
import OrderBook from './OrderBook';

const TradingInterface = () => {
  const { isConnected } = useAppSelector((state) => state.wallet);
  const [activeTab, setActiveTab] = useState('trade');
  const [chartTimeframe, setChartTimeframe] = useState('1h');
  const isDarkMode = document.documentElement.classList.contains('dark');

  if (!isConnected) {
    return (
      <div className={`trading-interface mt-6 p-6 border rounded-lg shadow-sm transition-colors duration-200 ${
        isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
      }`}>
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <h2 className="text-xl font-semibold mb-2">Trading Interface Locked</h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} max-w-md mx-auto`}>
            Connect your wallet to access trading features and start trading on the Perpetual DEX
          </p>
          <button className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-interface mt-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Chart */}
        <div className="lg:col-span-2">
          <div className={`rounded-lg shadow-sm overflow-hidden transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className={`flex justify-between items-center px-4 py-3 border-b ${
              isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
            }`}>
              <h2 className="text-lg font-semibold">Price Chart</h2>

              {/* Timeframe selector */}
              <div className="flex space-x-1">
                {['5m', '15m', '1h', '4h', '1d'].map((timeframe) => (
                  <button
                    key={timeframe}
                    className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
                      chartTimeframe === timeframe
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    onClick={() => setChartTimeframe(timeframe)}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 h-96">
              <PriceChart />
            </div>
          </div>
        </div>

        {/* Right column - Order form and tabs */}
        <div className="lg:col-span-1">
          <div className={`rounded-lg shadow-sm overflow-hidden transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex">
                <button
                  className={`py-3 px-5 font-medium transition-colors duration-200 ${
                    activeTab === 'trade'
                      ? isDarkMode
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'border-b-2 border-blue-500 text-blue-600'
                      : isDarkMode
                        ? 'text-gray-400 hover:bg-gray-700'
                        : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('trade')}
                >
                  Trade
                </button>
                <button
                  className={`py-3 px-5 font-medium transition-colors duration-200 ${
                    activeTab === 'positions'
                      ? isDarkMode
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'border-b-2 border-blue-500 text-blue-600'
                      : isDarkMode
                        ? 'text-gray-400 hover:bg-gray-700'
                        : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('positions')}
                >
                  Positions
                </button>
                <button
                  className={`py-3 px-5 font-medium transition-colors duration-200 ${
                    activeTab === 'orderbook'
                      ? isDarkMode
                        ? 'border-b-2 border-blue-500 text-blue-400'
                        : 'border-b-2 border-blue-500 text-blue-600'
                      : isDarkMode
                        ? 'text-gray-400 hover:bg-gray-700'
                        : 'text-gray-500 hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab('orderbook')}
                >
                  Order Book
                </button>
              </div>
            </div>

            <div className="p-4">
              {activeTab === 'trade' ? (
                <OrderForm />
              ) : activeTab === 'positions' ? (
                <PositionsList />
              ) : (
                <OrderBook />
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TradingInterface;
