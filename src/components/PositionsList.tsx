import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/Hooks';
import { fetchPositions, closePosition } from '../store/PositionSlice';

const PositionsList = () => {
  const dispatch = useAppDispatch();
  const { address } = useAppSelector((state) => state.wallet);
  const { positions, loading } = useAppSelector((state) => state.positions);
  const currentPrice = 1800; // Mock price, would come from oracle
  
  useEffect(() => {
    if (address) {
      dispatch(fetchPositions(address));
    }
  }, [dispatch, address]);
  
  const handleClosePosition = (positionId: string) => {
    dispatch(closePosition(positionId));
  };
  
  // Calculate PnL for a position
  const calculatePnL = (position: any) => {
    const { size, entryPrice, isLong } = position;
    
    if (isLong) {
      return size * (currentPrice - entryPrice) / entryPrice;
    } else {
      return size * (entryPrice - currentPrice) / entryPrice;
    }
  };
  
  // Calculate PnL percentage
  const calculatePnLPercentage = (position: any) => {
    const pnl = calculatePnL(position);
    return (pnl / position.margin) * 100;
  };
  
  // Calculate liquidation price
  const calculateLiquidationPrice = (position: any) => {
    const { entryPrice, leverage, isLong } = position;
    const liquidationThreshold = 0.8; // 80% of margin
    
    if (isLong) {
      return entryPrice * (1 - liquidationThreshold / leverage);
    } else {
      return entryPrice * (1 + liquidationThreshold / leverage);
    }
  };
  
  if (loading) {
    return (
      <div className="positions-list p-4 text-center">
        <p>Loading positions...</p>
      </div>
    );
  }
  
  if (positions.length === 0) {
    return (
      <div className="positions-list p-4 text-center">
        <p className="text-gray-500">No open positions</p>
      </div>
    );
  }
  
  return (
    <div className="positions-list">
      {positions.map((position) => {
        const pnl = calculatePnL(position);
        const pnlPercentage = calculatePnLPercentage(position);
        const liquidationPrice = calculateLiquidationPrice(position);
        const isProfitable = pnl > 0;
        
        return (
          <div key={position.id} className="position-item border rounded-md p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${position.isLong ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="font-medium">{position.isLong ? 'Long' : 'Short'} ETH-USD</span>
              </div>
              <span className="text-sm text-gray-500">{position.leverage}x</span>
            </div>
            
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
                <div>${liquidationPrice.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">PnL</div>
                <div className={isProfitable ? 'text-green-500' : 'text-red-500'}>
                  {isProfitable ? '+' : ''}{pnl.toFixed(2)} ({pnlPercentage.toFixed(2)}%)
                </div>
              </div>
            </div>
            
            <button
              onClick={() => handleClosePosition(position.id)}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm font-medium"
            >
              Close Position
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PositionsList;
