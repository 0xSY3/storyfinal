"use client"

import React from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { storyAeneidTestnet } from '../config/tomoConfig';
import { validateBasicWalletState, getNetworkSwitchInstructions } from '../utils/walletValidator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Wifi, WifiOff, Wallet } from 'lucide-react';

export function WalletConnectionChecker() {
  const { address, chain, connector, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const validation = validateBasicWalletState(address, chain?.id, isConnected);
  const isStoryChain = chain?.id === storyAeneidTestnet.id;
  
  const [balance, setBalance] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    async function checkBalance() {
      if (isConnected && address && publicClient && isStoryChain) {
        try {
          const bal = await publicClient.getBalance({
            address: address as `0x${string}`,
          });
          const balanceInEth = Number(bal) / 1e18;
          setBalance(balanceInEth.toFixed(6));
        } catch (error) {
          console.warn('Could not fetch balance:', error);
          setBalance('Unknown');
        }
      }
    }
    
    checkBalance();
  }, [isConnected, address, publicClient, isStoryChain]);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Connection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection:</span>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <Badge variant="destructive">Disconnected</Badge>
                </>
              )}
            </div>
          </div>

          {/* Wallet Info */}
          {isConnected && address && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Wallet:</span>
                <Badge variant="outline">{connector?.name || 'Unknown'}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Address:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {`${address.slice(0, 6)}...${address.slice(-4)}`}
                </code>
              </div>
            </>
          )}

          {/* Network Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Network:</span>
            <div className="flex items-center gap-2">
              {isStoryChain ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Story Aeneid Testnet
                  </Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <Badge variant="secondary">
                    {chain?.name || 'Unknown'} ({chain?.id || 'No ID'})
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Balance */}
          {isConnected && isStoryChain && balance && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">IP Balance:</span>
              <Badge variant="outline">
                {balance} IP
              </Badge>
            </div>
          )}

          {/* Validation Errors */}
          {validation.errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Issues Found:</p>
                  <ul className="mt-1 text-xs text-red-700 space-y-1">
                    {validation.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Network Switch Instructions */}
          {isConnected && !isStoryChain && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <Wifi className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Switch to Story Aeneid Testnet:</p>
                  <div className="mt-2 text-xs text-blue-700 space-y-1">
                    <p><strong>Network Name:</strong> {storyAeneidTestnet.name}</p>
                    <p><strong>RPC URL:</strong> {storyAeneidTestnet.rpcUrls.default.http[0]}</p>
                    <p><strong>Chain ID:</strong> {storyAeneidTestnet.id}</p>
                    <p><strong>Symbol:</strong> {storyAeneidTestnet.nativeCurrency.symbol}</p>
                    <p><strong>Explorer:</strong> {storyAeneidTestnet.blockExplorers.default.url}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {validation.isValid && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">
                  ✅ Ready for Story Protocol transactions!
                </p>
              </div>
            </div>
          )}

          {/* Debug Button */}
          <div className="mt-4 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('🔍 Wallet Debug Info:');
                console.log('Address:', address);
                console.log('Chain:', chain);
                console.log('Connector:', connector?.name);
                console.log('Is Connected:', isConnected);
                console.log('Validation:', validation);
                console.log('Balance:', balance);
                
                // Also log to help with debugging
                console.log('Expected Chain ID:', storyAeneidTestnet.id);
                console.log('Current Chain ID:', chain?.id);
                console.log('Story RPC URL:', storyAeneidTestnet.rpcUrls.default.http[0]);
              }}
              className="w-full"
            >
              Debug Wallet Info (Check Console)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WalletConnectionChecker;