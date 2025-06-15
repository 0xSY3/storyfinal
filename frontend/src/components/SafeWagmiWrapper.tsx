"use client"

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface SafeWagmiWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SafeWagmiWrapper({ children, fallback }: SafeWagmiWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [hasWagmiError, setHasWagmiError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
        {fallback}
      </div>
    );
  }

  // Error boundary for wagmi context issues
  if (hasWagmiError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Wallet connection not available. Please make sure you're within the WagmiProvider context.
          </AlertDescription>
        </Alert>
        {fallback}
      </div>
    );
  }

  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Wagmi context error:', error);
    setHasWagmiError(true);
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load wallet connection. {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
        {fallback}
      </div>
    );
  }
}

export default SafeWagmiWrapper;