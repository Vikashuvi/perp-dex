import React, { useState, useEffect } from 'react';

// Mock data for the order book
const generateMockOrderBook = () => {
  const basePrice = 1800;
  const asks = [];
  const bids = [];

  // Generate asks (sell orders)
  for (let i = 1; i <= 10; i++) {
    asks.push({
      price: basePrice + i * 2,
      size: Math.random() * 10 + 0.5,
      total: 0 // Will be calculated
    });
  }

  // Generate bids (buy orders)
  for (let i = 1; i <= 10; i++) {
    bids.push({
      price: basePrice - i * 2,
      size: Math.random() * 10 + 0.5,
      total: 0 // Will be calculated
    });
  }

  // Sort asks in ascending order
  asks.sort((a, b) => a.price - b.price);

  // Sort bids in descending order
  bids.sort((a, b) => b.price - a.price);

  // Calculate cumulative totals
  let askTotal = 0;
  for (let i = 0; i < asks.length; i++) {
    askTotal += asks[i].size;
    asks[i].total = askTotal;
  }

  let bidTotal = 0;
  for (let i = 0; i < bids.length; i++) {
    bidTotal += bids[i].size;
    bids[i].total = bidTotal;
  }

  return { asks, bids };
};

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [] });
  const [displayType, setDisplayType] = useState('both');

  useEffect(() => {
    // In a real app, this would fetch from an API or websocket
    const mockData = generateMockOrderBook();
    setOrderBook(mockData);

    // Simulate periodic updates
    const interval = setInterval(() => {
      setOrderBook(generateMockOrderBook());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Find the maximum total for scaling the depth visualization
  const maxTotal = Math.max(
    orderBook.asks.length > 0 ? orderBook.asks[orderBook.asks.length - 1].total : 0,
    orderBook.bids.length > 0 ? orderBook.bids[orderBook.bids.length - 1].total : 0
  );

  // Calculate the spread
  const lowestAsk = orderBook.asks.length > 0 ? orderBook.asks[0].price : 0;
  const highestBid = orderBook.bids.length > 0 ? orderBook.bids[0].price : 0;
  const spread = lowestAsk - highestBid;
  const spreadPercentage = (spread / lowestAsk) * 100;

  return (
    <div className="order-book">
      {/* Display type selector */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 ${
              displayType === 'both'
                ? 'bg-primary-900/30 text-primary-400 shadow-[0_0_10px_rgba(124,58,237,0.2)]'
                : 'text-text-tertiary hover:bg-card-dark hover:text-text-secondary'
            }`}
            onClick={() => setDisplayType('both')}
          >
            Both
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 ${
              displayType === 'bids'
                ? 'bg-success/20 text-success shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'text-text-tertiary hover:bg-card-dark hover:text-text-secondary'
            }`}
            onClick={() => setDisplayType('bids')}
          >
            Bids
          </button>
          <button
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 ${
              displayType === 'asks'
                ? 'bg-danger/20 text-danger shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : 'text-text-tertiary hover:bg-card-dark hover:text-text-secondary'
            }`}
            onClick={() => setDisplayType('asks')}
          >
            Asks
          </button>
        </div>

        <div className="text-sm font-medium glass-panel px-3 py-1.5">
          <span className="text-text-secondary mr-1">Spread:</span>
          <span className="text-primary-400">{spread.toFixed(2)}</span>
          <span className="text-text-tertiary ml-1">({spreadPercentage.toFixed(2)}%)</span>
        </div>
      </div>

      <div className="grid grid-cols-3 text-sm font-medium text-text-secondary mb-3 px-3 py-2 rounded-md bg-card-darker">
        <div>Price (USDC)</div>
        <div className="text-right">Size (ETH)</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (sell orders) - displayed in reverse order */}
      {(displayType === 'both' || displayType === 'asks') && (
        <div className="asks mb-4 space-y-1">
          {orderBook.asks.slice().reverse().map((ask, index) => (
            <div key={`ask-${index}`} className="grid grid-cols-3 py-1.5 px-3 text-sm relative overflow-hidden rounded-md transition-all duration-200 hover:bg-card-darker">
              <div className="text-danger relative z-10">${ask.price.toFixed(2)}</div>
              <div className="text-right text-text-primary relative z-10">{ask.size.toFixed(4)}</div>
              <div className="text-right text-text-secondary relative z-10">{ask.total.toFixed(4)}</div>
              <div
                className="absolute inset-0 bg-danger/10 z-0 transition-all duration-300"
                style={{ width: `${(ask.total / maxTotal) * 100}%` }}
              ></div>
            </div>
          ))}
        </div>
      )}

      {/* Spread indicator - only shown when displaying both */}
      {displayType === 'both' && (
        <div className="py-2 px-3 bg-primary-900/20 rounded-md border border-primary-500/30 mb-4 flex justify-between items-center">
          <span className="text-lg font-semibold text-gradient-primary">${lowestAsk.toFixed(2)}</span>
          <div className="flex items-center space-x-2">
            <span className="text-text-secondary">Spread:</span>
            <span className="text-primary-400 font-medium">{spread.toFixed(2)}</span>
            <span className="text-text-tertiary">({spreadPercentage.toFixed(2)}%)</span>
          </div>
        </div>
      )}

      {/* Bids (buy orders) */}
      {(displayType === 'both' || displayType === 'bids') && (
        <div className="bids space-y-1">
          {orderBook.bids.map((bid, index) => (
            <div key={`bid-${index}`} className="grid grid-cols-3 py-1.5 px-3 text-sm relative overflow-hidden rounded-md transition-all duration-200 hover:bg-card-darker">
              <div className="text-success relative z-10">${bid.price.toFixed(2)}</div>
              <div className="text-right text-text-primary relative z-10">{bid.size.toFixed(4)}</div>
              <div className="text-right text-text-secondary relative z-10">{bid.total.toFixed(4)}</div>
              <div
                className="absolute inset-0 bg-success/10 z-0 transition-all duration-300"
                style={{ width: `${(bid.total / maxTotal) * 100}%` }}
              ></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderBook;
