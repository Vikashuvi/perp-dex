import React, { useState } from 'react';
import PriceChart from '../PriceChart';

const ChartCard: React.FC = () => {
  const [timeframe, setTimeframe] = useState('1h');

  return (
    <div className="glass-card-hover h-full">
      <div className="card-header">
        <div className="flex items-center">
          <div className="bg-gradient-primary text-white p-2 rounded-lg mr-3 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gradient-primary">Price Chart</h2>
        </div>

        <div className="flex space-x-2">
          {['5m', '15m', '1h', '4h', '1d'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
                timeframe === tf
                  ? 'bg-primary-600/30 text-primary-300 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                  : 'text-text-tertiary hover:bg-card-dark/60 hover:text-text-secondary'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="card-body p-0 overflow-hidden">
        <div className="h-[400px] relative">
          {/* Price indicators */}
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
            <div className="glass-panel px-3 py-1.5 flex items-center">
              <span className="text-text-secondary mr-2">ETH/USDC</span>
              <span className="text-lg font-semibold text-gradient-primary">$1,825.50</span>
            </div>
            <div className="flex items-center text-success-light">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>+1.2%</span>
            </div>
          </div>

          <PriceChart />

          {/* Overlay for visual effect */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-card-darker/90 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card-darker/90 to-transparent"></div>
            <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-card-darker/90 to-transparent"></div>
            <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-card-darker/90 to-transparent"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartCard;
