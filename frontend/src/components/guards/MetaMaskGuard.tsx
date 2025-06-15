"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  ArrowRight, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMetaMask } from '../MetaMaskProvider';

interface MetaMaskGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  showConnectPrompt?: boolean;
}

const MetaMaskGuard: React.FC<MetaMaskGuardProps> = ({
  children,
  redirectTo = '/dashboard',
  showConnectPrompt = true
}) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { address, isConnected, connectWallet, isConnecting, error } = useMetaMask();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if no wallet connected and redirect is enabled
  useEffect(() => {
    if (mounted && !isConnected && !showConnectPrompt) {
      router.push(redirectTo);
    }
  }, [mounted, isConnected, redirectTo, showConnectPrompt, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // If MetaMask is connected, show the protected content
  if (isConnected && address) {
    return <>{children}</>;
  }

  // If showConnectPrompt is false, don't show anything (let redirect handle it)
  if (!showConnectPrompt) {
    return null;
  }

  // Show MetaMask connection prompt
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <CreditCard className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-slate-800 mb-3"
            >
              MetaMask Required
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-600 mb-8 leading-relaxed"
            >
              License purchases require MetaMask for secure cross-chain payments. 
              MetaMask provides direct blockchain access and full transaction control.
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-8"
            >
              {[
                'Secure cryptocurrency payments',
                'Cross-chain transactions via DeBridge',
                'Full wallet control',
                'Direct blockchain interaction'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Connection Error</p>
                    <p>{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Wallet className="mr-3 w-5 h-5" />
                      Connect MetaMask
                      <ArrowRight className="ml-3 w-5 h-5" />
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => router.push(redirectTo)}
                  variant="outline"
                  className="w-full py-3 text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  Back to Dashboard
                </Button>
              </motion.div>
            </div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium mb-1">Don't have MetaMask?</p>
                  <div className="flex items-center gap-1">
                    <span>Download it from</span>
                    <a 
                      href="https://metamask.io" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium hover:underline inline-flex items-center gap-1"
                    >
                      metamask.io
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default MetaMaskGuard;