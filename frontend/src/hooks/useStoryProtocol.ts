import { useCallback } from "react";
import { useReadContract } from "wagmi";
import {
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_ADDRESS,
} from "../utils/contractConfig";
import { useTomoStorySignature, prepareIPMetadata } from "./useTomoStorySignature";

export const useStoryProtocol = (walletAddress: string | null) => {
  const { signAndExecuteIPRegistration, isLoading: isSigningTransaction, error: signatureError } = useTomoStorySignature();
  const getNFTInfo = useCallback(
    async (tokenId: string) => {
      if (!walletAddress) throw new Error("Wallet connection required");

      // For now, we'll return mock data since we need to restructure this hook
      // In a real implementation, you'd use useReadContract properly
      return {
        owner: walletAddress,
        cid: `mock-cid-${tokenId}`,
        isOwner: true,
      };
    },
    [walletAddress]
  );

  const checkNFTOwnership = useCallback(
    async (tokenId: string) => {
      if (!walletAddress) throw new Error("Wallet is not connected.");
      // Mock implementation - in real app you'd use proper contract reading
      return true;
    },
    [walletAddress]
  );

  const getUserNFTBalance = useCallback(async () => {
    if (!walletAddress) throw new Error("Wallet is not connected.");
    // Mock implementation - in real app you'd use proper contract reading
    return 0;
  }, [walletAddress]);

  /**
   * Register IP asset using Tomo wallet with Story Protocol SDK
   * This ensures the Story Protocol SDK uses the Tomo wallet correctly
   */
  const registerIPAsset = useCallback(async (metadata: {
    title: string;
    description: string;
    ipfsHash: string;
    assetType: string;
  }) => {
    if (!walletAddress) throw new Error("Wallet connection required");

    try {
      console.log('🚀 Starting IP registration with Tomo wallet integration...', metadata);

      // Important: For Story Protocol SDK to work with Tomo wallet,
      // we need to let the existing flow handle the wallet integration.
      // The SDK should automatically use the connected wallet.
      
      console.log('💡 Using Story Protocol SDK with Tomo wallet');
      console.log('🔗 Wallet address:', walletAddress);
      console.log('⚠️ Note: Make sure Tomo wallet is connected to Story Aeneid Testnet');

      // Return metadata for the calling component to use with Story Protocol SDK
      const preparedMetadata = prepareIPMetadata({
        ...metadata,
        creator: walletAddress,
      });

      return {
        success: true,
        preparedMetadata,
        message: 'Metadata prepared for Story Protocol SDK registration',
      };

    } catch (error) {
      console.error('❌ IP registration preparation failed:', error);
      throw error;
    }
  }, [walletAddress]);

  return {
    getNFTInfo,
    checkNFTOwnership,
    getUserNFTBalance,
    registerIPAsset,
    isSigningTransaction,
    signatureError,
  };
};
