"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  LogOut,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useMetaMask } from './MetaMaskProvider';
import { cn } from '@/lib/utils';

const SUPPORTED_CHAINS = {
  1: { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
  11155111: { name: 'Ethereum Sepolia', explorer: 'https://sepolia.etherscan.io' },
  137: { name: 'Polygon', explorer: 'https://polygonscan.com' },
  80002: { name: 'Polygon Amoy', explorer: 'https://amoy.polygonscan.com' },
  421614: { name: 'Arbitrum Sepolia', explorer: 'https://sepolia.arbiscan.io' },
  1315: { name: 'Story Aeneid Testnet', explorer: 'https://aeneid.storyscan.io' }
};

const MetaMaskWalletButton: React.FC = () => {
  const { 
    address, 
    chainId, 
    isConnected, 
    isConnecting, 
    error, 
    connectWallet, 
    disconnectWallet 
  } = useMetaMask();
  
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentChain = chainId ? SUPPORTED_CHAINS[chainId as keyof typeof SUPPORTED_CHAINS] : null;

  if (!isConnected) {
    return (
      <div className="relative">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
            size="sm"
          >
            {isConnecting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </div>
            )}
          </Button>
        </motion.div>
        
        {error && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg shadow-lg max-w-xs z-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className={cn(
            "bg-white border-orange-200 hover:border-orange-300 hover:bg-orange-50 shadow-lg",
            currentChain ? "border-green-300 bg-green-50" : "border-orange-300"
          )}
          size="sm"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-mono text-sm text-gray-900">{formatAddress(address!)}</span>
            {currentChain && (
              <Badge className="bg-green-100 text-green-800 text-xs px-1">
                {currentChain.name.split(' ')[0]}
              </Badge>
            )}
            <ChevronDown className={cn(
              "w-4 h-4 text-gray-700 transition-transform duration-200",
              isOpen ? "rotate-180" : ""
            )} />
          </div>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 z-50"
            >
              <Card className="w-80 shadow-xl border-0 bg-white">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">MetaMask Wallet</h3>
                      <p className="text-xs text-gray-600">Connected</p>
                    </div>
                  </div>

                  {/* Network Status */}
                  <div className="py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Network</span>
                      <div className="flex items-center gap-2">
                        {currentChain ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">
                              {currentChain.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-700">
                              Chain {chainId}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {currentChain && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(currentChain.explorer, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View on Explorer
                      </Button>
                    )}
                  </div>

                  {/* Address */}
                  <div className="py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Address</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">
                          {formatAddress(address!)}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={copyAddress}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </motion.button>
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 rounded text-xs font-mono text-gray-700 break-all">
                      {address}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      size="sm"
                      onClick={() => {
                        disconnectWallet();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  </div>

                  {/* MetaMask Benefits */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">MetaMask Features</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Cross-chain payments enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Direct blockchain access</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Full wallet control</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {error && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 text-red-800 text-xs rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default MetaMaskWalletButton;