import React, { useState, useEffect } from 'react';
import { NETWORK_CONFIGS, DEFAULT_CHAIN_ID } from '../config/contracts';
import { addNotification } from '../store/NotificationSlice';
import { useAppDispatch } from '../store/Hooks';

interface NetworkSwitcherProps {
  className?: string;
}

const NetworkSwitcher: React.FC<NetworkSwitcherProps> = ({ className = '' }) => {
  const dispatch = useAppDispatch();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);

  // Get current chain ID when component mounts
  useEffect(() => {
    const getChainId = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          setCurrentChainId(chainId);

          // Listen for chain changes
          window.ethereum.on('chainChanged', (chainIdHex: string) => {
            const newChainId = parseInt(chainIdHex, 16);
            setCurrentChainId(newChainId);
          });
        } catch (error) {
          console.error('Failed to get chain ID:', error);
        }
      }
    };

    getChainId();

    // Cleanup listener
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  // Switch network
  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) {
      dispatch(addNotification({
        id: Date.now().toString(),
        type: 'error',
        message: 'MetaMask is not installed'
      }));
      return;
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const network = NETWORK_CONFIGS[chainId];
          if (!network || !network.rpcUrl) {
            throw new Error(`Network configuration missing for chainId ${chainId}`);
          }

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${chainId.toString(16)}`,
                chainName: network.name,
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : undefined,
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
          dispatch(addNotification({
            id: Date.now().toString(),
            type: 'error',
            message: `Failed to add network: ${(addError as Error).message}`
          }));
        }
      } else {
        console.error('Failed to switch network:', switchError);
        dispatch(addNotification({
          id: Date.now().toString(),
          type: 'error',
          message: `Failed to switch network: ${switchError.message}`
        }));
      }
    }
  };

  // Get network name from chain ID
  const getNetworkName = (chainId: number | null): string => {
    if (chainId === null) return 'Not Connected';
    return NETWORK_CONFIGS[chainId]?.name || `Unknown (${chainId})`;
  };

  // Check if network is supported
  const isNetworkSupported = (chainId: number | null): boolean => {
    if (chainId === null) return false;
    return !!NETWORK_CONFIGS[chainId];
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative">
        <button
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
            isNetworkSupported(currentChainId)
              ? 'bg-primary-700 text-white'
              : 'bg-red-600 text-white'
          }`}
          onClick={() => switchNetwork(DEFAULT_CHAIN_ID)}
        >
          <div className={`w-2 h-2 rounded-full ${
            isNetworkSupported(currentChainId) ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span>{getNetworkName(currentChainId)}</span>
        </button>
        
        {/* Network dropdown could be added here */}
      </div>
    </div>
  );
};

export default NetworkSwitcher;
