import React from 'react';
import WalletConnect from '../WalletConnect';
import NotificationContainer from '../NotificationContainer';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border-dark backdrop-blur-md bg-card-darker/80">
      <div className="container-fluid md:pl-24">
        <div className="flex justify-between items-center h-16">
          {/* Logo and brand - visible only on mobile */}
          <div className="flex items-center md:hidden">
            <div className="flex-shrink-0 flex items-center">
              <div className="bg-gradient-primary text-white p-2 rounded-lg mr-2 glow-primary">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-xl font-bold text-gradient-primary">Perpetual DEX</span>
            </div>
          </div>

          {/* Page title - visible on desktop */}
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-text-primary">Dashboard</h1>
          </div>

          {/* Right side controls */}
          <div className="flex items-center space-x-4">
            {/* Network selector */}
            <div className="hidden md:flex items-center">
              <div className="glass px-3 py-1.5 rounded-lg border border-border-dark flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-sm font-medium">Ethereum</span>
                <svg className="w-4 h-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Notification bell */}
            <div className="relative">
              <NotificationContainer />
            </div>

            {/* Connect wallet button */}
            <WalletConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

// Enhanced WalletConnect button with glassmorphism styling
const WalletConnectButton: React.FC = () => {
  return (
    <div className="wallet-connect-button">
      <WalletConnect />
    </div>
  );
};

export default Navbar;
