import { useState, useCallback } from 'react';
import { useWalletClient, useAccount, usePublicClient } from 'wagmi';
import { getContract, parseEther, encodeFunctionData, type Hash, createWalletClient, http } from 'viem';
import { storyAeneidTestnet } from '../config/tomoConfig';
import { NFT_CONTRACT_ABI, NFT_CONTRACT_ADDRESS } from '../utils/contractConfig';
import { validateBasicWalletState } from '../utils/walletValidator';

export interface StorySignatureResult {
  transactionHash: Hash;
  tokenId?: string;
  success: boolean;
}

export interface UseTomoStorySignatureReturn {
  isLoading: boolean;
  error: string | null;
  signAndExecuteIPRegistration: (params: {
    recipient: string;
    ipMetadataURI: string;
    ipMetadataHash: string;
    nftMetadataURI: string;
    nftMetadataHash: string;
  }) => Promise<StorySignatureResult | null>;
  signCustomTransaction: (params: {
    to: string;
    data: string;
    value?: bigint;
  }) => Promise<Hash | null>;
  clearError: () => void;
}

/**
 * Hook for signing Story Protocol transactions using Tomo wallet
 * Uses viem and ethers.js APIs as recommended by Tomo team
 */
export function useTomoStorySignature(): UseTomoStorySignatureReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data: walletClient } = useWalletClient();
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Sign and execute IP registration transaction using Tomo wallet
   * Following Tomo team guidance: use viem/ethers.js APIs for custom transaction signing
   */
  const signAndExecuteIPRegistration = useCallback(async (params: {
    recipient: string;
    ipMetadataURI: string;
    ipMetadataHash: string;
    nftMetadataURI: string;
    nftMetadataHash: string;
  }): Promise<StorySignatureResult | null> => {
    // Validate wallet connection first
    const validation = validateBasicWalletState(address, chain?.id, !!address);
    
    if (!validation.isValid) {
      const errorMessage = validation.errors.join('; ');
      setError(errorMessage);
      console.error('❌ Wallet validation failed:', validation.errors);
      return null;
    }

    if (!walletClient) {
      setError('Wallet client not available - please refresh and reconnect');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Using Tomo wallet for Story Protocol transaction...', {
        address,
        chainId: chain.id,
        params
      });

      // Prepare transaction data using viem as recommended by Tomo team
      const txData = encodeFunctionData({
        abi: NFT_CONTRACT_ABI,
        functionName: 'mintAndRegisterIpAsset',
        args: [
          '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' as `0x${string}`, // SPG NFT Contract
          params.recipient as `0x${string}`,
          {
            ipMetadataURI: params.ipMetadataURI,
            ipMetadataHash: params.ipMetadataHash as `0x${string}`,
            nftMetadataURI: params.nftMetadataURI,
            nftMetadataHash: params.nftMetadataHash as `0x${string}`,
          },
          true, // allowDuplicates
        ],
      });

      console.log('📋 Transaction data encoded:', txData);

      // Send transaction using Tomo wallet client (viem API)
      const transactionHash = await walletClient.sendTransaction({
        to: NFT_CONTRACT_ADDRESS,
        data: txData,
        value: 0n,
        gas: 1000000n, // Explicit gas limit
      });

      console.log('✅ Transaction submitted via Tomo wallet:', transactionHash);

      // Wait for transaction confirmation using public client
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: transactionHash,
        });

        console.log('📦 Transaction confirmed:', receipt);

        // Extract token ID from logs
        let tokenId: string | undefined;
        try {
          // Look for Transfer event to get the token ID
          const transferLog = receipt.logs.find(log => {
            return log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
          });
          
          if (transferLog && transferLog.topics[3]) {
            tokenId = BigInt(transferLog.topics[3]).toString();
            console.log('🎯 Token ID extracted:', tokenId);
          }
        } catch (tokenIdError) {
          console.warn('⚠️ Could not extract token ID:', tokenIdError);
        }

        setIsLoading(false);

        return {
          transactionHash,
          tokenId,
          success: true,
        };
      } else {
        // Fallback without waiting for receipt
        setIsLoading(false);
        return {
          transactionHash,
          success: true,
        };
      }

    } catch (err) {
      console.error('❌ Story Protocol transaction failed:', err);
      
      let errorMessage = 'Failed to register IP asset';
      if (err instanceof Error) {
        if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient SIP tokens for transaction gas';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (err.message.includes('unknown account')) {
          errorMessage = 'Wallet not properly connected to Story Protocol network';
        } else if (err.message.includes('nonce')) {
          errorMessage = 'Transaction nonce error - please try again';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [walletClient, address, chain, publicClient]);

  /**
   * Sign any custom transaction using Tomo wallet
   * Generic function for signing arbitrary transactions using viem API
   */
  const signCustomTransaction = useCallback(async (params: {
    to: string;
    data: string;
    value?: bigint;
  }): Promise<Hash | null> => {
    if (!walletClient || !address) {
      setError('Wallet not connected - please connect your Tomo wallet');
      return null;
    }

    if (chain?.id !== storyAeneidTestnet.id) {
      setError('Please switch to Story Aeneid Testnet');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Signing custom transaction with Tomo wallet...', {
        address,
        chainId: chain.id,
        params
      });

      // Send transaction using Tomo wallet client (viem API)
      const transactionHash = await walletClient.sendTransaction({
        to: params.to as `0x${string}`,
        data: params.data as `0x${string}`,
        value: params.value || 0n,
        gas: 500000n, // Default gas limit for custom transactions
      });

      console.log('✅ Custom transaction submitted via Tomo wallet:', transactionHash);

      setIsLoading(false);
      return transactionHash;

    } catch (err) {
      console.error('❌ Custom transaction failed:', err);
      
      let errorMessage = 'Failed to sign transaction';
      if (err instanceof Error) {
        if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient SIP tokens for transaction';
        } else if (err.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (err.message.includes('unknown account')) {
          errorMessage = 'Wallet not properly connected to Story Protocol network';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, [walletClient, address, chain]);

  return {
    isLoading,
    error,
    signAndExecuteIPRegistration,
    signCustomTransaction,
    clearError,
  };
}

/**
 * Helper function to prepare IP metadata for Story Protocol
 */
export function prepareIPMetadata(metadata: {
  title: string;
  description: string;
  ipfsHash: string;
  assetType: string;
  creator: string;
}): {
  ipMetadataURI: string;
  ipMetadataHash: string;
  nftMetadataURI: string;
  nftMetadataHash: string;
} {
  // Create IP metadata JSON
  const ipMetadata = {
    title: metadata.title,
    description: metadata.description,
    ipType: 'Original Work',
    assetType: metadata.assetType,
    creator: metadata.creator,
    createdAt: new Date().toISOString(),
    ipfsHash: metadata.ipfsHash,
  };

  // Create NFT metadata JSON
  const nftMetadata = {
    name: metadata.title,
    description: metadata.description,
    image: `ipfs://${metadata.ipfsHash}`,
    attributes: [
      {
        trait_type: 'Asset Type',
        value: metadata.assetType,
      },
      {
        trait_type: 'Creator',
        value: metadata.creator,
      },
      {
        trait_type: 'Registration Date',
        value: new Date().toISOString().split('T')[0],
      },
    ],
  };

  // Convert to strings and create hashes
  const ipMetadataString = JSON.stringify(ipMetadata);
  const nftMetadataString = JSON.stringify(nftMetadata);

  // Create simple hashes (in production, use proper hashing)
  const ipMetadataHash = `0x${Buffer.from(ipMetadataString).toString('hex').slice(0, 64).padEnd(64, '0')}`;
  const nftMetadataHash = `0x${Buffer.from(nftMetadataString).toString('hex').slice(0, 64).padEnd(64, '0')}`;

  // In a real implementation, these would be IPFS URIs
  // For now, we'll use the JSON directly
  const ipMetadataURI = `data:application/json;base64,${Buffer.from(ipMetadataString).toString('base64')}`;
  const nftMetadataURI = `data:application/json;base64,${Buffer.from(nftMetadataString).toString('base64')}`;

  return {
    ipMetadataURI,
    ipMetadataHash,
    nftMetadataURI,
    nftMetadataHash,
  };
}