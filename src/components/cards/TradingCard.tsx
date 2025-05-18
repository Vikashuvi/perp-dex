import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/Hooks';
import { openPosition } from '../../store/PositionSlice';

const TradingCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const { balances } = useAppSelector((state) => state.tokenBalances);
  
  // Form state
  const [orderType, setOrderType] = useState('market');
  const [positionType, setPositionType] = useState('long');
  const [leverage, setLeverage] = useState(1);
  const [margin, setMargin] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [marketPrice, setMarketPrice] = useState(1800); // Mock price, would come from oracle
  const [size, setSize] = useState('0');
  
  // Calculate position size when margin or leverage changes
  useEffect(() => {
    if (margin && !isNaN(parseFloat(margin))) {
      const positionSize = parseFloat(margin) * leverage;
      setSize(positionSize.toFixed(2));
    } else {
      setSize('0');
    }
  }, [margin, leverage]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!margin || parseFloat(margin) <= 0) {
      alert('Please enter a valid margin amount');
      return;
    }
    
    // Dispatch action to open position
    dispatch(openPosition({
      margin: parseFloat(margin),
      leverage,
      isLong: positionType === 'long',
      entryPrice: marketPrice,
      orderType
    }));
    
    // Reset form
    setMargin('');
  };
  
  // Handle max button click
  const handleMaxClick = () => {
    // Find USDC balance
    const usdcBalance = balances.find(b => b.token.symbol === 'USDC');
    if (usdcBalance) {
      setMargin(usdcBalance.formattedBalance);
    }
  };

  if (!isConnected) {
    return (
      <div className="glass-card-hover">
        <div className="card-header">
          <div className="flex items-center">
            <div className="bg-gradient-primary text-white p-2 rounded-lg mr-3 shadow-[0_0_10px_rgba(124,58,237,0.3)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gradient-primary">Trading Interface</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.3)]">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Trading Interface Locked</h3>
            <p className="text-text-tertiary max-w-md mx-auto mb-6">
              Connect your wallet to access trading features and start trading on the Perpetual DEX
            </p>
            <button className="btn btn-neon hover-lift">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="glass-card-hover">
      <div className="card-header">
        <div className="flex items-center">
          <div className="bg-gradient-primary text-white p-2 rounded-lg mr-3 shadow-[0_0_10px_rgba(124,58,237,0.3)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gradient-primary">Trading Interface</h2>
        </div>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          {/* Order type selector */}
          <div className="form-group">
            <div className="flex rounded-lg overflow-hidden border border-border-dark">
              <button
                type="button"
                className={`flex-1 py-2.5 transition-all duration-300 ${
                  orderType === 'market' 
                    ? 'bg-gradient-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]' 
                    : 'bg-card-dark text-text-secondary hover:bg-card-darker hover:text-text-primary'
                }`}
                onClick={() => setOrderType('market')}
              >
                Market
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 transition-all duration-300 ${
                  orderType === 'limit' 
                    ? 'bg-gradient-primary text-white shadow-[0_0_10px_rgba(124,58,237,0.3)]' 
                    : 'bg-card-dark text-text-secondary hover:bg-card-darker hover:text-text-primary'
                }`}
                onClick={() => setOrderType('limit')}
              >
                Limit
              </button>
            </div>
          </div>
          
          {/* Position type selector */}
          <div className="form-group">
            <div className="flex rounded-lg overflow-hidden border border-border-dark">
              <button
                type="button"
                className={`flex-1 py-2.5 transition-all duration-300 ${
                  positionType === 'long' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
                    : 'bg-card-dark text-text-secondary hover:bg-card-darker hover:text-text-primary'
                }`}
                onClick={() => setPositionType('long')}
              >
                Long
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 transition-all duration-300 ${
                  positionType === 'short' 
                    ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
                    : 'bg-card-dark text-text-secondary hover:bg-card-darker hover:text-text-primary'
                }`}
                onClick={() => setPositionType('short')}
              >
                Short
              </button>
            </div>
          </div>
          
          {/* Market price display */}
          <div className="form-group">
            <label className="form-label">
              Market Price
            </label>
            <div className="glass-panel p-3 text-text-primary font-medium">
              ${marketPrice.toFixed(2)} USDC
            </div>
          </div>
          
          {/* Limit price input (only shown for limit orders) */}
          {orderType === 'limit' && (
            <div className="form-group">
              <label htmlFor="limitPrice" className="form-label">
                Limit Price
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-tertiary">$</span>
                <input
                  type="number"
                  id="limitPrice"
                  className="form-input pl-7 pr-16"
                  placeholder="0.00"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-tertiary">
                  USDC
                </div>
              </div>
            </div>
          )}
          
          {/* Margin input */}
          <div className="form-group">
            <label htmlFor="margin" className="form-label">
              Margin
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-tertiary">$</span>
              <input
                type="number"
                id="margin"
                className="form-input pl-7 pr-24"
                placeholder="0.00"
                value={margin}
                onChange={(e) => setMargin(e.target.value)}
                min="0"
                step="0.01"
                required
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="button"
                  className="h-full px-2 text-sm text-primary-400 font-medium hover:text-primary-300 transition-colors duration-200"
                  onClick={handleMaxClick}
                >
                  MAX
                </button>
                <span className="pr-3 text-text-tertiary">USDC</span>
              </div>
            </div>
          </div>
          
          {/* Leverage slider */}
          <div className="form-group">
            <label htmlFor="leverage" className="form-label flex justify-between">
              <span>Leverage</span>
              <span className="text-primary-400 font-semibold">{leverage}x</span>
            </label>
            <input
              type="range"
              id="leverage"
              className="form-range"
              min="1"
              max="20"
              step="1"
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
            />
            <div className="flex justify-between text-xs text-text-tertiary mt-1">
              <span>1x</span>
              <span>5x</span>
              <span>10x</span>
              <span>15x</span>
              <span>20x</span>
            </div>
          </div>
          
          {/* Position size display */}
          <div className="form-group">
            <label className="form-label">
              Position Size
            </label>
            <div className="glass-panel p-3 text-text-primary font-medium">
              ${size} USDC
            </div>
          </div>
          
          {/* Submit button */}
          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-medium transition-all duration-300 hover-lift ${
              positionType === 'long' 
                ? 'btn-neon-success' 
                : 'btn-neon-danger'
            }`}
          >
            {positionType === 'long' ? 'Open Long Position' : 'Open Short Position'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TradingCard;
