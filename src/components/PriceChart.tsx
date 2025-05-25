import React, { useEffect, useState } from 'react';
import { usePriceData } from '../hooks/usePriceData';
import { ethers } from 'ethers';

interface PriceChartProps {
  symbol?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ symbol = 'ETH-USD' }) => {
  const { currentPrice, historicalPrices, loading, formatPrice } = usePriceData(symbol);
  const [path, setPath] = useState<string>('');
  const [areaPath, setAreaPath] = useState<string>('');

  // Generate SVG paths from price data
  useEffect(() => {
    if (historicalPrices && historicalPrices.prices.length > 0) {
      const prices = historicalPrices.prices;
      const maxPrice = Math.max(...prices.map(p => p.price));
      const minPrice = Math.min(...prices.map(p => p.price));
      const range = maxPrice - minPrice;

      // Normalize prices to 0-50 range for SVG (inverted for Y axis)
      const normalizedPrices = prices.map(p => {
        const normalized = range === 0 ? 25 : 50 - ((p.price - minPrice) / range) * 40;
        return normalized;
      });

      // Generate line path
      let linePath = '';
      normalizedPrices.forEach((price, i) => {
        const x = (i / (prices.length - 1)) * 100;
        linePath += i === 0 ? `M0,${price}` : ` L${x},${price}`;
      });

      // Generate area path (line path + bottom border)
      const areaPath = `${linePath} L100,50 L0,50 Z`;

      setPath(linePath);
      setAreaPath(areaPath);
    }
  }, [historicalPrices]);

  // Format current price for display
  const formattedPrice = currentPrice ? parseFloat(formatPrice(currentPrice)).toFixed(2) : '0.00';

  // Calculate price change
  const calculatePriceChange = () => {
    if (historicalPrices && historicalPrices.prices.length > 1) {
      const currentPriceValue = parseFloat(formattedPrice);
      const previousPrice = historicalPrices.prices[0].price;
      const change = ((currentPriceValue - previousPrice) / previousPrice) * 100;
      return change.toFixed(2);
    }
    return '0.00';
  };

  const priceChange = calculatePriceChange();
  const isPriceUp = parseFloat(priceChange) >= 0;

  return (
    <div className="price-chart h-full flex flex-col relative">
      {/* Price header */}
      <div className="flex justify-between items-center mb-4 z-10">
        <div>
          <h3 className="text-lg font-medium">{symbol}</h3>
          <div className="flex items-center">
            <span className="text-2xl font-bold">${formattedPrice}</span>
            <span className={`ml-2 text-sm ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
              {isPriceUp ? '↑' : '↓'} {priceChange}%
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs rounded-md bg-card-dark border border-border-dark">1H</button>
          <button className="px-3 py-1 text-xs rounded-md bg-card-dark border border-border-dark">1D</button>
          <button className="px-3 py-1 text-xs rounded-md bg-primary text-white">1W</button>
          <button className="px-3 py-1 text-xs rounded-md bg-card-dark border border-border-dark">1M</button>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-grow relative">
        {/* Grid lines */}
        <div className="absolute inset-0 z-0">
          <div className="grid grid-cols-6 h-full">
            {[...Array(7)].map((_, i) => (
              <div key={`vline-${i}`} className="border-l border-border-dark/20 h-full"></div>
            ))}
          </div>
          <div className="grid grid-rows-6 w-full absolute inset-0">
            {[...Array(7)].map((_, i) => (
              <div key={`hline-${i}`} className="border-b border-border-dark/20 w-full"></div>
            ))}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card-dark/30 backdrop-blur-sm z-20">
            <div className="text-primary animate-pulse">Loading price data...</div>
          </div>
        )}

        {/* Chart visualization */}
        <div className="absolute inset-0 flex items-end px-4">
          <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isPriceUp ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)"} />
                <stop offset="100%" stopColor={isPriceUp ? "rgba(34, 197, 94, 0)" : "rgba(239, 68, 68, 0)"} />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Area fill */}
            {areaPath && (
              <path
                d={areaPath}
                fill="url(#chartGradient)"
                opacity="0.6"
              />
            )}

            {/* Line */}
            {path && (
              <path
                d={path}
                fill="none"
                stroke={isPriceUp ? "#22c55e" : "#ef4444"}
                strokeWidth="0.5"
                filter="url(#glow)"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between text-xs text-text-tertiary mt-2 px-4">
        {historicalPrices && historicalPrices.prices.length > 0 ? (
          <>
            <span>{new Date(historicalPrices.prices[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{new Date(historicalPrices.prices[Math.floor(historicalPrices.prices.length / 2)].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span>{new Date(historicalPrices.prices[historicalPrices.prices.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </>
        ) : (
          <>
            <span>--:--</span>
            <span>--:--</span>
            <span>--:--</span>
          </>
        )}
      </div>
    </div>
  );
};

export default PriceChart;
