import React, { useState, useEffect } from 'react'
import { addNotification } from './store/NotificationSlice'
import { useAppDispatch } from './store/Hooks'
import Layout from './components/layout/Layout'
import Dashboard from './components/Dashboard'
import ContractEventListener from './components/ContractEventListener'
import type { TabType } from './types/navigation'

function App() {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('trade');

  // Apply dark mode class to body
  useEffect(() => {
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark');
  }, []);

  // Demo notifications
  useEffect(() => {
    // Welcome notification
    setTimeout(() => {
      dispatch(addNotification({
        type: 'info',
        title: 'Welcome to Perpetual DEX',
        message: 'Connect your wallet to start trading'
      }));
    }, 2000);

    // Demo notifications
    setTimeout(() => {
      dispatch(addNotification({
        type: 'success',
        title: 'Position Opened',
        message: 'Successfully opened long ETH-USD position'
      }));
    }, 5000);

    setTimeout(() => {
      dispatch(addNotification({
        type: 'warning',
        title: 'Liquidation Warning',
        message: 'Your BTC-USD position is approaching liquidation price'
      }));
    }, 8000);
  }, [dispatch]);

  return (
    <>
      {/* Contract event listener - doesn't render anything */}
      <ContractEventListener />

      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        <Dashboard activeTab={activeTab} />
      </Layout>
    </>
  )
}

export default App