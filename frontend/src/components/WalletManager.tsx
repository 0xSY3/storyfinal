"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  LogOut,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import { storyAeneidTestnet } from '../config/tomoConfig';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import TomoIcon from "./icons/TomoIcon";
import { cn } from "@/lib/utils";

interface WalletManagerProps {
  onWalletConnected: (address: string) => void;
  onStoryChainConnected: (connected: boolean) => void;
}

const WalletManager: React.FC<WalletManagerProps> = ({
  onWalletConnected,
  onStoryChainConnected,
}) => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { openConnectModal } = useConnectModal();

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isStoryChain = chain?.id === storyAeneidTestnet.id;

  useEffect(() => {
    if (isConnected && address) {
      onWalletConnected(address);
      onStoryChainConnected(isStoryChain);
    } else {
      onWalletConnected("");
      onStoryChainConnected(false);
    }
  }, [address, isConnected, isStoryChain, onWalletConnected, onStoryChainConnected]);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;

  const handleDisconnect = async () => {
    await disconnect();
    await new Promise((resolve) => setTimeout(resolve, 0));
    onWalletConnected("");
    onStoryChainConnected(false);
    setIsOpen(false);
  };

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (!isConnected || !address) {
    return (
      <div className="relative">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={openConnectModal}
            className="bg-green-600 hover:bg-green-700 text-white glass-effect"
            size="sm"
          >
            <Wallet className="w-4 h-4 mr-2 text-white" />
            <span className="text-white">Connect Wallet</span>
          </Button>
        </motion.div>
        {error && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 text-red-800 text-xs rounded-lg border border-red-200">
            {error}
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
            "glass-effect border-green-200 hover:border-green-300 hover:bg-green-50",
            isStoryChain ? "border-green-500 bg-green-50" : ""
          )}
          size="sm"
        >
          <div className="flex items-center gap-2">
            <TomoIcon size={16} className="text-green-600" />
            <span className="font-mono text-sm text-gray-900">{formatAddress(address)}</span>
            {isStoryChain && (
              <Badge className="bg-green-100 text-green-800 text-xs px-1">
                Story
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
              <Card className="w-80 shadow-xl border-0 glass-effect bg-white">
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <TomoIcon size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Wallet Connected</h3>
                      <p className="text-xs text-gray-600">Tomo Social Login</p>
                    </div>
                  </div>

                  {/* Network Status */}
                  <div className="py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Network</span>
                      <div className="flex items-center gap-2">
                        {isStoryChain ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">
                              Story Aeneid Testnet
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-700">
                              {chain?.name || "Unknown Network"}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Address</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-gray-900">
                          {formatAddress(address)}
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
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono text-gray-700 break-all">
                      {address}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 space-y-2">
                    {!isStoryChain && (
                      <Button
                        variant="outline"
                        className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                        size="sm"
                        onClick={() => switchChain({ chainId: storyAeneidTestnet.id })}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Switch to Story Network
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      size="sm"
                      onClick={handleDisconnect}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  </div>

                  {/* Tomo Benefits */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TomoIcon size={16} className="text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Tomo Benefits</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Social login enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Auto wallet creation</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Seamless NFT ownership</span>
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

export default WalletManager;