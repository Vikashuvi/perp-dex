import { useDispatch } from "react-redux"
import { setWalletConnection, disconnectWallet, updateChainId } from "../store/WalletSlice"
import { useAppSelector } from "../store/Hooks";
import { useEffect, useState } from "react";
import { contractUtils } from "../utils/ContractUtils";
import NetworkSwitcher from "./NetworkSwitcher";

const WalletConnect = () => {
  const dispatch = useDispatch();
  const { address, isConnected } = useAppSelector((state) => state.wallet);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          handleAccountsChanged(accounts);
        } else {
          dispatch(disconnectWallet());
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        dispatch(updateChainId(chainId));
      });
    }

    // Clean up event listeners when component unmounts
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', (chainId: string) => {
          dispatch(updateChainId(chainId));
        });
      }
    };
  }, [dispatch]);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length > 0) {
      const chainId = await window.ethereum!.request({
        method: 'eth_chainId'
      });
      dispatch(setWalletConnection({
        address: accounts[0],
        chainId
      }));
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          dispatch(setWalletConnection({
            address: accounts[0],
            chainId
          }));
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    try {
      // Use contractUtils to connect wallet
      const connectedAddress = await contractUtils.connectWallet();

      if (connectedAddress) {
        const chainId = await window.ethereum!.request({
          method: 'eth_chainId'
        });

        dispatch(setWalletConnection({
          address: connectedAddress,
          chainId
        }));

        console.log('Connected to wallet:', connectedAddress);
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      alert('Error connecting to wallet: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-connect flex items-center space-x-4">
      {/* Network Switcher - only show when connected */}
      {isConnected && <NetworkSwitcher />}

      {/* Wallet Connection Button */}
      {isConnected ? (
        <div className="glass px-4 py-2 rounded-lg border border-border-dark flex items-center space-x-2 transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <div className="w-2 h-2 rounded-full bg-success"></div>
          <p className="text-sm font-medium">{address.slice(0, 6)}...{address.slice(-4)}</p>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={loading}
          className={`bg-gradient-primary hover:opacity-90 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
};

export default WalletConnect