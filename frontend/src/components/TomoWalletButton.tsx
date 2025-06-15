"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  LogOut,
  CheckCircle,
  ExternalLink,
  User
} from 'lucide-react';
import TomoIcon from './icons/TomoIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import { cn } from '@/lib/utils';

const TomoWalletButton: React.FC = () => {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();
  
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

  if (!isConnected) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={openConnectModal}
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
          size="sm"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Tomo
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="bg-white border-green-200 hover:border-green-300 hover:bg-green-50 shadow-lg h-10 px-4"
          size="default"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <TomoIcon className="w-5 h-5 text-green-600" size={20} />
            <span className="text-sm text-gray-900 font-medium">Connected</span>
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
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Tomo Wallet</h3>
                      <p className="text-xs text-gray-600">Connected</p>
                    </div>
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
                        disconnect();
                        setIsOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Disconnect Wallet
                    </Button>
                  </div>

                  {/* Tomo Features */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Platform Access</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Upload digital content</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Manage your portfolio</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Web3 experience</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TomoWalletButton;