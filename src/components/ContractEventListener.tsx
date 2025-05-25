import { useEffect } from 'react';
import { contractUtils } from '../utils/ContractUtils';
import { useAppDispatch, useAppSelector } from '../store/Hooks';
import { addNotification } from '../store/NotificationSlice';
import { useContracts } from '../hooks/useContracts';

/**
 * Component that listens for contract events and updates the UI accordingly
 * This component doesn't render anything, it just sets up event listeners
 */
const ContractEventListener: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isConnected } = useAppSelector((state) => state.wallet);
  const { fetchPosition, fetchMarketData, fetchUserBalance } = useContracts();

  useEffect(() => {
    if (!isConnected) return;

    // Set up event listeners
    const setupEventListeners = () => {
      // Position Opened event
      contractUtils.onPositionOpened((trader, size, margin, isLong, price) => {
        console.log('Position opened:', { trader, size, margin, isLong, price });
        
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'success',
          message: `Position opened: ${isLong ? 'Long' : 'Short'} ${contractUtils.formatPrice(size)} @ $${contractUtils.formatPrice(price)}`
        }));
        
        // Refresh data
        fetchPosition();
        fetchMarketData();
        fetchUserBalance();
      });

      // Position Closed event
      contractUtils.onPositionClosed((trader, size, margin, isLong, price, pnl) => {
        console.log('Position closed:', { trader, size, margin, isLong, price, pnl });
        
        const pnlFormatted = contractUtils.formatUSDC(pnl);
        const isProfitable = pnl > BigInt(0);
        
        dispatch(addNotification({
          id: Date.now().toString(),
          type: isProfitable ? 'success' : 'warning',
          message: `Position closed: ${isLong ? 'Long' : 'Short'} ${contractUtils.formatPrice(size)} @ $${contractUtils.formatPrice(price)} | P&L: ${isProfitable ? '+' : ''}${pnlFormatted} USDC`
        }));
        
        // Refresh data
        fetchPosition();
        fetchMarketData();
        fetchUserBalance();
      });

      // Position Liquidated event
      contractUtils.onPositionLiquidated((trader, size, margin, isLong, price) => {
        console.log('Position liquidated:', { trader, size, margin, isLong, price });
        
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'error',
          message: `Position liquidated: ${isLong ? 'Long' : 'Short'} ${contractUtils.formatPrice(size)} @ $${contractUtils.formatPrice(price)}`
        }));
        
        // Refresh data
        fetchPosition();
        fetchMarketData();
        fetchUserBalance();
      });
    };

    // Set up event listeners
    setupEventListeners();

    // Clean up event listeners when component unmounts
    return () => {
      contractUtils.removeAllListeners();
    };
  }, [isConnected, dispatch, fetchPosition, fetchMarketData, fetchUserBalance]);

  // This component doesn't render anything
  return null;
};

export default ContractEventListener;
