import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/Hooks';
import { openAdvancedPosition } from '../store/AdvancedPositionSlice';

const AdvancedOrderForm = () => {
  const dispatch = useAppDispatch();
  const { address } = useAppSelector((state) => state.wallet);
  const { balances } = useAppSelector((state) => state.tokenBalances);
  
  // Form state
  const [market, setMarket] = useState('ETH-USD');
  const [orderType, setOrderType] = useState('market');
  const [positionType, setPositionType] = useState('long');
  const [leverage, setLeverage] = useState(5);
  const [margin, setMargin] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [size, setSize] = useState('0');
  
  // Advanced order settings
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [stopLossPercentage, setStopLossPercentage] = useState('100');
  
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [takeProfitPercentage, setTakeProfitPercentage] = useState('100');
  
  // Mock market prices - in a real app, these would come from an oracle or API
  const marketPrices = {
    'ETH-USD': 1820.50,
    'BTC-USD': 34500.75,
    'SOL-USD': 46.25
  };
  
  // Calculate position size when margin or leverage changes
  useEffect(() => {
    if (margin && !isNaN(parseFloat(margin))) {
      const positionSize = parseFloat(margin) * leverage;
      setSize(positionSize.toFixed(2));
    } else {
      setSize('0');
    }
  }, [margin, leverage]);
  
  // Calculate liquidation price
  const calculateLiquidationPrice = (): string => {
    if (!margin || isNaN(parseFloat(margin)) || parseFloat(margin) <= 0) {
      return '0.00';
    }
    
    const entryPrice = orderType === 'market' 
      ? marketPrices[market as keyof typeof marketPrices] 
      : parseFloat(limitPrice);
    
    if (isNaN(entryPrice) || entryPrice <= 0) {
      return '0.00';
    }
    
    const liquidationThreshold = 0.8; // 80% of margin
    
    if (positionType === 'long') {
      return (entryPrice * (1 - liquidationThreshold / leverage)).toFixed(2);
    } else {
      return (entryPrice * (1 + liquidationThreshold / leverage)).toFixed(2);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!margin || parseFloat(margin) <= 0) {
      alert('Please enter a valid margin amount');
      return;
    }
    
    const entryPrice = orderType === 'market' 
      ? marketPrices[market as keyof typeof marketPrices] 
      : parseFloat(limitPrice);
    
    if (orderType === 'limit' && (!limitPrice || isNaN(entryPrice) || entryPrice <= 0)) {
      alert('Please enter a valid limit price');
      return;
    }
    
    // Validate stop loss if enabled
    if (useStopLoss) {
      const stopLoss = parseFloat(stopLossPrice);
      if (isNaN(stopLoss) || stopLoss <= 0) {
        alert('Please enter a valid stop loss price');
        return;
      }
      
      // Validate stop loss price direction
      if (positionType === 'long' && stopLoss >= entryPrice) {
        alert('Stop loss price must be below entry price for long positions');
        return;
      }
      
      if (positionType === 'short' && stopLoss <= entryPrice) {
        alert('Stop loss price must be above entry price for short positions');
        return;
      }
    }
    
    // Validate take profit if enabled
    if (useTakeProfit) {
      const takeProfit = parseFloat(takeProfitPrice);
      if (isNaN(takeProfit) || takeProfit <= 0) {
        alert('Please enter a valid take profit price');
        return;
      }
      
      // Validate take profit price direction
      if (positionType === 'long' && takeProfit <= entryPrice) {
        alert('Take profit price must be above entry price for long positions');
        return;
      }
      
      if (positionType === 'short' && takeProfit >= entryPrice) {
        alert('Take profit price must be below entry price for short positions');
        return;
      }
    }
    
    // Prepare position data
    const positionData = {
      market,
      margin: parseFloat(margin),
      leverage,
      isLong: positionType === 'long',
      entryPrice,
      orderType,
      ...(useStopLoss && {
        stopLoss: {
          price: parseFloat(stopLossPrice),
          percentage: parseFloat(stopLossPercentage)
        }
      }),
      ...(useTakeProfit && {
        takeProfit: {
          price: parseFloat(takeProfitPrice),
          percentage: parseFloat(takeProfitPercentage)
        }
      })
    };
    
    // Dispatch action to open position
    dispatch(openAdvancedPosition(positionData));
    
    // Reset form
    setMargin('');
    setLimitPrice('');
    setUseStopLoss(false);
    setStopLossPrice('');
    setUseTakeProfit(false);
    setTakeProfitPrice('');
  };
  
  // Handle max button click
  const handleMaxClick = () => {
    // Find USDC balance
    const usdcBalance = balances.find(b => b.token.symbol === 'USDC');
    if (usdcBalance) {
      setMargin(usdcBalance.formattedBalance);
    }
  };
  
  return (
    <div className="advanced-order-form">
      <form onSubmit={handleSubmit}>
        {/* Market selector */}
        <div className="mb-4">
          <label htmlFor="market" className="block text-sm font-medium text-gray-700 mb-1">
            Market
          </label>
          <select
            id="market"
            className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
          >
            <option value="ETH-USD">ETH-USD</option>
            <option value="BTC-USD">BTC-USD</option>
            <option value="SOL-USD">SOL-USD</option>
          </select>
        </div>
        
        {/* Order type selector */}
        <div className="mb-4">
          <div className="flex rounded-md overflow-hidden border">
            <button
              type="button"
              className={`flex-1 py-2 ${orderType === 'market' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setOrderType('market')}
            >
              Market
            </button>
            <button
              type="button"
              className={`flex-1 py-2 ${orderType === 'limit' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setOrderType('limit')}
            >
              Limit
            </button>
          </div>
        </div>
        
        {/* Position type selector */}
        <div className="mb-4">
          <div className="flex rounded-md overflow-hidden border">
            <button
              type="button"
              className={`flex-1 py-2 ${positionType === 'long' ? 'bg-green-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setPositionType('long')}
            >
              Long
            </button>
            <button
              type="button"
              className={`flex-1 py-2 ${positionType === 'short' ? 'bg-red-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setPositionType('short')}
            >
              Short
            </button>
          </div>
        </div>
        
        {/* Market price display */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Market Price
          </label>
          <div className="border rounded-md p-2 bg-gray-50">
            ${marketPrices[market as keyof typeof marketPrices].toFixed(2)} USDC
          </div>
        </div>
        
        {/* Limit price input (only shown for limit orders) */}
        {orderType === 'limit' && (
          <div className="mb-4">
            <label htmlFor="limitPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Limit Price
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
              <input
                type="number"
                id="limitPrice"
                className="block w-full pl-7 pr-12 py-2 border rounded-md"
                placeholder="0.00"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                min="0"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                USDC
              </div>
            </div>
          </div>
        )}
        
        {/* Margin input */}
        <div className="mb-4">
          <label htmlFor="margin" className="block text-sm font-medium text-gray-700 mb-1">
            Margin
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
            <input
              type="number"
              id="margin"
              className="block w-full pl-7 pr-20 py-2 border rounded-md"
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
                className="h-full px-2 text-sm text-blue-500 font-medium"
                onClick={handleMaxClick}
              >
                MAX
              </button>
              <span className="pr-3 text-gray-500">USDC</span>
            </div>
          </div>
        </div>
        
        {/* Leverage slider */}
        <div className="mb-4">
          <label htmlFor="leverage" className="block text-sm font-medium text-gray-700 mb-1">
            Leverage: {leverage}x
          </label>
          <input
            type="range"
            id="leverage"
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            min="1"
            max="20"
            step="1"
            value={leverage}
            onChange={(e) => setLeverage(parseInt(e.target.value))}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1x</span>
            <span>5x</span>
            <span>10x</span>
            <span>15x</span>
            <span>20x</span>
          </div>
        </div>
        
        {/* Position size and liquidation price display */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position Size
            </label>
            <div className="border rounded-md p-2 bg-gray-50">
              ${size} USDC
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Liquidation Price
            </label>
            <div className="border rounded-md p-2 bg-gray-50 text-red-500">
              ${calculateLiquidationPrice()} USDC
            </div>
          </div>
        </div>
        
        {/* Advanced order settings */}
        <div className="mb-4 border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Advanced Settings</h3>
          
          {/* Stop Loss */}
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="useStopLoss"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={useStopLoss}
                onChange={(e) => setUseStopLoss(e.target.checked)}
              />
              <label htmlFor="useStopLoss" className="ml-2 block text-sm text-gray-700">
                Stop Loss
              </label>
            </div>
            
            {useStopLoss && (
              <div className="pl-6 grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="stopLossPrice" className="block text-xs text-gray-500 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    id="stopLossPrice"
                    className="block w-full py-1 px-2 text-sm border rounded-md"
                    placeholder="0.00"
                    value={stopLossPrice}
                    onChange={(e) => setStopLossPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label htmlFor="stopLossPercentage" className="block text-xs text-gray-500 mb-1">
                    Close %
                  </label>
                  <input
                    type="number"
                    id="stopLossPercentage"
                    className="block w-full py-1 px-2 text-sm border rounded-md"
                    placeholder="100"
                    value={stopLossPercentage}
                    onChange={(e) => setStopLossPercentage(e.target.value)}
                    min="1"
                    max="100"
                    step="1"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Take Profit */}
          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="useTakeProfit"
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                checked={useTakeProfit}
                onChange={(e) => setUseTakeProfit(e.target.checked)}
              />
              <label htmlFor="useTakeProfit" className="ml-2 block text-sm text-gray-700">
                Take Profit
              </label>
            </div>
            
            {useTakeProfit && (
              <div className="pl-6 grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="takeProfitPrice" className="block text-xs text-gray-500 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    id="takeProfitPrice"
                    className="block w-full py-1 px-2 text-sm border rounded-md"
                    placeholder="0.00"
                    value={takeProfitPrice}
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label htmlFor="takeProfitPercentage" className="block text-xs text-gray-500 mb-1">
                    Close %
                  </label>
                  <input
                    type="number"
                    id="takeProfitPercentage"
                    className="block w-full py-1 px-2 text-sm border rounded-md"
                    placeholder="100"
                    value={takeProfitPercentage}
                    onChange={(e) => setTakeProfitPercentage(e.target.value)}
                    min="1"
                    max="100"
                    step="1"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Submit button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-md font-medium ${
            positionType === 'long' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
          } text-white`}
        >
          {positionType === 'long' ? 'Open Long Position' : 'Open Short Position'}
        </button>
      </form>
    </div>
  );
};

export default AdvancedOrderForm;
