import React from 'react';

// This is a placeholder component for the price chart
// In a real application, you would use a charting library like TradingView, Chart.js, or Recharts
const PriceChart = () => {
  return (
    <div className="price-chart h-full flex flex-col justify-center relative">
      <div className="absolute inset-0 z-0">
        {/* Grid lines */}
        <div className="grid grid-cols-6 h-full">
          {[...Array(7)].map((_, i) => (
            <div key={`vline-${i}`} className="border-l border-border-dark/20 h-full"></div>
          ))}
        </div>
        <div className="grid grid-rows-6 w-full absolute inset-0">
          {[...Array(7)].map((_, i) => (
            <div key={`hline-${i}`} className="border-b border-border-dark/20 w-full"></div>
          ))}
        </div>

        {/* Chart visualization */}
        <div className="absolute inset-0 flex items-end px-4">
          <svg className="w-full h-3/4" viewBox="0 0 100 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(124, 58, 237, 0.5)" />
                <stop offset="100%" stopColor="rgba(124, 58, 237, 0)" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Area fill */}
            <path
              d="M0,35 L5,32 L10,34 L15,30 L20,33 L25,28 L30,25 L35,20 L40,22 L45,18 L50,15 L55,10 L60,12 L65,8 L70,14 L75,12 L80,15 L85,10 L90,8 L95,12 L100,10 L100,50 L0,50 Z"
              fill="url(#chartGradient)"
              opacity="0.6"
            />

            {/* Line */}
            <path
              d="M0,35 L5,32 L10,34 L15,30 L20,33 L25,28 L30,25 L35,20 L40,22 L45,18 L50,15 L55,10 L60,12 L65,8 L70,14 L75,12 L80,15 L85,10 L90,8 L95,12 L100,10"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="0.5"
              filter="url(#glow)"
            />
          </svg>
        </div>
      </div>

      <div className="text-center z-10 bg-card-darker/60 backdrop-blur-md py-4 px-6 rounded-xl border border-border-dark/30 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-3 bg-gradient-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2 text-gradient-primary">Chart Placeholder</h3>
        <p className="text-text-tertiary text-sm">
          In a real application, this would be an interactive price chart using a library like TradingView or Chart.js
        </p>
      </div>
    </div>
  );
};

export default PriceChart;
