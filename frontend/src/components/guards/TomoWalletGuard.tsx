"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@tomo-inc/tomo-evm-kit';
import { 
  Wallet, 
  ArrowRight, 
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TomoWalletGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  showConnectPrompt?: boolean;
}

const TomoWalletGuard: React.FC<TomoWalletGuardProps> = ({
  children,
  redirectTo = '/landing',
  showConnectPrompt = true
}) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { openConnectModal } = useConnectModal();

  // Safe hook usage with mounted state
  let address, isConnected, connector;
  try {
    const accountData = useAccount();
    address = accountData.address;
    isConnected = accountData.isConnected;
    connector = accountData.connector;
  } catch (error) {
    address = undefined;
    isConnected = false;
    connector = undefined;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to landing if no wallet connected and redirect is enabled
  useEffect(() => {
    if (mounted && !isConnected && !showConnectPrompt) {
      router.push(redirectTo);
    }
  }, [mounted, isConnected, redirectTo, showConnectPrompt, router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // If wallet is connected, show the protected content
  if (isConnected && address) {
    return <>{children}</>;
  }

  // If showConnectPrompt is false, don't show anything (let redirect handle it)
  if (!showConnectPrompt) {
    return null;
  }

  // Show connection prompt
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6">
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
              className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-slate-800 mb-3"
            >
              Tomo Wallet Required
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-600 mb-8 leading-relaxed"
            >
              Connect your Tomo wallet to access the platform. Upload content, view your digital assets, 
              and manage your creative portfolio - all powered by Web3 technology.
            </motion.p>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 mb-8"
            >
              {[
                'Upload and manage digital content',
                'View your creative portfolio',
                'Access your personal dashboard',
                'Experience Web3 technology'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </motion.div>

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
                  onClick={openConnectModal}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Wallet className="mr-3 w-5 h-5" />
                  Connect Tomo Wallet
                  <ArrowRight className="ml-3 w-5 h-5" />
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
                  Back to Landing Page
                </Button>
              </motion.div>
            </div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">New to Tomo?</p>
                  <p>Tomo wallet supports social logins, email connections, and traditional crypto wallets. Choose the option that works best for you!</p>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TomoWalletGuard;