import { useState, useCallback, useEffect } from 'react';
import { useWalletClient, useAccount, usePublicClient } from 'wagmi';
import { encodeFunctionData, type Hash } from 'viem';
import { storyAeneidTestnet } from '../config/tomoConfig';

// Story Protocol contracts on Aeneid Testnet
const STORY_CONTRACTS = {
  SPG: '0xbe39E1C756e921BD25DF86e7AAa31106d1eb0424', // Story Protocol Gateway
  NFT_CONTRACT: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc', // SPG NFT Contract
};

// Simplified ABI for mintAndRegisterIp function
const SPG_ABI = [
  {
    name: 'mintAndRegisterIp',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spgNftContract', type: 'address' },
      { name: 'recipient', type: 'address' },
      {
        name: 'ipMetadata',
        type: 'tuple',
        components: [
          { name: 'ipMetadataURI', type: 'string' },
          { name: 'ipMetadataHash', type: 'bytes32' },
          { name: 'nftMetadataURI', type: 'string' },
          { name: 'nftMetadataHash', type: 'bytes32' },
        ],
      },
      { name: 'allowDuplicates', type: 'bool' },
    ],
    outputs: [
      { name: 'ipId', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },
] as const;

export interface IPRegistrationParams {
  ipMetadataURI: string;
  ipMetadataHash: string;
  nftMetadataURI: string;
  nftMetadataHash: string;
}

export interface IPRegistrationResult {
  success: boolean;
  transactionHash?: Hash;
  ipId?: string;
  tokenId?: string;
  error?: string;
}

export function useImprovedStoryProtocol() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use wagmi hooks normally (they should be available within WagmiProvider)
  const { data: walletClient } = useWalletClient();
  const { address, chain, isConnected } = useAccount();
  const publicClient = usePublicClient();

  // Don't return functionality until mounted
  if (!mounted) {
    return {
      isLoading: false,
      error: null,
      registerIPAsset: async () => ({ success: false, error: 'Not mounted yet' }),
      clearError: () => {},
      validateConnection: () => false,
      getNetworkInfo: () => ({
        isConnected: false,
        address: undefined,
        chainId: undefined,
        chainName: undefined,
        isStoryChain: false,
        expectedChainId: storyAeneidTestnet.id,
        expectedChainName: storyAeneidTestnet.name,
        rpcUrl: storyAeneidTestnet.rpcUrls.default.http[0],
      }),
      isReady: false,
    };
  }

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const validateConnection = useCallback((): boolean => {
    if (!isConnected || !address) {
      setError('Wallet is not connected');
      return false;
    }

    if (!walletClient) {
      setError('Wallet client not available');
      return false;
    }

    if (chain?.id !== storyAeneidTestnet.id) {
      setError(`Wrong network. Please switch to Story Aeneid Testnet (Chain ID: ${storyAeneidTestnet.id})`);
      return false;
    }

    return true;
  }, [isConnected, address, walletClient, chain]);

  const registerIPAsset = useCallback(async (
    params: IPRegistrationParams
  ): Promise<IPRegistrationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Starting IP registration with improved hook...', {
        address,
        chainId: chain?.id,
        params
      });

      // Validate connection
      if (!validateConnection()) {
        setIsLoading(false);
        return { success: false, error: error || 'Connection validation failed' };
      }

      if (!address || !walletClient) {
        throw new Error('Wallet not properly connected');
      }

      // Encode transaction data
      const txData = encodeFunctionData({
        abi: SPG_ABI,
        functionName: 'mintAndRegisterIp',
        args: [
          STORY_CONTRACTS.NFT_CONTRACT as `0x${string}`,
          address as `0x${string}`,
          {
            ipMetadataURI: params.ipMetadataURI,
            ipMetadataHash: params.ipMetadataHash as `0x${string}`,
            nftMetadataURI: params.nftMetadataURI,
            nftMetadataHash: params.nftMetadataHash as `0x${string}`,
          },
          true, // allowDuplicates
        ],
      });

      console.log('📋 Transaction data encoded for Story Protocol');

      // Execute transaction using Tomo wallet
      const transactionHash = await walletClient.sendTransaction({
        to: STORY_CONTRACTS.SPG as `0x${string}`,
        data: txData,
        value: 0n,
        gas: 2000000n, // Increased gas limit
        gasPrice: undefined, // Let the network decide
      });

      console.log('✅ Transaction submitted:', transactionHash);

      // Wait for confirmation if possible
      let receipt = null;
      if (publicClient) {
        try {
          receipt = await publicClient.waitForTransactionReceipt({
            hash: transactionHash,
            timeout: 60000, // 60 seconds timeout
          });
          console.log('📦 Transaction confirmed:', receipt);
        } catch (receiptError) {
          console.warn('⚠️ Could not get transaction receipt:', receiptError);
        }
      }

      // Try to extract token ID and IP ID from logs
      let tokenId: string | undefined;
      let ipId: string | undefined;
      
      if (receipt && receipt.logs) {
        try {
          // Look for Transfer event (ERC721) to get token ID
          const transferLog = receipt.logs.find(log => 
            log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
          );
          
          if (transferLog && transferLog.topics[3]) {
            tokenId = BigInt(transferLog.topics[3]).toString();
            console.log('🎯 Token ID extracted:', tokenId);
          }

          // You might also extract IP ID from other events here
          // This would depend on the specific events emitted by Story Protocol
          
        } catch (logError) {
          console.warn('⚠️ Could not parse transaction logs:', logError);
        }
      }

      setIsLoading(false);
      return {
        success: true,
        transactionHash,
        tokenId,
        ipId,
      };

    } catch (err) {
      console.error('❌ IP registration failed:', err);
      
      let errorMessage = 'IP registration failed';
      if (err instanceof Error) {
        if (err.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient IP tokens for gas fees';
        } else if (err.message.includes('user rejected') || err.message.includes('denied')) {
          errorMessage = 'Transaction was rejected by user';
        } else if (err.message.includes('unknown account')) {
          errorMessage = 'Wallet account not recognized. Please ensure you are connected to Story Aeneid Testnet and have IP tokens for gas.';
        } else if (err.message.includes('nonce')) {
          errorMessage = 'Transaction nonce error. Please try again.';
        } else if (err.message.includes('gas')) {
          errorMessage = 'Gas estimation failed. Please ensure you have enough IP tokens.';
        } else {
          errorMessage = err.message || 'Unknown error occurred';
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  }, [address, chain, walletClient, publicClient, validateConnection, error]);

  const getNetworkInfo = useCallback(() => {
    return {
      isConnected,
      address,
      chainId: chain?.id,
      chainName: chain?.name,
      isStoryChain: chain?.id === storyAeneidTestnet.id,
      expectedChainId: storyAeneidTestnet.id,
      expectedChainName: storyAeneidTestnet.name,
      rpcUrl: storyAeneidTestnet.rpcUrls.default.http[0],
    };
  }, [isConnected, address, chain]);

  return {
    isLoading,
    error,
    registerIPAsset,
    clearError,
    validateConnection,
    getNetworkInfo,
    isReady: isConnected && address && chain?.id === storyAeneidTestnet.id,
  };
}

export default useImprovedStoryProtocol;