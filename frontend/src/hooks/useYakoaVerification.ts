import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export interface YakoaVerificationResult {
  tokenId: string;
  verificationStatus: 'pending' | 'verified' | 'flagged' | 'failed';
  trustScore: number;
  infringements: {
    external: any[];
    inNetwork: any[];
  };
  authorizations: any[];
  mediaResults: YakoaMediaVerificationResult[];
}

export interface YakoaMediaVerificationResult {
  mediaId: string;
  url: string;
  fetchStatus: string;
  infringementStatus: 'clean' | 'flagged' | 'pending';
  confidence?: number;
  brandMatches?: string[];
}

// Get verification status for a single asset
export function useAssetVerification(assetId: string, options: any = {}) {
  return useQuery({
    queryKey: ['yakoaVerification', assetId],
    queryFn: async (): Promise<YakoaVerificationResult | null> => {
      const response = await fetch(`${API_BASE_URL}/api/yakoa/verification/${assetId}`);
      
      if (response.status === 404) {
        return null; // No verification found
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }
      
      return response.json();
    },
    enabled: !!assetId,
    staleTime: 300000, // 5 minutes 
    cacheTime: 900000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
}

// Get verification status for multiple assets
export function useBatchVerification(assetIds: string[], options: any = {}) {
  return useQuery({
    queryKey: ['yakoaBatchVerification', assetIds],
    queryFn: async (): Promise<Record<string, YakoaVerificationResult | null>> => {
      if (!assetIds.length) return {};
      
      const response = await fetch(`${API_BASE_URL}/api/yakoa/verification/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assetIds }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch verification status');
      }
      
      return response.json();
    },
    enabled: assetIds.length > 0,
    staleTime: 300000, // 5 minutes
    cacheTime: 900000, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options,
  });
}

// Mark asset as false positive (admin only)
export function useMarkFalsePositive() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assetId, 
      reason, 
      brandName, 
      adminKey 
    }: { 
      assetId: string; 
      reason: string; 
      brandName?: string; 
      adminKey: string; 
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/yakoa/verification/${assetId}/false-positive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, brandName, adminKey }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark as false positive');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate verification queries for this asset
      queryClient.invalidateQueries({ queryKey: ['yakoaVerification', variables.assetId] });
      queryClient.invalidateQueries({ queryKey: ['yakoaBatchVerification'] });
    },
  });
}

// Update trust reason (admin only)
export function useUpdateTrustReason() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assetId, 
      trustReason, 
      reason, 
      adminKey 
    }: { 
      assetId: string; 
      trustReason: 'trusted_platform' | 'no_licenses'; 
      reason?: string; 
      adminKey: string; 
    }) => {
      const response = await fetch(`${API_BASE_URL}/api/yakoa/verification/${assetId}/trust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trustReason, reason, adminKey }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update trust reason');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['yakoaVerification', variables.assetId] });
      queryClient.invalidateQueries({ queryKey: ['yakoaBatchVerification'] });
    },
  });
}

// Retry verification (admin only)
export function useRetryVerification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ assetId, adminKey }: { assetId: string; adminKey: string }) => {
      const response = await fetch(`${API_BASE_URL}/api/yakoa/verification/${assetId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to retry verification');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['yakoaVerification', variables.assetId] });
      queryClient.invalidateQueries({ queryKey: ['yakoaBatchVerification'] });
    },
  });
}

// Utility functions
export function getVerificationStatusColor(status: string): string {
  switch (status) {
    case 'verified': return '#4caf50';
    case 'pending': return '#ff9800';
    case 'flagged': return '#f44336';
    case 'failed': return '#757575';
    default: return '#757575';
  }
}

export function getVerificationStatusLabel(status: string): string {
  switch (status) {
    case 'verified': return 'Verified';
    case 'pending': return 'Pending';
    case 'flagged': return 'Flagged';
    case 'failed': return 'Failed';
    default: return 'Unknown';
  }
}

export function getTrustScoreLabel(score: number): string {
  if (score >= 0.9) return 'Excellent';
  if (score >= 0.7) return 'Good';
  if (score >= 0.5) return 'Moderate';
  if (score >= 0.3) return 'Low';
  return 'Very Low';
}

export function getTrustScoreColor(score: number): string {
  if (score >= 0.9) return '#4caf50';
  if (score >= 0.7) return '#8bc34a';
  if (score >= 0.5) return '#ff9800';
  if (score >= 0.3) return '#ff5722';
  return '#f44336';
}