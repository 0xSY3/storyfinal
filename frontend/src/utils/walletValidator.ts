/**
 * Wallet Connection Validator for Story Protocol
 * 
 * This utility validates wallet connection and network setup before transactions
 */

import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { storyAeneidTestnet } from '../config/tomoConfig';

export interface WalletValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  address?: string;
  chainId?: number;
  hasBalance?: boolean;
}

// Note: This function should only be used inside React components as it uses hooks
export function useWalletValidation() {
  const { address, chain, connector, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const validateWalletConnection = async (): Promise<WalletValidationResult> => {
    const result: WalletValidationResult = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      console.log('🔍 Validating wallet connection...', {
        address,
        chainId: chain?.id,
        connector: connector?.name,
        isConnected
      });

      // Check basic connection
      if (!isConnected || !address) {
        result.errors.push('Wallet is not connected');
        return result;
      }

      result.address = address;

      // Check wallet client
      if (!walletClient) {
        result.errors.push('Wallet client not available');
        return result;
      }

      // Check network
      if (!chain) {
        result.errors.push('Network information not available');
        return result;
      }

      result.chainId = chain.id;

      if (chain.id !== storyAeneidTestnet.id) {
        result.errors.push(`Wrong network. Expected Story Aeneid Testnet (${storyAeneidTestnet.id}), got ${chain.id}`);
        return result;
      }

      // Check balance
      if (publicClient) {
        try {
          const balance = await publicClient.getBalance({
            address: address as `0x${string}`,
          });
          
          const balanceInEth = Number(balance) / 1e18;
          result.hasBalance = balanceInEth > 0;
          
          if (balanceInEth < 0.001) {
            result.warnings.push('Low IP token balance. You may not have enough for gas fees.');
          }
          
          console.log(`💰 Balance: ${balanceInEth.toFixed(6)} IP`);
        } catch (_) {
          result.warnings.push('Could not check balance');
        }
      }

      // All checks passed
      result.isValid = result.errors.length === 0;
      
      if (result.isValid) {
        console.log('✅ Wallet validation passed');
      } else {
        console.error('❌ Wallet validation failed:', result.errors);
      }

      return result;

    } catch (error) {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  };

  return { validateWalletConnection };
}

/**
 * Simple validation function that can be used without React hooks
 */
export function validateBasicWalletState(
  address: string | undefined,
  chainId: number | undefined,
  isConnected: boolean
): WalletValidationResult {
  const result: WalletValidationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  if (!isConnected) {
    result.errors.push('Wallet is not connected');
    return result;
  }

  if (!address) {
    result.errors.push('No wallet address available');
    return result;
  }

  result.address = address;

  if (!chainId) {
    result.errors.push('No network information available');
    return result;
  }

  result.chainId = chainId;

  if (chainId !== storyAeneidTestnet.id) {
    result.errors.push(`Wrong network. Please switch to Story Aeneid Testnet (Chain ID: ${storyAeneidTestnet.id})`);
    return result;
  }

  result.isValid = true;
  return result;
}

/**
 * Get network switch instructions
 */
export function getNetworkSwitchInstructions(): string[] {
  return [
    'To switch to Story Aeneid Testnet:',
    '1. Open your wallet (Tomo, MetaMask, etc.)',
    '2. Click on the network dropdown',
    '3. Add/Select Story Aeneid Testnet:',
    `   - Network Name: ${storyAeneidTestnet.name}`,
    `   - RPC URL: ${storyAeneidTestnet.rpcUrls.default.http[0]}`,
    `   - Chain ID: ${storyAeneidTestnet.id}`,
    `   - Symbol: ${storyAeneidTestnet.nativeCurrency.symbol}`,
    `   - Explorer: ${storyAeneidTestnet.blockExplorers.default.url}`,
    '4. Refresh the page after switching networks'
  ];
}

/**
 * Debug wallet connection in console
 */
export function debugWalletConnection() {
  console.log('🔍 Story Protocol Wallet Debug');
  console.log('Expected Network:', {
    name: storyAeneidTestnet.name,
    chainId: storyAeneidTestnet.id,
    rpcUrl: storyAeneidTestnet.rpcUrls.default.http[0],
    currency: storyAeneidTestnet.nativeCurrency.symbol
  });
  
  console.log('Network Switch Instructions:');
  getNetworkSwitchInstructions().forEach(instruction => {
    console.log(instruction);
  });
}

// Auto-export debug function to window for console usage
if (typeof window !== 'undefined') {
  (window as unknown as { 
    debugWalletConnection: typeof debugWalletConnection;
    storyNetworkInfo: typeof storyAeneidTestnet;
  }).debugWalletConnection = debugWalletConnection;
  (window as unknown as { 
    debugWalletConnection: typeof debugWalletConnection;
    storyNetworkInfo: typeof storyAeneidTestnet;
  }).storyNetworkInfo = storyAeneidTestnet;
}