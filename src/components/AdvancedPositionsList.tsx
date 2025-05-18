import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/Hooks';
import {
  fetchAdvancedPositions,
  closeAdvancedPosition,
  updateStopLoss,
  updateTakeProfit,
  selectPosition,
  clearSelectedPosition
} from '../store/AdvancedPositionSlice';

// Import the AdvancedPosition type
import type { AdvancedPosition } from '../store/AdvancedPositionSlice';

const AdvancedPositionsList = () => {
  const dispatch = useAppDispatch();
  const { address } = useAppSelector((state) => state.wallet);
  const { positions, loading, selectedPositionId } = useAppSelector((state) => state.advancedPositions);

  // Local state for editing stop loss and take profit
  const [editMode, setEditMode] = useState<'stopLoss' | 'takeProfit' | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editPercentage, setEditPercentage] = useState<string>('100');
  const [closePercentage, setClosePercentage] = useState<string>('100');

  // Mock current prices - in a real app, these would come from an oracle or API
  const currentPrices = {
    'ETH-USD': 1820.50,
    'BTC-USD': 34500.75,
    'SOL-USD': 46.25
  };

  useEffect(() => {
    if (address) {
      dispatch(fetchAdvancedPositions(address));
    }
  }, [dispatch, address]);

  // Calculate PnL for a position
  const calculatePnL = (position: AdvancedPosition): number => {
    const currentPrice = currentPrices[position.market as keyof typeof currentPrices] || position.entryPrice;

    if (position.isLong) {
      return position.size * (currentPrice - position.entryPrice) / position.entryPrice;
    } else {
      return position.size * (position.entryPrice - currentPrice) / position.entryPrice;
    }
  };

  // Calculate PnL percentage
  const calculatePnLPercentage = (position: AdvancedPosition): number => {
    const pnl = calculatePnL(position);
    return (pnl / position.margin) * 100;
  };

  // Handle position selection
  const handleSelectPosition = (positionId: string) => {
    if (selectedPositionId === positionId) {
      dispatch(clearSelectedPosition());
    } else {
      dispatch(selectPosition(positionId));
    }
  };

  // Handle closing a position
  const handleClosePosition = (positionId: string) => {
    const percentage = parseFloat(closePercentage);
    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      alert('Please enter a valid percentage between 1 and 100');
      return;
    }

    dispatch(closeAdvancedPosition({ positionId, percentage }));
    setClosePercentage('100');
  };

  // Handle updating stop loss
  const handleUpdateStopLoss = (positionId: string) => {
    const price = parseFloat(editPrice);
    const percentage = parseFloat(editPercentage);

    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      alert('Please enter a valid percentage between 1 and 100');
      return;
    }

    dispatch(updateStopLoss({ positionId, price, percentage }));
    setEditMode(null);
    setEditPrice('');
    setEditPercentage('100');
  };

  // Handle updating take profit
  const handleUpdateTakeProfit = (positionId: string) => {
    const price = parseFloat(editPrice);
    const percentage = parseFloat(editPercentage);

    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }

    if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
      alert('Please enter a valid percentage between 1 and 100');
      return;
    }

    dispatch(updateTakeProfit({ positionId, price, percentage }));
    setEditMode(null);
    setEditPrice('');
    setEditPercentage('100');
  };

  // Start editing stop loss
  const startEditStopLoss = (position: AdvancedPosition) => {
    setEditMode('stopLoss');
    setEditPrice(position.stopLoss ? position.stopLoss.price.toString() : '');
    setEditPercentage(position.stopLoss ? position.stopLoss.percentage.toString() : '100');
  };

  // Start editing take profit
  const startEditTakeProfit = (position: AdvancedPosition) => {
    setEditMode('takeProfit');
    setEditPrice(position.takeProfit ? position.takeProfit.price.toString() : '');
    setEditPercentage(position.takeProfit ? position.takeProfit.percentage.toString() : '100');
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditMode(null);
    setEditPrice('');
    setEditPercentage('100');
  };

  if (loading && positions.length === 0) {
    return (
      <div className="advanced-positions-list p-4 text-center">
        <p>Loading positions...</p>
      </div>
    );
  }

  if (positions.length === 0) {
    return (
      <div className="advanced-positions-list p-4 text-center">
        <p className="text-gray-500">No open positions</p>
      </div>
    );
  }

  return (
    <div className="advanced-positions-list">
      {positions.map((position) => {
        const pnl = calculatePnL(position);
        const pnlPercentage = calculatePnLPercentage(position);
        const isProfitable = pnl > 0;
        const isSelected = selectedPositionId === position.id;
        const currentPrice = currentPrices[position.market as keyof typeof currentPrices] || position.entryPrice;

        return (
          <div
            key={position.id}
            className={`position-item border rounded-md p-3 mb-3 ${isSelected ? 'border-blue-500' : ''}`}
          >
            {/* Position header */}
            <div
              className="flex justify-between items-center mb-2 cursor-pointer"
              onClick={() => handleSelectPosition(position.id)}
            >
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${position.isLong ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-medium">{position.isLong ? 'Long' : 'Short'} {position.market}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">{position.leverage}x</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isSelected ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Basic position info - always visible */}
            <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
              <div>
                <div className="text-gray-500">Size</div>
                <div>${position.size.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Margin</div>
                <div>${position.margin.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Entry Price</div>
                <div>${position.entryPrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Mark Price</div>
                <div>${currentPrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Liq. Price</div>
                <div className="text-red-500">${position.liquidationPrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">PnL</div>
                <div className={isProfitable ? 'text-green-500' : 'text-red-500'}>
                  {isProfitable ? '+' : ''}{pnl.toFixed(2)} ({pnlPercentage.toFixed(2)}%)
                </div>
              </div>
            </div>

            {/* Expanded position details */}
            {isSelected && (
              <div className="mt-4 border-t pt-4">
                {/* Stop Loss section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Stop Loss</h4>
                    <button
                      onClick={() => startEditStopLoss(position)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      {position.stopLoss ? 'Edit' : 'Add'}
                    </button>
                  </div>

                  {position.stopLoss ? (
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      <div className="flex justify-between">
                        <span>Price: ${position.stopLoss.price.toFixed(2)}</span>
                        <span>Close: {position.stopLoss.percentage}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No stop loss set</div>
                  )}

                  {editMode === 'stopLoss' && (
                    <div className="mt-2 p-2 border rounded">
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">Price</label>
                        <input
                          type="number"
                          className="w-full p-1 border rounded text-sm"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Enter price"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">Close Percentage</label>
                        <input
                          type="number"
                          className="w-full p-1 border rounded text-sm"
                          value={editPercentage}
                          onChange={(e) => setEditPercentage(e.target.value)}
                          min="1"
                          max="100"
                          placeholder="1-100%"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelEdit}
                          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateStopLoss(position.id)}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Take Profit section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Take Profit</h4>
                    <button
                      onClick={() => startEditTakeProfit(position)}
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                    >
                      {position.takeProfit ? 'Edit' : 'Add'}
                    </button>
                  </div>

                  {position.takeProfit ? (
                    <div className="bg-gray-50 p-2 rounded text-sm">
                      <div className="flex justify-between">
                        <span>Price: ${position.takeProfit.price.toFixed(2)}</span>
                        <span>Close: {position.takeProfit.percentage}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No take profit set</div>
                  )}

                  {editMode === 'takeProfit' && (
                    <div className="mt-2 p-2 border rounded">
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">Price</label>
                        <input
                          type="number"
                          className="w-full p-1 border rounded text-sm"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Enter price"
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">Close Percentage</label>
                        <input
                          type="number"
                          className="w-full p-1 border rounded text-sm"
                          value={editPercentage}
                          onChange={(e) => setEditPercentage(e.target.value)}
                          min="1"
                          max="100"
                          placeholder="1-100%"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelEdit}
                          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleUpdateTakeProfit(position.id)}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Close Position section */}
                <div>
                  <h4 className="font-medium mb-2">Close Position</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      className="w-20 p-1 border rounded text-sm"
                      value={closePercentage}
                      onChange={(e) => setClosePercentage(e.target.value)}
                      min="1"
                      max="100"
                      placeholder="1-100%"
                    />
                    <span className="text-sm">%</span>
                    <button
                      onClick={() => handleClosePosition(position.id)}
                      className="ml-auto text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AdvancedPositionsList;
