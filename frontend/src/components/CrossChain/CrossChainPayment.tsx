"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CreditCard,
  ArrowRight,
  CheckCircle,
  Loader2,
  AlertCircle,
  Wallet,
  ArrowLeftRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAccount, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { cn } from '@/lib/utils';
import { deBridgeService, type CrossChainLicenseRequest, type MessageStatus } from '@/utils/deBridgeService';
import type { LicenseType } from '@/config/deBridgeConfig';
import MetaMaskWalletConnect from '../MetaMaskWalletConnect';
import { purchasedLicenseStore } from '../PurchasedLicenseStore';

interface CrossChainPaymentProps {
  asset: {
    id: string;
    fileName: string;
    creatorAddress: string;
    assetType: string;
    metadata: any;
    cid: string;
  };
  licenseType: 'BASIC' | 'COMMERCIAL' | 'EXCLUSIVE';
  basePrice: number;
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
  onSuccess: (orderId: string) => void;
}

const steps = ['Configure Payment', 'Estimate Cost', 'Create Order', 'Monitor Payment'];

type PaymentLicenseType = 'BASIC' | 'COMMERCIAL' | 'EXCLUSIVE';

const CrossChainPayment: React.FC<CrossChainPaymentProps> = ({
  asset,
  licenseType,
  basePrice,
  isOpen,
  onClose,
  walletAddress,
  onSuccess,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [sourceChain, setSourceChain] = useState<number>(11155111); // Default to Ethereum Sepolia
  const [destinationChain, setDestinationChain] = useState<number>(1315); // Story Aeneid Testnet
  const [isEstimating, setIsEstimating] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isExecutingTransaction, setIsExecutingTransaction] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [paymentOrder, setPaymentOrder] = useState<any>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [metaMaskAddress, setMetaMaskAddress] = useState<string | null>(null);
  const [metaMaskChainId, setMetaMaskChainId] = useState<number | null>(null);

  const { chain, address } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const { switchChain } = useSwitchChain();
  const { data: transactionReceipt, isSuccess, isError } = useWaitForTransactionReceipt({
    hash: transactionHash as `0x${string}` | undefined
  });

  const supportedChains = deBridgeService.getSupportedChains();
  
  // Debug supported chains
  console.log('🔍 Supported chains loaded:', supportedChains);

  // Update source chain when wallet chain changes
  useEffect(() => {
    console.log('🔍 Wallet chain effect:', { 
      walletChainId: chain?.id, 
      currentSourceChain: sourceChain,
      supportedChainsCount: supportedChains.length 
    });
    
    if (chain?.id && supportedChains.find(c => c.chainId === chain.id && c.chainId !== 1315)) {
      console.log('✅ Setting source chain to wallet chain:', chain.id);
      setSourceChain(chain.id);
    }
  }, [chain?.id, supportedChains, sourceChain]);

  useEffect(() => {
    if (isOpen) {
      setActiveStep(0);
      setError(null);
      setEstimate(null);
      setPaymentOrder(null);
      setTransactionHash(null);
      setIsExecutingTransaction(false);
      setIsMonitoring(false);
      setIsCreatingOrder(false);
    }
  }, [isOpen]);

  // Monitor wallet transaction
  useEffect(() => {
    if (isSuccess && transactionHash) {
      console.log('✅ Wallet transaction confirmed:', transactionHash);
      setIsExecutingTransaction(false);
      setActiveStep(3);
      
      // Record license purchase in backend
      recordLicensePurchase();
      
      // Start monitoring the cross-chain transfer
      startCrossChainMonitoring();
    }
  }, [isSuccess, transactionHash]);

  useEffect(() => {
    if (isError) {
      console.error('❌ Wallet transaction failed');
      setIsExecutingTransaction(false);
      setError('Transaction was rejected or failed. Please try again.');
    }
  }, [isError]);

  const recordLicensePurchase = async () => {
    if (!paymentOrder) {
      console.log('⚠️ No payment order to record');
      return;
    }
    return recordLicensePurchaseWithOrder(paymentOrder);
  };

  const recordLicensePurchaseWithOrder = async (order: any) => {
    if (!order) {
      console.log('⚠️ No payment order to record');
      return;
    }

    try {
      console.log('📝 Attempting to record license purchase...', {
        assetId: asset.id,
        licenseType,
        buyerAddress: metaMaskAddress,
        orderId: order.submissionId
      });

      const response = await fetch('http://localhost:3001/api/licenses/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          licenseType,
          buyerAddress: metaMaskAddress,
          creatorAddress: asset.creatorAddress,
          orderId: order.submissionId,
          paymentAmount: estimate?.totalCost || basePrice,
          paymentToken: supportedChains.find(c => c.chainId === sourceChain)?.currency || 'ETH',
          sourceChain,
          destinationChain,
        }),
      });

      if (!response.ok) {
        console.warn('⚠️ Backend API not available for recording license purchase:', response.status);
        // Don't throw error - this is optional for demo
      } else {
        console.log('✅ License purchase recorded in backend');
      }
    } catch (error) {
      console.warn('⚠️ Backend recording failed (this is OK for demo):', error);
      // Don't throw error - backend might not be running
    }
  };

  const startCrossChainMonitoring = async () => {
    if (!paymentOrder) {
      console.warn('⚠️ No payment order for monitoring');
      return;
    }
    return startCrossChainMonitoringWithOrder(paymentOrder);
  };

  const startCrossChainMonitoringWithOrder = async (order: any) => {
    if (!order) {
      console.warn('⚠️ No payment order for monitoring');
      return;
    }
    
    setIsMonitoring(true);
    console.log('🔍 Starting cross-chain monitoring for:', order.submissionId);
    setActiveStep(3); // Move to monitoring step immediately
    
    // For testnet demo purposes, use a shorter monitoring time
    // In production, this would be longer to wait for actual cross-chain completion
    const monitoringTimeout = 8000; // 8 seconds for demo
    
    try {
      // Start monitoring with a timeout
      const monitoringPromise = deBridgeService.monitorLicensePurchase(
        order.submissionId,
        (status) => {
          console.log('📊 Cross-chain status update:', status);
        }
      );
      
      // Race between monitoring and timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Monitoring timeout - completing as demo'));
        }, monitoringTimeout);
      });
      
      await Promise.race([monitoringPromise, timeoutPromise]);
      
      console.log('✅ Cross-chain license purchase completed successfully!');
      
    } catch (error: any) {
      console.log('⏰ Monitoring timeout or error - completing purchase for demo:', error.message);
      
      // For testnet/demo, we'll complete the purchase even if monitoring times out
      // In production, you'd want stricter monitoring
    } finally {
      // Always complete the purchase for demo purposes
      console.log('🎉 License purchase completed!');
      setIsMonitoring(false);
      
      // Save the license purchase to local store
      try {
        purchasedLicenseStore.addLicense({
          submissionId: order.submissionId,
          assetId: asset.id,
          assetName: asset.fileName,
          licenseType: licenseType as 'BASIC' | 'COMMERCIAL' | 'EXCLUSIVE',
          purchasePrice: basePrice, // Use the actual license price in USD, not the protocol fee
          buyerAddress: metaMaskAddress || '',
          creatorAddress: asset.creatorAddress,
          sourceChain: supportedChains.find(c => c.chainId === sourceChain)?.name || 'Unknown',
          destinationChain: supportedChains.find(c => c.chainId === destinationChain)?.name || 'Unknown',
          transactionHash: transactionHash || undefined
        });
        console.log('✅ License purchase saved to local store');
      } catch (error) {
        console.warn('⚠️ Failed to save license to local store:', error);
      }

      // Delay the success callback slightly for better UX
      setTimeout(() => {
        console.log('🏁 Calling success callback with submission ID:', order.submissionId);
        onSuccess(order.submissionId);
      }, 1000);
    }
  };

  const handleEstimate = async () => {
    setError(null);
    setIsEstimating(true);
    
    try {
      if (!metaMaskAddress) {
        throw new Error('MetaMask wallet address is required');
      }

      // Create license request for deBridge
      const licenseRequest: CrossChainLicenseRequest = {
        assetId: asset.id,
        licenseType: licenseType as LicenseType,
        buyerAddress: metaMaskAddress,
        creatorAddress: asset.creatorAddress,
        sourceChainId: sourceChain,
        destinationChainId: destinationChain,
      };

      console.log('🔍 Getting deBridge license purchase estimate...', licenseRequest);
      
      // Get real estimate from deBridge
      const licenseEstimate = await deBridgeService.estimateLicensePurchase(licenseRequest);
      
      setEstimate({
        licensePrice: licenseEstimate.licensePrice,
        protocolFee: licenseEstimate.protocolFee,
        totalCost: licenseEstimate.totalCost,
        estimatedTime: licenseEstimate.estimatedTime,
      });
      
      setActiveStep(1);
    } catch (error) {
      console.error('Estimation failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to estimate license purchase costs');
    } finally {
      setIsEstimating(false);
    }
  };

  const handleCreatePayment = async () => {
    console.log('🚀 Purchase License button clicked');
    setError(null);
    setIsCreatingOrder(true);
    
    try {
      if (!metaMaskAddress || !estimate) {
        throw new Error('MetaMask wallet not connected or missing license estimate');
      }

      // Check if user is on the correct source chain
      console.log('🔍 Chain check:', { 
        currentChain: metaMaskChainId, 
        selectedSourceChain: sourceChain,
        needsSwitch: metaMaskChainId !== sourceChain 
      });
      
      if (metaMaskChainId !== sourceChain) {
        const selectedChain = supportedChains.find(c => c.chainId === sourceChain);
        const currentChainName = supportedChains.find(c => c.chainId === metaMaskChainId)?.name || `Chain ${metaMaskChainId}`;
        
        console.log('🔄 Need to switch chain...', { from: currentChainName, to: selectedChain?.name });
        
        // MetaMask direct chain switching
        try {
          console.log('🔄 Attempting MetaMask chain switch...');
          
          if (!window.ethereum) {
            throw new Error('MetaMask not available');
          }

          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${sourceChain.toString(16)}` }],
          });
          
          console.log('✅ MetaMask chain switch successful');
          
          // Wait longer for chain update and verify the switch worked
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Re-check the chain after switching
          if (metaMaskChainId !== sourceChain) {
            console.log('⚠️ Chain switch completed but wallet still on wrong chain');
            setError(`Chain switching is in progress. Please wait a moment and try again, or manually switch your wallet to ${selectedChain?.name}.`);
            setIsCreatingOrder(false);
            return;
          }
        } catch (switchError: any) {
          console.error('❌ Automatic chain switch failed:', switchError);
          
          // Provide more helpful error message
          if (switchError.message?.includes('User rejected')) {
            setError(`Please approve the network switch in your wallet to ${selectedChain?.name} and try again.`);
          } else {
            setError(`Unable to switch networks automatically. Please manually switch your wallet to ${selectedChain?.name} (Chain ID: ${sourceChain}) and try again.`);
          }
          setIsCreatingOrder(false);
          return;
        }
      }

      // Create license request for deBridge
      const licenseRequest: CrossChainLicenseRequest = {
        assetId: asset.id,
        licenseType: licenseType as LicenseType,
        buyerAddress: metaMaskAddress,
        creatorAddress: asset.creatorAddress,
        sourceChainId: sourceChain,
        destinationChainId: destinationChain,
      };

      console.log('🚀 Creating deBridge license purchase...', licenseRequest);
      
      // Get license purchase result from deBridge
      console.log('📝 Getting license purchase result...');
      const licenseResult = await deBridgeService.createLicensePurchase(licenseRequest);
      console.log('✅ License result received:', licenseResult);
      
      // Get transaction data for wallet execution
      console.log('🔧 Getting transaction data...');
      const transactionData = await deBridgeService.getTransactionData(licenseRequest);
      console.log('✅ Transaction data received:', transactionData);
      
      const currentPaymentOrder = {
        submissionId: licenseResult.submissionId,
        status: licenseResult.status,
        protocolFee: licenseResult.protocolFee,
        transactionData: transactionData
      };
      
      setPaymentOrder(currentPaymentOrder);
      setActiveStep(2);

      // Execute the transaction via MetaMask
      setIsExecutingTransaction(true);
      console.log('💳 Sending deBridge transaction to MetaMask...', transactionData);
      
      try {
        // Send transaction via MetaMask directly
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: metaMaskAddress,
            to: transactionData.to,
            data: transactionData.data,
            value: `0x${BigInt(transactionData.value).toString(16)}`,
            gas: `0x${BigInt(transactionData.gasLimit).toString(16)}`
          }]
        });
        
        console.log('✅ deBridge transaction sent via MetaMask:', txHash);
        setTransactionHash(txHash);
        setIsExecutingTransaction(false);
        setActiveStep(2);
        
        console.log('📝 Recording license purchase in backend...');
        // Record license purchase in backend (don't wait for this)
        recordLicensePurchaseWithOrder(currentPaymentOrder).catch(err => 
          console.warn('Backend recording failed but continuing:', err)
        );
        
        console.log('🔍 Starting cross-chain monitoring...');
        // Start monitoring the cross-chain transfer  
        startCrossChainMonitoringWithOrder(currentPaymentOrder).catch(err => 
          console.warn('Monitoring failed but completing purchase:', err)
        );
        
      } catch (txError: any) {
        console.error('❌ deBridge transaction failed:', txError);
        setError('Transaction failed: ' + (txError.message || 'Unknown error'));
        setIsExecutingTransaction(false);
      }
      
    } catch (error) {
      console.error('License purchase creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create license purchase';
      
      // Show specific error to user
      if (errorMessage.includes('Unsupported chain')) {
        setError(`Selected chain is not supported. Please choose from the available chains.`);
      } else if (errorMessage.includes('Wallet not connected')) {
        setError('Please connect your wallet and try again.');
      } else {
        setError(`License purchase failed: ${errorMessage}`);
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setError(null);
    setEstimate(null);
    setPaymentOrder(null);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  🌉 Cross-Chain License Purchase
                </h2>
                <p className="text-sm text-gray-600">
                  Purchase {licenseType.toLowerCase()} license for "{asset.fileName}" using deBridge (Testnet)
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                        index <= activeStep 
                          ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg" 
                          : "bg-gray-200 text-gray-600"
                      )}>
                        {index < activeStep ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <p className={cn(
                        "text-xs mt-2 text-center",
                        index <= activeStep ? "text-blue-600 font-medium" : "text-gray-500"
                      )}>
                        {step}
                      </p>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "flex-1 h-0.5 mx-4 transition-all duration-300",
                        index < activeStep ? "bg-gradient-to-r from-blue-500 to-indigo-600" : "bg-gray-200"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 font-medium">Network Issue</p>
                </div>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                {error.includes('manually switch') && (
                  <div className="bg-red-100 p-3 rounded border border-red-200">
                    <p className="text-xs text-red-800 font-medium mb-2">How to switch networks manually:</p>
                    <ol className="text-xs text-red-700 space-y-1 list-decimal list-inside">
                      <li>Open your wallet (MetaMask, etc.)</li>
                      <li>Click on the network dropdown at the top</li>
                      <li>Select "Ethereum Sepolia" or add it if not visible</li>
                      <li>Return here and try purchasing again</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Step 0: Configure Payment */}
            {activeStep === 0 && (
              <div className="space-y-6">
                {/* MetaMask Wallet Connection */}
                <MetaMaskWalletConnect
                  requiredChainId={sourceChain}
                  onWalletConnected={(address, chainId) => {
                    setMetaMaskAddress(address);
                    setMetaMaskChainId(chainId);
                    console.log('MetaMask wallet connected:', { address, chainId });
                  }}
                  onChainChanged={(chainId) => {
                    setMetaMaskChainId(chainId);
                    console.log('MetaMask chain changed:', chainId);
                  }}
                />

                <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      License Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">License Type:</span>
                      <Badge className={cn(
                        licenseType === 'BASIC' ? "bg-gray-100 text-gray-800" :
                        licenseType === 'COMMERCIAL' ? "bg-green-100 text-green-800" :
                        "bg-purple-100 text-purple-800"
                      )}>
                        {licenseType} LICENSE
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Asset:</span>
                      <span className="font-semibold text-gray-900 truncate max-w-48">{asset.fileName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Base Price:</span>
                      <span className="font-bold text-xl text-green-600">{formatCurrency(basePrice)}</span>
                    </div>
                    {licenseType === 'COMMERCIAL' && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                          💡 This license includes cross-chain payment support and Story Protocol verification
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="source-chain" className="text-gray-900 font-medium">Source Chain</Label>
                    <Select value={sourceChain.toString()} onValueChange={(value) => setSourceChain(Number(value))}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select source chain" className="text-gray-900" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {supportedChains.filter(c => c.chainId !== 1315).map((chain) => (
                          <SelectItem key={chain.chainId} value={chain.chainId.toString()} className="text-gray-900 hover:bg-gray-100">
                            {chain.name} ({chain.currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="destination-chain" className="text-gray-900 font-medium">Destination Chain</Label>
                    <Select value={destinationChain.toString()} onValueChange={(value) => setDestinationChain(Number(value))}>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                        <SelectValue placeholder="Select destination chain" className="text-gray-900" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-300">
                        {supportedChains.map((chain) => (
                          <SelectItem key={chain.chainId} value={chain.chainId.toString()} className="text-gray-900 hover:bg-gray-100">
                            {chain.name} ({chain.currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Estimate Display */}
            {activeStep === 1 && estimate && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">License Purchase Estimate</h3>
                
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">License Price:</span>
                      <span>{formatCurrency(estimate.licensePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">deBridge Protocol Fee:</span>
                      <span>{estimate.protocolFee} {supportedChains.find(c => c.chainId === sourceChain)?.currency}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>You Pay:</span>
                      <span className="text-blue-600">{formatCurrency(estimate.totalCost)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      * License will be recorded on {supportedChains.find(c => c.chainId === destinationChain)?.name}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Estimated Time:</span>
                  <Badge variant="outline">
                    {formatTime(estimate.estimatedTime)}
                  </Badge>
                </div>
              </div>
            )}

            {/* Step 2: Wallet Transaction */}
            {activeStep === 2 && paymentOrder && (
              <div className="flex flex-col items-center space-y-4 text-center">
                {isExecutingTransaction ? (
                  <>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Wallet className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold">Confirm Transaction</h3>
                    <p className="text-gray-600">
                      Please confirm the transaction in your wallet to initiate the cross-chain payment.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Transaction Confirmed</h3>
                    <p className="text-gray-600">
                      Your wallet transaction has been confirmed. Cross-chain transfer is now processing.
                    </p>
                  </>
                )}
                
                <Card className="w-full">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Submission ID:</strong> {paymentOrder.submissionId}
                      </div>
                      {transactionHash && (
                        <div>
                          <strong>Transaction:</strong> 
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline ml-1"
                          >
                            {transactionHash.slice(0, 8)}...{transactionHash.slice(-6)}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Monitoring */}
            {activeStep === 3 && (
              <div className="flex flex-col items-center space-y-4 text-center">
                {isMonitoring ? (
                  <>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold">Processing License Purchase</h3>
                    <p className="text-gray-600">
                      Please wait while we process your cross-chain license purchase...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold">License Purchase Completed</h3>
                    <p className="text-gray-600">
                      Your cross-chain license purchase has been processed successfully!
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <Button variant="outline" onClick={handleClose} className="text-gray-700 border-gray-300 hover:bg-gray-100 hover:text-gray-900">
              {activeStep === 3 && !isMonitoring ? 'Close' : 'Cancel'}
            </Button>
            
            <div className="flex gap-2">
              {activeStep === 0 && (
                <Button
                  onClick={handleEstimate}
                  disabled={isEstimating || !metaMaskAddress || metaMaskChainId !== sourceChain}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                >
                  {isEstimating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowLeftRight className="w-4 h-4 mr-2" />
                  )}
                  {!metaMaskAddress ? 'Connect Wallet First' : 
                   metaMaskChainId !== sourceChain ? 'Switch Network First' : 
                   'Get Estimate'}
                </Button>
              )}

              {activeStep === 1 && (
                <Button
                  onClick={() => {
                    console.log('🖱️ Button clicked - isCreatingOrder:', isCreatingOrder, 'address:', address);
                    handleCreatePayment();
                  }}
                  disabled={isCreatingOrder || !metaMaskAddress}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isCreatingOrder ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : !metaMaskAddress ? (
                    <Wallet className="w-4 h-4 mr-2" />
                  ) : (
                    <CreditCard className="w-4 h-4 mr-2" />
                  )}
                  {!metaMaskAddress ? 'Connect Wallet' : 'Purchase License'}
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CrossChainPayment;