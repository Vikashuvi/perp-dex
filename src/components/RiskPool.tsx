import React from 'react';

interface RiskLevel {
  level: string;
  multiplier: number;
  value: number;
}

const RiskPool: React.FC = () => {
  const riskLevels: RiskLevel[] = [
    { level: 'Minimal', multiplier: 0.50, value: 925.00 },
    { level: 'Low', multiplier: 0.70, value: 1291.50 },
    { level: 'Medium', multiplier: 0.90, value: 1656.00 },
    { level: 'High', multiplier: 1.10, value: 2018.50 },
    { level: 'Extreme', multiplier: 1.30, value: 2379.00 },
  ];

  return (
    <div className="glass-card">
      <div className="card-header flex justify-between items-center p-4 rounded-t-lg">
        <div className="flex items-center">
          <div className="bg-gradient-primary text-white p-2 rounded-lg mr-3 shadow-[0_0_20px_rgba(124,58,237,0.6)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gradient-primary">Risk Pool</h2>
        </div>
        <div className="text-sm text-text-tertiary bg-card-darker/40 px-2 py-1 rounded-md">
          v0.1
        </div>
      </div>
      
      <div className="card-body p-4 rounded-b-lg">
        <div className="text-sm text-text-secondary mb-4">
          Select Risk Level
        </div>
        
        {riskLevels.map((risk) => (
          <div 
            key={risk.level}
            className="grid grid-cols-2 py-3 px-4 rounded-md mb-3 bg-card-darker/40 hover:bg-card-darker/60 transition-all duration-200 cursor-pointer border border-border-dark/20"
          >
            <div className="text-text-primary font-medium">{risk.level}</div>
            <div className="text-right flex justify-between">
              <div className="font-medium">{risk.multiplier.toFixed(2)}</div>
              <div className="text-text-secondary">{risk.value.toFixed(2)}</div>
            </div>
          </div>
        ))}
        
        <div className="mt-6 p-4 rounded-md bg-primary-500/10 border border-primary-500/20 mb-2">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold text-text-primary">
              $1,825.50
            </div>
            <div className="flex items-center text-success-light">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span className="font-medium">+1.2%</span>
            </div>
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            Spread: 5.50 (0.3%)
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskPool;