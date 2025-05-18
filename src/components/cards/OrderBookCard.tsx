import React, { useState } from 'react';
import OrderBook from '../OrderBook';

const OrderBookCard: React.FC = () => {
  const [precision, setPrecision] = useState<string>('0.1');

  return (
    <div className="glass-card-hover">
      <div className="card-header">
        <div className="flex items-center">
          <div className="bg-gradient-primary text-white p-2 rounded-lg mr-3 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gradient-primary">Order Book</h2>
        </div>

        <div className="flex space-x-2">
          {['0.1', '0.5', '1.0'].map((value) => (
            <button
              key={value}
              onClick={() => setPrecision(value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 ${
                precision === value
                  ? 'bg-primary-600/30 text-primary-300 shadow-[0_0_12px_rgba(124,58,237,0.3)]'
                  : 'text-text-tertiary hover:bg-card-dark/60 hover:text-text-secondary'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="card-body">
        <div className="grid grid-cols-3 text-sm font-medium mb-3 px-2 text-text-secondary border-b border-border-dark/20 pb-2">
          <div>Price (USDC)</div>
          <div className="text-right">Size (ETH)</div>
          <div className="text-right">Total</div>
        </div>

        {/* Asks (Sell orders) - Red */}
        <div className="space-y-1.5 mb-4">
          {[1850, 1845, 1840, 1835, 1830].map((price, i) => (
            <div
              key={`ask-${price}`}
              className="order-book-row order-book-ask grid grid-cols-3 py-2 px-2"
            >
              <div
                className="order-book-depth"
                style={{ width: `${20 + i * 15}%` }}
              ></div>
              <div className="price-down relative z-10 font-medium">${price.toFixed(2)}</div>
              <div className="text-right relative z-10 text-text-primary">{(0.5 + i * 0.2).toFixed(2)}</div>
              <div className="text-right relative z-10 text-text-secondary">{(price * (0.5 + i * 0.2)).toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Current price / Spread */}
        <div className="order-book-spread">
          <div>
            <span className="text-lg font-semibold text-gradient-primary">$1,825.50</span>
            <span className="ml-2 text-xs text-text-tertiary">Spread: 5.50 (0.3%)</span>
          </div>
          <div className="flex items-center text-success-light">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>+1.2%</span>
          </div>
        </div>

        {/* Bids (Buy orders) - Green */}
        <div className="space-y-1.5">
          {[1820, 1815, 1810, 1805, 1800].map((price, i) => (
            <div
              key={`bid-${price}`}
              className="order-book-row order-book-bid grid grid-cols-3 py-2 px-2"
            >
              <div
                className="order-book-depth"
                style={{ width: `${20 + i * 15}%` }}
              ></div>
              <div className="price-up relative z-10 font-medium">${price.toFixed(2)}</div>
              <div className="text-right relative z-10 text-text-primary">{(0.5 + i * 0.2).toFixed(2)}</div>
              <div className="text-right relative z-10 text-text-secondary">{(price * (0.5 + i * 0.2)).toFixed(2)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBookCard;
