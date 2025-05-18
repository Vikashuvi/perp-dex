import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/Hooks';
import { fetchTokenBalances, clearBalances } from '../store/TokenBalanceSlice';

const TokenBalances = () => {
  const dispatch = useAppDispatch();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const { balances, loading, error } = useAppSelector((state) => state.tokenBalances);
  const [refreshAnimation, setRefreshAnimation] = useState(false);
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    if (isConnected && address) {
      dispatch(fetchTokenBalances(address));
    } else {
      dispatch(clearBalances());
    }
  }, [dispatch, isConnected, address]);

  const handleRefresh = () => {
    if (isConnected && address && !loading) {
      setRefreshAnimation(true);
      setTimeout(() => setRefreshAnimation(false), 1000);
      dispatch(fetchTokenBalances(address));
    }
  };

  if (!isConnected) {
    return (
      <div className="token-balances mt-6 bg-card-dark rounded-xl shadow-md overflow-hidden border border-border-dark">
        <div className="px-5 py-4 border-b border-border-dark">
          <div className="flex items-center mb-4">
            <div className="bg-gradient-primary text-white p-2 rounded-lg mr-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gradient-primary">Token Balances</h2>
          </div>
          <p className="text-text-tertiary mb-4">
            Connect your wallet to view your token balances
          </p>
          <button className="w-full py-3 bg-gradient-primary text-white rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:opacity-90">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="token-balances mt-6 bg-card-dark rounded-xl shadow-md overflow-hidden border border-border-dark">
      <div className="px-5 py-4 border-b border-border-dark flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-gradient-primary text-white p-2 rounded-lg mr-2">
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
          className={`flex items-center px-3 py-1.5 rounded text-sm font-medium transition-all duration-200 ${
            loading
              ? 'bg-card-darker text-text-tertiary cursor-not-allowed'
              : 'bg-gradient-primary text-white hover:shadow-md hover:opacity-90'
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
        <div className="m-4 p-3 rounded-md bg-red-900/30 text-red-300 border border-red-800">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            <span>Error: {error}</span>
          </div>
        </div>
      )}

      <div className="p-5">
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
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">No Tokens Found</h3>
            <p className="text-text-tertiary">Your wallet doesn't have any tokens yet</p>
          </div>
        ) : (
          <div className="token-list">
            <div className="grid grid-cols-3 font-medium text-sm mb-3 px-3 py-2 rounded-md bg-card-darker text-text-secondary">
              <div>Token</div>
              <div className="text-right">Balance</div>
              <div className="text-right">Symbol</div>
            </div>

            <div className="divide-y divide-border-dark">
              {balances.map((item) => (
                <div
                  key={item.token.address}
                  className="grid grid-cols-3 py-4 px-3 items-center hover:bg-card-darker transition-colors duration-200 rounded-md"
                >
                  <div className="flex items-center">
                    {item.token.logoURI ? (
                      <img
                        src={item.token.logoURI}
                        alt={item.token.symbol}
                        className="w-8 h-8 mr-3 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 mr-3 rounded-full flex items-center justify-center bg-gradient-secondary">
                        <span className="text-xs font-bold text-white">{item.token.symbol.substring(0, 2)}</span>
                      </div>
                    )}
                    <span className="font-medium">{item.token.name}</span>
                  </div>
                  <div className="text-right font-mono text-text-primary">
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

export default TokenBalances;