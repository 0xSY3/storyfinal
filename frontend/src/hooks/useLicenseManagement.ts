import React, { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';

export interface License {
  licenseId: string;
  assetId: string;
  licenseType: 'BASIC' | 'COMMERCIAL' | 'EXCLUSIVE' | 'CUSTOM';
  buyerAddress: string;
  creatorAddress: string;
  orderId: string;
  paymentAmount: number;
  paymentToken: string;
  sourceChain: number;
  destinationChain: number;
  status: 'pending' | 'confirmed' | 'failed';
  purchasedAt: string;
  confirmedAt?: string;
  transactionHash?: string;
  asset?: {
    fileName: string;
    assetType: string;
    metadata: any;
    cid: string;
  };
}

export interface LicenseAnalytics {
  totalRevenue: number;
  totalSales: number;
  averageSalePrice: number;
  licenseTypeBreakdown: {
    BASIC: number;
    COMMERCIAL: number;
    EXCLUSIVE: number;
    CUSTOM: number;
  };
  monthlyData: Array<{
    month: string;
    sales: number;
    revenue: number;
  }>;
  totalAssets: number;
}

export interface UseLicenseManagementState {
  userLicenses: License[];
  assetLicenses: License[];
  analytics: LicenseAnalytics | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseLicenseManagementActions {
  getUserLicenses: (address?: string, filters?: {
    status?: string;
    assetType?: string;
    limit?: number;
    offset?: number;
  }) => Promise<License[]>;
  
  getAssetLicenses: (assetId: string, options?: {
    limit?: number;
    offset?: number;
  }) => Promise<License[]>;
  
  verifyLicenseOwnership: (assetId: string, userAddress?: string) => Promise<{
    hasLicense: boolean;
    licenses: License[];
    highestLicense: License | null;
  }>;
  
  getLicenseAnalytics: (creatorAddress?: string) => Promise<LicenseAnalytics>;
  
  recordLicensePurchase: (licenseData: {
    assetId: string;
    licenseType: string;
    creatorAddress: string;
    orderId: string;
    paymentAmount: number;
    paymentToken: string;
    sourceChain: number;
    destinationChain: number;
    customPrice?: number;
  }) => Promise<string | null>;
  
  updateLicenseStatus: (licenseId: string, status: string, data?: {
    transactionHash?: string;
    paymentData?: any;
  }) => Promise<boolean>;
  
  clearError: () => void;
}

export type UseLicenseManagementReturn = UseLicenseManagementState & UseLicenseManagementActions;

export function useLicenseManagement(): UseLicenseManagementReturn {
  const { address } = useAccount();
  
  const [state, setState] = useState<UseLicenseManagementState>({
    userLicenses: [],
    assetLicenses: [],
    analytics: null,
    isLoading: false,
    error: null,
  });

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const getUserLicenses = useCallback(async (
    targetAddress?: string,
    filters?: {
      status?: string;
      assetType?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<License[]> => {
    const userAddress = targetAddress || address;
    if (!userAddress) {
      setError('No user address provided');
      return [];
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.assetType) params.append('assetType', filters.assetType);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/licenses/user/${userAddress}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user licenses');
      }

      const data = await response.json();
      const licenses = data.data || [];

      setState(prev => ({ 
        ...prev, 
        userLicenses: licenses,
        isLoading: false 
      }));

      return licenses;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user licenses';
      setError(errorMessage);
      return [];
    }
  }, [address, setError]);

  const getAssetLicenses = useCallback(async (
    assetId: string,
    options?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<License[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/licenses/asset/${assetId}?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch asset licenses');
      }

      const data = await response.json();
      const licenses = data.data || [];

      setState(prev => ({ 
        ...prev, 
        assetLicenses: licenses,
        isLoading: false 
      }));

      return licenses;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch asset licenses';
      setError(errorMessage);
      return [];
    }
  }, [setError]);

  const verifyLicenseOwnership = useCallback(async (
    assetId: string,
    userAddress?: string
  ): Promise<{
    hasLicense: boolean;
    licenses: License[];
    highestLicense: License | null;
  }> => {
    const targetAddress = userAddress || address;
    if (!targetAddress) {
      return { hasLicense: false, licenses: [], highestLicense: null };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/licenses/verify/${assetId}/${targetAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to verify license ownership');
      }

      const data = await response.json();
      return {
        hasLicense: data.hasLicense,
        licenses: data.licenses || [],
        highestLicense: data.highestLicense,
      };

    } catch (error) {
      console.error('License verification failed:', error);
      return { hasLicense: false, licenses: [], highestLicense: null };
    }
  }, [address]);

  const getLicenseAnalytics = useCallback(async (
    creatorAddress?: string
  ): Promise<LicenseAnalytics> => {
    const targetAddress = creatorAddress || address;
    if (!targetAddress) {
      throw new Error('No creator address provided');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/licenses/analytics/${targetAddress}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch license analytics');
      }

      const data = await response.json();
      const analytics = data.analytics;

      setState(prev => ({ 
        ...prev, 
        analytics,
        isLoading: false 
      }));

      return analytics;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch license analytics';
      setError(errorMessage);
      throw error;
    }
  }, [address, setError]);

  const recordLicensePurchase = useCallback(async (licenseData: {
    assetId: string;
    licenseType: string;
    creatorAddress: string;
    orderId: string;
    paymentAmount: number;
    paymentToken: string;
    sourceChain: number;
    destinationChain: number;
    customPrice?: number;
  }): Promise<string | null> => {
    if (!address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/licenses/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...licenseData,
          buyerAddress: address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record license purchase');
      }

      const data = await response.json();
      return data.licenseId;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record license purchase';
      setError(errorMessage);
      return null;
    }
  }, [address, setError]);

  const updateLicenseStatus = useCallback(async (
    licenseId: string,
    status: string,
    data?: {
      transactionHash?: string;
      paymentData?: any;
    }
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/licenses/${licenseId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          ...data,
        }),
      });

      return response.ok;

    } catch (error) {
      console.error('Failed to update license status:', error);
      return false;
    }
  }, []);

  return {
    ...state,
    getUserLicenses,
    getAssetLicenses,
    verifyLicenseOwnership,
    getLicenseAnalytics,
    recordLicensePurchase,
    updateLicenseStatus,
    clearError,
  };
}

// Hook for checking if user has license for a specific asset
export function useLicenseVerification(assetId: string) {
  const { address } = useAccount();
  const [verification, setVerification] = useState<{
    hasLicense: boolean;
    licenses: License[];
    highestLicense: License | null;
    isLoading: boolean;
  }>({
    hasLicense: false,
    licenses: [],
    highestLicense: null,
    isLoading: false,
  });

  const { verifyLicenseOwnership } = useLicenseManagement();

  const checkLicense = useCallback(async () => {
    if (!address || !assetId) return;

    setVerification(prev => ({ ...prev, isLoading: true }));

    try {
      const result = await verifyLicenseOwnership(assetId, address);
      setVerification({
        ...result,
        isLoading: false,
      });
    } catch (error) {
      setVerification({
        hasLicense: false,
        licenses: [],
        highestLicense: null,
        isLoading: false,
      });
    }
  }, [address, assetId, verifyLicenseOwnership]);

  // Auto-check when address or assetId changes
  React.useEffect(() => {
    checkLicense();
  }, [checkLicense]);

  return {
    ...verification,
    refetch: checkLicense,
  };
}