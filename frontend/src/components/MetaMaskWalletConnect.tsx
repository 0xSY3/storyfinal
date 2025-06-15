"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  ArrowLeftRight,
  Info
} from 'lucide-react';

// Extend window object for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface MetaMaskWalletConnectProps {
  requiredChainId?: number;
  onWalletConnected: (address: string, chainId: number) => void;
  onChainChanged?: (chainId: number) => void;
}

const SUPPORTED_CHAINS = {
  11155111: {
    name: 'Ethereum Sepolia',
    currency: 'ETH',
    rpcUrl: 'https://sepolia.llamarpc.com',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  421614: {
    name: 'Arbitrum Sepolia',
    currency: 'ETH',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    blockExplorer: 'https://sepolia.arbiscan.io'
  },
  80002: {
    name: 'Polygon Amoy',
    currency: 'MATIC',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com'
  },
  1315: {
    name: 'Story Aeneid Testnet',
    currency: 'IP',
    rpcUrl: 'https://aeneid.storyrpc.io',
    blockExplorer: 'https://aeneid.storyscan.io'
  }
};

const MetaMaskWalletConnect: React.FC<MetaMaskWalletConnectProps> = ({
  requiredChainId,
  onWalletConnected,
  onChainChanged
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Notify parent when wallet state changes
  useEffect(() => {
    if (isConnected && address && chainId) {
      onWalletConnected(address, chainId);
    }
  }, [isConnected, address, chainId, onWalletConnected]);

  const checkWalletConnection = async () => {
    if (!window.ethereum) return;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        setChainId(parseInt(currentChainId, 16));
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress(null);
      setChainId(null);
    } else {
      setAddress(accounts[0]);
      if (chainId) {
        onWalletConnected(accounts[0], chainId);
      }
    }
  };

  const handleChainChanged = (newChainId: string) => {
    const parsedChainId = parseInt(newChainId, 16);
    setChainId(parsedChainId);
    if (onChainChanged) {
      onChainChanged(parsedChainId);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setError('MetaMask is not installed. Please install MetaMask to use cross-chain payments.');
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

      setIsConnected(true);
      setAddress(accounts[0]);
      setChainId(parseInt(currentChainId, 16));
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      setError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const switchToChain = async (targetChainId: number) => {
    if (!window.ethereum) return;

    setIsSwitching(true);
    setError(null);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // If the chain hasn't been added to MetaMask, add it
      if (switchError.code === 4902) {
        try {
          const chainInfo = SUPPORTED_CHAINS[targetChainId as keyof typeof SUPPORTED_CHAINS];
          if (chainInfo) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: chainInfo.name,
                nativeCurrency: {
                  name: chainInfo.currency,
                  symbol: chainInfo.currency,
                  decimals: 18,
                },
                rpcUrls: [chainInfo.rpcUrl],
                blockExplorerUrls: [chainInfo.blockExplorer],
              }],
            });
          }
        } catch (addError) {
          console.error('Failed to add chain:', addError);
          setError(`Failed to add ${SUPPORTED_CHAINS[targetChainId as keyof typeof SUPPORTED_CHAINS]?.name} to your wallet.`);
        }
      } else {
        console.error('Failed to switch chain:', switchError);
        setError('Failed to switch network. Please switch manually in your wallet.');
      }
    } finally {
      setIsSwitching(false);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const currentChain = chainId ? SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS] : null;
  const isOnRequiredChain = !requiredChainId || chainId === requiredChainId;
  const requiredChain = requiredChainId ? SUPPORTED_CHAINS[requiredChainId as keyof typeof SUPPORTED_CHAINS] : null;

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        {/* Info Banner */}
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Cross-Chain Payment Wallet</p>
            <p className="text-xs">This wallet connection is specifically for deBridge cross-chain payments. Your main wallet connection remains separate.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!isConnected ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect MetaMask for Cross-Chain Payments</h3>
            <p className="text-gray-600 text-sm mb-4">
              Connect your MetaMask wallet to enable cross-chain license purchasing via deBridge
            </p>
            <Button
              onClick={connectWallet}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isConnecting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Connect MetaMask
                </div>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Wallet Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">MetaMask Connected</p>
                  <p className="text-sm text-gray-600 font-mono">{formatAddress(address!)}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>

            {/* Network Status */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Current Network:</span>
                  <Badge variant={isOnRequiredChain ? "default" : "destructive"}>
                    {currentChain?.name || `Chain ${chainId}`}
                  </Badge>
                </div>
                {currentChain && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(currentChain.blockExplorer, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Explorer
                  </Button>
                )}
              </div>

              {/* Chain Switch Warning */}
              {!isOnRequiredChain && requiredChain && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">Network Switch Required</span>
                  </div>
                  <p className="text-xs text-amber-800 mb-3">
                    Please switch to {requiredChain.name} to continue with the cross-chain payment.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => switchToChain(requiredChainId!)}
                    disabled={isSwitching}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {isSwitching ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Switching...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ArrowLeftRight className="w-3 h-3" />
                        Switch to {requiredChain.name}
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MetaMaskWalletConnect;