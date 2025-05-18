import React from 'react';
import type { ReactNode, Dispatch, SetStateAction } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import type { TabType } from '../../types/navigation';

interface LayoutProps {
  children: ReactNode;
  activeTab: TabType;
  setActiveTab: Dispatch<SetStateAction<TabType>>;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-gradient-dark text-text-primary flex">
      {/* Sidebar - hidden on mobile, visible on md screens and up */}
      <div className="hidden md:block fixed top-0 left-0 z-50 w-20">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen w-full md:ml-20">
        {/* Top navbar */}
        <Navbar />

        {/* Main content */}
        <main className="flex-1 container-fluid pt-20 pb-20 md:pb-6 relative z-10">
          {children}
        </main>

        {/* Footer */}
        <footer className="py-4 border-t border-border-dark text-text-tertiary relative z-10">
          <div className="container-fluid">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm">© 2023 Perpetual DEX. All rights reserved.</p>
              </div>
              <div className="flex space-x-6">
                <a href="#" className="text-sm hover:text-gradient-primary transition-colors duration-200">Terms</a>
                <a href="#" className="text-sm hover:text-gradient-primary transition-colors duration-200">Privacy</a>
                <a href="#" className="text-sm hover:text-gradient-primary transition-colors duration-200">Documentation</a>
                <a href="#" className="text-sm hover:text-gradient-primary transition-colors duration-200">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile navigation - visible only on mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 border-t border-border-dark bg-card-darker/90 backdrop-blur-md">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('trade')}
            className={`flex flex-col items-center justify-center ${
              activeTab === 'trade' ? 'text-gradient-primary' : 'text-text-tertiary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">Trade</span>
          </button>
          <button
            onClick={() => setActiveTab('markets')}
            className={`flex flex-col items-center justify-center ${
              activeTab === 'markets' ? 'text-gradient-primary' : 'text-text-tertiary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <span className="text-xs mt-1">Markets</span>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex flex-col items-center justify-center ${
              activeTab === 'portfolio' ? 'text-gradient-primary' : 'text-text-tertiary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs mt-1">Portfolio</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-col items-center justify-center ${
              activeTab === 'analytics' ? 'text-gradient-primary' : 'text-text-tertiary'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs mt-1">Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Layout;
