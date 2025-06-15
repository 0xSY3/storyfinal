"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Extend window object for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetaMaskContextType {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider');
  }
  return context;
};

interface MetaMaskProviderProps {
  children: ReactNode;
}

export const MetaMaskProvider: React.FC<MetaMaskProviderProps> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && window.ethereum && window.ethereum.isMetaMask;
  };

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();

    if (isMetaMaskInstalled()) {
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      // Listen for chain changes
      window.ethereum.on('chainChanged', handleChainChanged);
      // Listen for disconnect
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (!isMetaMaskInstalled()) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setChainId(parseInt(currentChainId, 16));
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // Disconnected
      setAddress(null);
      setIsConnected(false);
      setError(null);
    } else {
      // Account changed
      setAddress(accounts[0]);
      setIsConnected(true);
      setError(null);
    }
  };

  const handleChainChanged = (newChainId: string) => {
    setChainId(parseInt(newChainId, 16));
    setError(null);
  };

  const handleDisconnect = () => {
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const currentChainId = await window.ethereum.request({
        method: 'eth_chainId'
      });

      setAddress(accounts[0]);
      setChainId(parseInt(currentChainId, 16));
      setIsConnected(true);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      if (error.code === 4001) {
        setError('Connection rejected by user.');
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);
  };

  const switchChain = async (targetChainId: number) => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If the chain hasn't been added to MetaMask, this error code will be thrown
      if (switchError.code === 4902) {
        throw new Error('Chain not added to MetaMask');
      } else {
        throw switchError;
      }
    }
  };

  const value: MetaMaskContextType = {
    address,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchChain,
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
};