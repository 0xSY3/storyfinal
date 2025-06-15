"use client"

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import { storyAeneidTestnet } from '../config/tomoConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

interface WalletConnectionValidatorProps {
  children: React.ReactNode;
  showConnectionState?: boolean;
}

export function WalletConnectionValidator({ 
  children, 
  showConnectionState = false 
}: WalletConnectionValidatorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only use wagmi hooks after mounting
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { switchChain } = useSwitchChain();

  // Show loading state while mounting
  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
        {children}
      </div>
    );
  }

  const isStoryChain = chain?.id === storyAeneidTestnet.id;
  const isWalletReady = isConnected && address && isStoryChain;

  const handleSwitchToStory = async () => {
    try {
      await switchChain({ chainId: storyAeneidTestnet.id });
    } catch (error) {
      console.error('Failed to switch to Story chain:', error);
    }
  };

  const handleConnectWallet = () => {
    const tomoConnector = connectors.find(c => c.name.toLowerCase().includes('tomo'));
    if (tomoConnector) {
      connect({ connector: tomoConnector });
    } else {
      connect({ connector: connectors[0] });
    }
  };

  // Show connection state if requested
  if (showConnectionState) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isWalletReady ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
              Wallet Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Connected:</span>
              <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Yes' : 'No'}
              </span>
            </div>

            {/* Address */}
            {isConnected && address && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Address:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </code>
              </div>
            )}

            {/* Network */}
            <div className="flex items-center justify-between">
              <span className="text-sm">Network:</span>
              <span className={`text-sm font-medium ${isStoryChain ? 'text-green-600' : 'text-orange-600'}`}>
                {chain?.name || 'Unknown'} ({chain?.id || 'N/A'})
              </span>
            </div>

            {/* Actions */}
            <div className="pt-2 space-y-2">
              {!isConnected && (
                <Button onClick={handleConnectWallet} className="w-full">
                  Connect Wallet
                </Button>
              )}
              
              {isConnected && !isStoryChain && (
                <Button onClick={handleSwitchToStory} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Switch to Story Aeneid Testnet
                </Button>
              )}

              {isWalletReady && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Ready for Story Protocol transactions!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
        {children}
      </div>
    );
  }

  // For non-display mode, just validate and show errors
  if (!isWalletReady) {
    return (
      <div className="space-y-4">
        {!isConnected ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to continue.
              <Button onClick={handleConnectWallet} className="ml-2" size="sm">
                Connect Wallet
              </Button>
            </AlertDescription>
          </Alert>
        ) : !isStoryChain ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please switch to Story Aeneid Testnet to continue.
              <Button onClick={handleSwitchToStory} className="ml-2" size="sm" variant="outline">
                Switch Network
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
        {children}
      </div>
    );
  }

  return <>{children}</>;
}

export default WalletConnectionValidator;