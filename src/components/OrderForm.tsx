import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/Hooks';
import { useContracts } from '../hooks/useContracts';
import { usePriceData } from '../hooks/usePriceData';
import { ethers } from 'ethers';

const OrderForm = () => {
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const { balances } = useAppSelector((state) => state.tokenBalances);

  // Use our custom hooks
  const {
    openPosition,
    userBalance,
    loading,
    error,
    parseUSDC,
    formatUSDC
  } = useContracts();

  const {
    currentPrice,
    formatPrice
  } = usePriceData('ETH-USD');

  // Form state
  const [orderType, setOrderType] = useState('market');
  const [positionType, setPositionType] = useState('long');
  const [leverage, setLeverage] = useState(1);
  const [margin, setMargin] = useState('');
  const [limitPrice, setLimitPrice] = useState('');
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!margin || parseFloat(margin) <= 0) {
      alert('Please enter a valid margin amount');
      return;
    }

    try {
      // Convert margin to bigint with proper decimals
      const marginBigInt = parseUSDC(margin);

      // Call contract to open position
      const tx = await openPosition(
        marginBigInt,
        leverage,
        positionType === 'long'
      );

      if (tx) {
        // Reset form on success
        setMargin('');
      }
    } catch (err) {
      console.error('Error opening position:', err);
      alert(`Failed to open position: ${(err as Error).message}`);
    }
  };

  // Handle max button click
  const handleMaxClick = () => {
    if (userBalance) {
      // Use available balance from contract
      setMargin(formatUSDC(userBalance.available));
    } else {
      // Fallback to redux store balance
      const usdcBalance = balances.find(b => b.token.symbol === 'USDC');
      if (usdcBalance) {
        setMargin(usdcBalance.formattedBalance);
      }
    }
  };

  return (
    <div className="order-form">
      <form onSubmit={handleSubmit}>
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
            ${currentPrice ? parseFloat(formatPrice(currentPrice)).toFixed(2) : '0.00'} USDC
            {loading.marketData && <span className="ml-2 text-xs text-blue-500">(Loading...)</span>}
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

        {/* Position size display */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position Size
          </label>
          <div className="border rounded-md p-2 bg-gray-50">
            ${size} USDC
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading.openPosition || !isConnected}
          className={`w-full py-3 rounded-md font-medium ${
            positionType === 'long' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
          } text-white ${(loading.openPosition || !isConnected) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading.openPosition
            ? 'Processing...'
            : positionType === 'long'
              ? 'Open Long Position'
              : 'Open Short Position'}
        </button>

        {/* Error message */}
        {error.openPosition && (
          <div className="mt-2 text-red-500 text-sm">
            {error.openPosition}
          </div>
        )}
      </form>
    </div>
  );
};

export default OrderForm;
