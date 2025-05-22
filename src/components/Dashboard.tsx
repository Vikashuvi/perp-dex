import React from 'react';
import type { TabType } from '../types/navigation';
import BalanceCard from './cards/BalanceCard';
import TradingCard from './cards/TradingCard';
import ChartCard from './cards/ChartCard';
import OrderBookCard from './cards/OrderBookCard';
import RiskPool from './RiskPool';

interface DashboardProps {
  activeTab: TabType;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab }) => {
  return (
    <div className="dashboard">
      {activeTab === 'trade' && (
        <div className="space-y-8">
          {/* Main trading grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column - Balance and Trading */}
            <div className="lg:col-span-4 space-y-8">
              <BalanceCard />
              <TradingCard />
              <RiskPool />
            </div>

            {/* Right column - Chart and Order Book */}
            <div className="lg:col-span-8 space-y-8">
              <ChartCard />
              <OrderBookCard />
            </div>
          </div>

          {/* Background glow effects */}
          <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-primary-600/10 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-1/3 right-1/3 w-1/3 h-1/3 bg-secondary-600/10 rounded-full blur-[100px]"></div>
          </div>
        </div>
      )}

      {activeTab === 'markets' && (
        <div className="glass-card-hover">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gradient-secondary">Markets</h2>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="bg-gradient-secondary inline-block p-4 rounded-full mb-4 shadow-[0_0_15px_rgba(37,99,235,0.5)] animate-float">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Markets Coming Soon</h3>
                <p className="text-text-tertiary">This section is under development.</p>
                <button className="btn btn-neon mt-6 hover-lift">
                  Explore Markets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="glass-card-hover">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gradient-accent">Portfolio</h2>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="bg-gradient-accent inline-block p-4 rounded-full mb-4 shadow-[0_0_15px_rgba(192,38,211,0.5)] animate-float">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Portfolio Coming Soon</h3>
                <p className="text-text-tertiary">This section is under development.</p>
                <button className="btn btn-neon mt-6 hover-lift">
                  View Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="glass-card-hover">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gradient-primary">Analytics</h2>
          </div>
          <div className="card-body">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="bg-gradient-primary inline-block p-4 rounded-full mb-4 shadow-[0_0_15px_rgba(124,58,237,0.5)] animate-float">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-text-tertiary">This section is under development.</p>
                <button className="btn btn-neon mt-6 hover-lift">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
