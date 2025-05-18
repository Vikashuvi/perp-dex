import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/Hooks';

interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  openInterestLong: number;
  openInterestShort: number;
  fundingRate: number;
  nextFundingTime: number;
}

// Mock data - in a real app, this would come from an API or blockchain
const mockMarkets: MarketData[] = [
  {
    symbol: 'ETH-USD',
    price: 1800.25,
    change24h: 2.5,
    volume24h: 1250000,
    openInterestLong: 750000,
    openInterestShort: 650000,
    fundingRate: 0.01, // 0.01% per 8 hours
    nextFundingTime: Date.now() + 3600000 // 1 hour from now
  },
  {
    symbol: 'BTC-USD',
    price: 35000.75,
    change24h: -1.2,
    volume24h: 3500000,
    openInterestLong: 1200000,
    openInterestShort: 1350000,
    fundingRate: -0.005, // -0.005% per 8 hours
    nextFundingTime: Date.now() + 3600000 // 1 hour from now
  },
  {
    symbol: 'SOL-USD',
    price: 45.75,
    change24h: 5.8,
    volume24h: 850000,
    openInterestLong: 450000,
    openInterestShort: 380000,
    fundingRate: 0.02, // 0.02% per 8 hours
    nextFundingTime: Date.now() + 3600000 // 1 hour from now
  }
];

const MarketInfo = () => {
  const [markets, setMarkets] = useState<MarketData[]>(mockMarkets);
  const [selectedMarket, setSelectedMarket] = useState<string>('ETH-USD');
  const { isConnected } = useAppSelector((state) => state.wallet);

  // Format funding rate as percentage
  const formatFundingRate = (rate: number): string => {
    const sign = rate >= 0 ? '+' : '';
    return `${sign}${(rate * 100).toFixed(4)}%`;
  };

  // Format time until next funding
  const formatTimeUntilFunding = (timestamp: number): string => {
    const now = Date.now();
    const timeLeft = timestamp - now;

    if (timeLeft <= 0) return 'Now';

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  // Calculate open interest imbalance
  const calculateImbalance = (long: number, short: number): number => {
    if (long === 0 && short === 0) return 0;
    return ((long - short) / (long + short)) * 100;
  };

  return (
    <div className="market-info mt-6">
      <div className="bg-card-dark rounded-xl shadow-md overflow-hidden border border-border-dark">
        <div className="px-5 py-4 border-b border-border-dark flex justify-between items-center">
          <h2 className="text-lg font-semibold flex items-center text-gradient-secondary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            Market Information
          </h2>
          <div className="flex space-x-1">
            <button className="px-3 py-1.5 rounded text-sm font-medium bg-card-darker hover:bg-opacity-80 text-text-secondary transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Market selector tabs */}
        <div className="flex border-b border-border-dark">
          {markets.map((market) => (
            <button
              key={market.symbol}
              className={`py-3 px-5 font-medium transition-colors duration-200 ${
                selectedMarket === market.symbol
                  ? 'border-b-2 border-gradient-secondary text-gradient-secondary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-card-darker'
              }`}
              onClick={() => setSelectedMarket(market.symbol)}
            >
              {market.symbol}
            </button>
          ))}
        </div>

        {/* Selected market details */}
        {markets.map((market) => (
          market.symbol === selectedMarket && (
            <div key={`details-${market.symbol}`} className="p-5">
              {/* Price and volume */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-baseline">
                    <h3 className="text-3xl font-bold">${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    <span className={`ml-3 px-2 py-1 rounded text-sm font-medium ${
                      market.change24h >= 0
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {market.change24h >= 0 ? '↑' : '↓'} {Math.abs(market.change24h).toFixed(2)}% (24h)
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-text-tertiary">
                    Last updated: {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex flex-col items-end p-3 rounded-lg bg-card-darker">
                  <div className="text-sm text-text-tertiary">24h Volume</div>
                  <div className="font-bold text-xl">${(market.volume24h / 1000).toFixed(0)}K</div>
                </div>
              </div>

              {/* Funding info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-card-darker">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-text-tertiary">Funding Rate (8h)</div>
                      <div className={`text-xl font-bold ${market.fundingRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatFundingRate(market.fundingRate)}
                      </div>
                    </div>
                    <div className={`p-2 rounded-full ${
                      market.fundingRate >= 0
                        ? 'bg-green-900/30'
                        : 'bg-red-900/30'
                    }`}>
                      <svg className={`w-6 h-6 ${market.fundingRate >= 0 ? 'text-green-400' : 'text-red-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={market.fundingRate >= 0
                          ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                          : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-text-tertiary">
                    {market.fundingRate >= 0 ? 'Longs pay shorts' : 'Shorts pay longs'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-card-darker">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-text-tertiary">Next Funding</div>
                      <div className="text-xl font-bold">{formatTimeUntilFunding(market.nextFundingTime)}</div>
                    </div>
                    <div className="p-2 rounded-full bg-gradient-secondary bg-opacity-20">
                      <svg className="w-6 h-6 text-gradient-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-card-dark rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-secondary h-full rounded-full"
                      style={{
                        width: `${100 - ((market.nextFundingTime - Date.now()) / 28800000) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Open Interest */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm font-medium text-text-primary">Open Interest</div>
                  <div className="text-sm text-text-tertiary">
                    Total: ${(market.openInterestLong + market.openInterestShort) / 1000}K
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-card-darker">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-secondary mr-2"></div>
                    <span className="text-sm text-text-secondary">Long:</span>
                    <span className="ml-auto font-medium">${(market.openInterestLong / 1000).toFixed(0)}K</span>
                  </div>

                  <div className="h-4 w-full bg-card-dark rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-gradient-secondary h-full"
                      style={{ width: `${(market.openInterestLong / (market.openInterestLong + market.openInterestShort)) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-accent mr-2"></div>
                    <span className="text-sm text-text-secondary">Short:</span>
                    <span className="ml-auto font-medium">${(market.openInterestShort / 1000).toFixed(0)}K</span>
                  </div>

                  <div className="h-4 w-full bg-card-dark rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-accent h-full"
                      style={{ width: `${(market.openInterestShort / (market.openInterestLong + market.openInterestShort)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Long/Short Ratio */}
              <div className="p-4 rounded-lg bg-card-darker">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-text-tertiary">Long/Short Ratio</div>
                    <div className="text-xl font-bold">
                      {(market.openInterestLong / market.openInterestShort).toFixed(2)}
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg ${
                    calculateImbalance(market.openInterestLong, market.openInterestShort) >= 0
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {Math.abs(calculateImbalance(market.openInterestLong, market.openInterestShort)).toFixed(2)}% {calculateImbalance(market.openInterestLong, market.openInterestShort) >= 0 ? 'long' : 'short'} bias
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default MarketInfo;
