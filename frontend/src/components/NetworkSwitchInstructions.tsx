"use client"

import React from 'react';
import { storyAeneidTestnet } from '../config/tomoConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, Copy } from 'lucide-react';

interface NetworkSwitchInstructionsProps {
  onClose?: () => void;
}

export function NetworkSwitchInstructions({ onClose }: NetworkSwitchInstructionsProps) {
  const [copied, setCopied] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Switch to Story Aeneid Testnet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-orange-700">
          The "unknown account" error means your wallet isn't connected to the correct network. 
          Please add and switch to Story Aeneid Testnet:
        </p>

        <div className="space-y-3 bg-white p-4 rounded-lg border border-orange-200">
          <h4 className="font-medium text-orange-800">Network Configuration:</h4>
          
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium">Network Name:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {storyAeneidTestnet.name}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(storyAeneidTestnet.name, 'name')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">RPC URL:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {storyAeneidTestnet.rpcUrls.default.http[0]}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(storyAeneidTestnet.rpcUrls.default.http[0], 'rpc')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Chain ID:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {storyAeneidTestnet.id}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(storyAeneidTestnet.id.toString(), 'chainId')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Currency Symbol:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {storyAeneidTestnet.nativeCurrency.symbol}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(storyAeneidTestnet.nativeCurrency.symbol, 'symbol')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Block Explorer:</span>
              <div className="flex items-center gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {storyAeneidTestnet.blockExplorers.default.url}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(storyAeneidTestnet.blockExplorers.default.url, 'explorer')}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {copied && (
            <p className="text-xs text-green-600">
              ✅ {copied} copied to clipboard!
            </p>
          )}
        </div>

        <div className="space-y-2 text-sm text-orange-700">
          <p className="font-medium">Steps to add the network:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Open your wallet (Tomo, MetaMask, etc.)</li>
            <li>Go to network settings or "Add Network"</li>
            <li>Enter the configuration details above</li>
            <li>Save and switch to the new network</li>
            <li>Refresh this page</li>
          </ol>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(storyAeneidTestnet.blockExplorers.default.url, '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View Explorer
          </Button>
          
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default NetworkSwitchInstructions;