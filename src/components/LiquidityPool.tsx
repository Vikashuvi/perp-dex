import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../store/Hooks';

interface LiquidityProviderInfo {
  address: string;
  amount: number;
  sharePercentage: number;
  rewards: number;
}

interface PoolStats {
  totalLiquidity: number;
  utilizationRate: number;
  feeRate: number;
  insuranceFund: number;
  apy: number;
}

const LiquidityPool = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const { balances } = useAppSelector((state) => state.tokenBalances);
  
  // Local state
  const [activeTab, setActiveTab] = useState<'provide' | 'withdraw' | 'stats'>('provide');
  const [amount, setAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Mock data - in a real app, this would come from the blockchain
  const [providerInfo, setProviderInfo] = useState<LiquidityProviderInfo>({
    address: address || '',
    amount: 0,
    sharePercentage: 0,
    rewards: 0
  });
  
  const [poolStats, setPoolStats] = useState<PoolStats>({
    totalLiquidity: 1000000,
    utilizationRate: 65,
    feeRate: 0.05,
    insuranceFund: 50000,
    apy: 12.5
  });
  
  // Update provider info when address changes
  useEffect(() => {
    if (isConnected && address) {
      // In a real app, fetch provider info from the blockchain
      // For now, use mock data
      setProviderInfo({
        address,
        amount: 5000,
        sharePercentage: 0.5,
        rewards: 125
      });
    } else {
      setProviderInfo({
        address: '',
        amount: 0,
        sharePercentage: 0,
        rewards: 0
      });
    }
  }, [address, isConnected]);
  
  // Handle providing liquidity
  const handleProvideLiquidity = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, call the smart contract
    // For now, simulate a delay and update the UI
    setTimeout(() => {
      const newAmount = providerInfo.amount + parseFloat(amount);
      const newSharePercentage = (newAmount / (poolStats.totalLiquidity + parseFloat(amount))) * 100;
      
      setProviderInfo({
        ...providerInfo,
        amount: newAmount,
        sharePercentage: newSharePercentage
      });
      
      setPoolStats({
        ...poolStats,
        totalLiquidity: poolStats.totalLiquidity + parseFloat(amount)
      });
      
      setAmount('');
      setIsLoading(false);
    }, 1500);
  };
  
  // Handle withdrawing liquidity
  const handleWithdrawLiquidity = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    if (parseFloat(amount) > providerInfo.amount) {
      alert('Insufficient liquidity');
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, call the smart contract
    // For now, simulate a delay and update the UI
    setTimeout(() => {
      const newAmount = providerInfo.amount - parseFloat(amount);
      const newSharePercentage = newAmount > 0 
        ? (newAmount / (poolStats.totalLiquidity - parseFloat(amount))) * 100
        : 0;
      
      setProviderInfo({
        ...providerInfo,
        amount: newAmount,
        sharePercentage: newSharePercentage
      });
      
      setPoolStats({
        ...poolStats,
        totalLiquidity: poolStats.totalLiquidity - parseFloat(amount)
      });
      
      setAmount('');
      setIsLoading(false);
    }, 1500);
  };
  
  // Handle claiming rewards
  const handleClaimRewards = () => {
    if (providerInfo.rewards <= 0) {
      alert('No rewards to claim');
      return;
    }
    
    setIsLoading(true);
    
    // In a real app, call the smart contract
    // For now, simulate a delay and update the UI
    setTimeout(() => {
      setProviderInfo({
        ...providerInfo,
        rewards: 0
      });
      
      setIsLoading(false);
    }, 1500);
  };
  
  // Handle max button click
  const handleMaxClick = () => {
    if (activeTab === 'provide') {
      // Find USDC balance
      const usdcBalance = balances.find(b => b.token.symbol === 'USDC');
      if (usdcBalance) {
        setAmount(usdcBalance.formattedBalance);
      }
    } else if (activeTab === 'withdraw') {
      setAmount(providerInfo.amount.toString());
    }
  };
  
  if (!isConnected) {
    return (
      <div className="liquidity-pool mt-6 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Liquidity Pool</h2>
        <p className="text-gray-500">Connect your wallet to provide liquidity and earn fees</p>
      </div>
    );
  }
  
  return (
    <div className="liquidity-pool mt-6 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 p-4 border-b">
        <h2 className="text-xl font-semibold">Liquidity Pool</h2>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`py-3 px-4 font-medium ${
            activeTab === 'provide' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('provide')}
        >
          Provide
        </button>
        <button
          className={`py-3 px-4 font-medium ${
            activeTab === 'withdraw' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
        <button
          className={`py-3 px-4 font-medium ${
            activeTab === 'stats' 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
      </div>
      
      <div className="p-4">
        {/* Provider info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <div className="text-gray-500">Your Liquidity</div>
              <div className="font-medium">${providerInfo.amount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Share</div>
              <div className="font-medium">{providerInfo.sharePercentage.toFixed(4)}%</div>
            </div>
            <div>
              <div className="text-gray-500">Rewards</div>
              <div className="font-medium">${providerInfo.rewards.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500">Estimated APY</div>
              <div className="font-medium text-green-500">{poolStats.apy.toFixed(2)}%</div>
            </div>
          </div>
          
          {providerInfo.rewards > 0 && (
            <button
              onClick={handleClaimRewards}
              disabled={isLoading}
              className="mt-3 w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium"
            >
              {isLoading ? 'Processing...' : `Claim $${providerInfo.rewards.toLocaleString()} Rewards`}
            </button>
          )}
        </div>
        
        {/* Provide/Withdraw form */}
        {(activeTab === 'provide' || activeTab === 'withdraw') && (
          <div>
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                <input
                  type="number"
                  id="amount"
                  className="block w-full pl-7 pr-20 py-2 border rounded-md"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                />
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    type="button"
                    className="h-full px-2 text-sm text-blue-500 font-medium"
                    onClick={handleMaxClick}
                  >
                    MAX
                  </button>
                  <span className="pr-3 text-gray-500">USDC</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={activeTab === 'provide' ? handleProvideLiquidity : handleWithdrawLiquidity}
              disabled={isLoading}
              className={`w-full py-3 rounded-md font-medium ${
                activeTab === 'provide' 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-red-500 hover:bg-red-600'
              } text-white`}
            >
              {isLoading ? 'Processing...' : (activeTab === 'provide' ? 'Provide Liquidity' : 'Withdraw Liquidity')}
            </button>
          </div>
        )}
        
        {/* Pool stats */}
        {activeTab === 'stats' && (
          <div>
            <h3 className="text-lg font-medium mb-3">Pool Statistics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Total Liquidity</div>
                <div className="text-xl font-medium">${poolStats.totalLiquidity.toLocaleString()}</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Utilization Rate</div>
                <div className="text-xl font-medium">{poolStats.utilizationRate}%</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Fee Rate</div>
                <div className="text-xl font-medium">{poolStats.feeRate * 100}%</div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500">Insurance Fund</div>
                <div className="text-xl font-medium">${poolStats.insuranceFund.toLocaleString()}</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">How It Works</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Provide liquidity to earn fees from traders</li>
                <li>• Fees are distributed proportionally to your share of the pool</li>
                <li>• Higher utilization rate typically means higher returns</li>
                <li>• The insurance fund protects against losses from liquidations</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidityPool;
