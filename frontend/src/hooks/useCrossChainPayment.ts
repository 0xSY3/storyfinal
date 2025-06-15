import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { DlnOrderInfo } from '@debridge-finance/dln-client';
import { 
  deBridgeService, 
  type CrossChainPaymentRequest, 
  type CrossChainPaymentResult, 
  type PaymentEstimate 
} from '../utils/deBridgeService';
import { type LicenseType, type PaymentToken } from '../config/deBridgeConfig';

export interface UseCrossChainPaymentState {
  isEstimating: boolean;
  isCreatingOrder: boolean;
  isMonitoring: boolean;
  estimate: PaymentEstimate | null;
  paymentOrder: CrossChainPaymentResult | null;
  paymentStatus: DlnOrderInfo | null;
  error: string | null;
}

export interface UseCrossChainPaymentActions {
  estimatePayment: (params: {
    assetId: string;
    licenseType: LicenseType;
    customPrice?: number;
    recipientAddress: string;
    recipientChainId: number;
    paymentToken: PaymentToken;
  }) => Promise<PaymentEstimate | null>;
  
  createPayment: (params: {
    assetId: string;
    licenseType: LicenseType;
    customPrice?: number;
    recipientAddress: string;
    recipientChainId: number;
    paymentToken: PaymentToken;
  }) => Promise<CrossChainPaymentResult | null>;
  
  monitorPayment: (orderId: string) => Promise<DlnOrderInfo | null>;
  checkPaymentStatus: (orderId: string) => Promise<DlnOrderInfo | null>;
  clearError: () => void;
  reset: () => void;
}

export type UseCrossChainPaymentReturn = UseCrossChainPaymentState & UseCrossChainPaymentActions;

export function useCrossChainPayment(): UseCrossChainPaymentReturn {
  const { address, chain } = useAccount();
  
  const [state, setState] = useState<UseCrossChainPaymentState>({
    isEstimating: false,
    isCreatingOrder: false,
    isMonitoring: false,
    estimate: null,
    paymentOrder: null,
    paymentStatus: null,
    error: null,
  });

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isEstimating: false,
      isCreatingOrder: false,
      isMonitoring: false,
      estimate: null,
      paymentOrder: null,
      paymentStatus: null,
      error: null,
    });
  }, []);

  const estimatePayment = useCallback(async (params: {
    assetId: string;
    licenseType: LicenseType;
    customPrice?: number;
    recipientAddress: string;
    recipientChainId: number;
    paymentToken: PaymentToken;
  }): Promise<PaymentEstimate | null> => {
    if (!address || !chain) {
      setError('Wallet not connected');
      return null;
    }

    setState(prev => ({ ...prev, isEstimating: true, error: null }));

    try {
      const request: CrossChainPaymentRequest = {
        ...params,
        payerAddress: address,
        payerChainId: chain.id,
      };

      const estimate = await deBridgeService.estimatePayment(request);
      
      setState(prev => ({ 
        ...prev, 
        isEstimating: false, 
        estimate 
      }));

      return estimate;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to estimate payment';
      setError(errorMessage);
      setState(prev => ({ ...prev, isEstimating: false }));
      return null;
    }
  }, [address, chain, setError]);

  const createPayment = useCallback(async (params: {
    assetId: string;
    licenseType: LicenseType;
    customPrice?: number;
    recipientAddress: string;
    recipientChainId: number;
    paymentToken: PaymentToken;
  }): Promise<CrossChainPaymentResult | null> => {
    if (!address || !chain) {
      setError('Wallet not connected');
      return null;
    }

    setState(prev => ({ ...prev, isCreatingOrder: true, error: null }));

    try {
      const request: CrossChainPaymentRequest = {
        ...params,
        payerAddress: address,
        payerChainId: chain.id,
      };

      const paymentOrder = await deBridgeService.createPaymentOrder(request);
      
      setState(prev => ({ 
        ...prev, 
        isCreatingOrder: false, 
        paymentOrder 
      }));

      return paymentOrder;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment order';
      setError(errorMessage);
      setState(prev => ({ ...prev, isCreatingOrder: false }));
      return null;
    }
  }, [address, chain, setError]);

  const checkPaymentStatus = useCallback(async (orderId: string): Promise<DlnOrderInfo | null> => {
    try {
      const status = await deBridgeService.getPaymentStatus(orderId);
      setState(prev => ({ ...prev, paymentStatus: status }));
      return status;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check payment status';
      setError(errorMessage);
      return null;
    }
  }, [setError]);

  const monitorPayment = useCallback(async (orderId: string): Promise<DlnOrderInfo | null> => {
    setState(prev => ({ ...prev, isMonitoring: true, error: null }));

    try {
      const finalStatus = await deBridgeService.monitorPayment(
        orderId,
        (status) => {
          setState(prev => ({ ...prev, paymentStatus: status }));
        }
      );

      setState(prev => ({ 
        ...prev, 
        isMonitoring: false, 
        paymentStatus: finalStatus 
      }));

      return finalStatus;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment monitoring failed';
      setError(errorMessage);
      setState(prev => ({ ...prev, isMonitoring: false }));
      return null;
    }
  }, [setError]);

  return {
    ...state,
    estimatePayment,
    createPayment,
    monitorPayment,
    checkPaymentStatus,
    clearError,
    reset,
  };
}

// Hook for getting supported chains and tokens
export function useDeBridgeConfig() {
  const getSupportedChains = useCallback(() => {
    return deBridgeService.getSupportedChains();
  }, []);

  const getSupportedTokens = useCallback((chainId: number) => {
    return deBridgeService.getSupportedTokens(chainId);
  }, []);

  return {
    getSupportedChains,
    getSupportedTokens,
  };
}