import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/Hooks';
import { fetchTokenBalances, clearBalances } from '../../store/TokenBalanceSlice';

const BalanceCard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const { balances, loading, error } = useAppSelector((state) => state.tokenBalances);
  const [refreshAnimation, setRefreshAnimation] = useState(false);

  const handleRefresh = () => {
    if (isConnected && address && !loading) {
      setRefreshAnimation(true);
      setTimeout(() => setRefreshAnimation(false), 1000);
      dispatch(fetchTokenBalances(address));
    }
  };

  if (!isConnected) {
    return (
      <div className="glass-card-hover">
        <div className="card-header">
          <div className="flex items-center">
            <div className="bg-gradient-primary text-white p-2 rounded-lg mr-3 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gradient-primary">Token Balances</h2>
          </div>
        </div>
        <div className="card-body">
          <div className="glass-panel p-4 mb-6 flex items-center">
            <div className="w-12 h-12 mr-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.3)] animate-pulse-slow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-1 text-text-primary">Wallet Not Connected</h3>
              <p className="text-text-tertiary text-sm">
                Connect your wallet to view your token balances
              </p>
            </div>
          </div>
          <button className="btn btn-neon w-full hover-lift py-3">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card-hover">
      <div className="card-header">
        <div className="flex items-center">
          <div className="bg-gradient-primary text-white p-2 rounded-lg mr-3 shadow-[0_0_10px_rgba(124,58,237,0.3)]">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gradient-primary">Token Balances</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className={`btn btn-sm ${
            loading
              ? 'btn-secondary cursor-not-allowed'
              : 'btn-neon hover-lift'
          }`}
        >
          <svg
            className={`w-4 h-4 mr-1.5 ${refreshAnimation ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mx-5 mt-5 p-3 rounded-md bg-red-900/30 text-red-300 border border-red-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            <span>Error: {error}</span>
          </div>
        </div>
      )}

      <div className="card-body">
        {loading && balances.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full opacity-20 animate-ping"></div>
              <svg className="w-16 h-16 mx-auto relative animate-spin text-gradient-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
              </svg>
            </div>
            <p className="text-text-tertiary">Loading token balances...</p>
          </div>
        ) : balances.length === 0 ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.3)] animate-bounce-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No Tokens Found</h3>
            <p className="text-text-tertiary">Your wallet doesn't have any tokens yet</p>
          </div>
        ) : (
          <div className="token-list">
            <div className="glass-panel grid grid-cols-3 font-medium text-sm mb-4 px-3 py-2.5 text-text-secondary">
              <div>Token</div>
              <div className="text-right">Balance</div>
              <div className="text-right">Symbol</div>
            </div>

            <div className="space-y-2.5">
              {balances.map((item, index) => (
                <div
                  key={item.token.address}
                  className="grid grid-cols-3 py-3 px-3 items-center hover:bg-card-darker/60 transition-all duration-300 rounded-md hover:shadow-[0_0_15px_rgba(124,58,237,0.2)] border border-transparent hover:border-primary-500/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center">
                    {item.token.logoURI ? (
                      <div className="relative mr-3">
                        <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 blur-sm"></div>
                        <img
                          src={item.token.logoURI}
                          alt={item.token.symbol}
                          className="w-9 h-9 rounded-full relative z-10 border border-border-dark/30"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 mr-3 rounded-full flex items-center justify-center bg-gradient-secondary shadow-[0_0_12px_rgba(37,99,235,0.4)] relative">
                        <span className="text-xs font-bold text-white">{item.token.symbol.substring(0, 2)}</span>
                      </div>
                    )}
                    <span className="font-medium text-text-primary">{item.token.name}</span>
                  </div>
                  <div className="text-right font-mono text-text-primary font-medium">
                    {parseFloat(item.formattedBalance).toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 6
                    })}
                  </div>
                  <div className="text-right font-medium text-gradient-secondary">{item.token.symbol}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceCard;
