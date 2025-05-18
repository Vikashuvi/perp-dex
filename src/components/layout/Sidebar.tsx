import React, { Dispatch, SetStateAction } from 'react';
import type { TabType } from '../../types/navigation';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: Dispatch<SetStateAction<TabType>>;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="h-screen w-20 bg-card-darker border-r border-border-dark relative overflow-hidden">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-border-dark relative z-10">
        <div className="bg-gradient-primary text-white p-2 rounded-lg glow-primary">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246-.48-.32-1.054-.545-1.676-.662V7.051c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col items-center pt-8 space-y-8 relative z-10">
        {/* Trade */}
        <button
          onClick={() => setActiveTab('trade')}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group relative ${
            activeTab === 'trade'
              ? 'bg-primary-900/30 text-primary-400 shadow-[0_0_15px_rgba(124,58,237,0.3)]'
              : 'text-text-tertiary hover:bg-card-dark hover:text-text-secondary'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs mt-1">Trade</span>

          {/* Hover tooltip */}
          <div className="absolute left-full ml-4 px-2 py-1 bg-card-dark rounded-md text-text-primary text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg border border-border-dark z-50">
            Trade
          </div>

          {/* Active indicator */}
          {activeTab === 'trade' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-primary rounded-r-full"></div>
          )}
        </button>

        {/* Markets */}
        <button
          onClick={() => setActiveTab('markets')}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group relative ${
            activeTab === 'markets'
              ? 'bg-primary-900/30 text-primary-400 shadow-[0_0_15px_rgba(124,58,237,0.3)]'
              : 'text-text-tertiary hover:bg-card-dark hover:text-text-secondary'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <span className="text-xs mt-1">Markets</span>

          {/* Hover tooltip */}
          <div className="absolute left-full ml-4 px-2 py-1 bg-card-dark rounded-md text-text-primary text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg border border-border-dark z-50">
            Markets
          </div>

          {/* Active indicator */}
          {activeTab === 'markets' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-primary rounded-r-full"></div>
          )}
        </button>

        {/* Portfolio */}
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group relative ${
            activeTab === 'portfolio'
              ? 'bg-primary-900/30 text-primary-400 shadow-[0_0_15px_rgba(124,58,237,0.3)]'
              : 'text-text-tertiary hover:bg-card-dark hover:text-text-secondary'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span className="text-xs mt-1">Portfolio</span>

          {/* Hover tooltip */}
          <div className="absolute left-full ml-4 px-2 py-1 bg-card-dark rounded-md text-text-primary text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg border border-border-dark z-50">
            Portfolio
          </div>

          {/* Active indicator */}
          {activeTab === 'portfolio' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-primary rounded-r-full"></div>
          )}
        </button>

        {/* Analytics */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-300 group relative ${
            activeTab === 'analytics'
              ? 'bg-primary-900/30 text-primary-400 shadow-[0_0_15px_rgba(124,58,237,0.3)]'
              : 'text-text-tertiary hover:bg-card-dark hover:text-text-secondary'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-xs mt-1">Analytics</span>

          {/* Hover tooltip */}
          <div className="absolute left-full ml-4 px-2 py-1 bg-card-dark rounded-md text-text-primary text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg border border-border-dark z-50">
            Analytics
          </div>

          {/* Active indicator */}
          {activeTab === 'analytics' && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-primary rounded-r-full"></div>
          )}
        </button>
      </div>

      {/* Bottom section */}
      <div className="pb-6 flex flex-col items-center space-y-4 relative z-10">
        {/* Settings */}
        <button className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-text-tertiary hover:bg-card-dark hover:text-text-secondary transition-all duration-300 group relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs mt-1">Settings</span>

          {/* Hover tooltip */}
          <div className="absolute left-full ml-4 px-2 py-1 bg-card-dark rounded-md text-text-primary text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-lg border border-border-dark z-50">
            Settings
          </div>
        </button>
      </div>

      {/* Background blur effect */}
      <div className="absolute inset-0 backdrop-blur-sm -z-10"></div>
    </div>
  );
};

export default Sidebar;
