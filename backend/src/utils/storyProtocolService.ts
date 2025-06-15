import { StoryClient } from '@story-protocol/core-sdk';
import { http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { aeneid } from '@story-protocol/core-sdk';

interface RegisterIPRequest {
  assetId: string;
  ipfsHash: string;
  creatorAddress: string;
  metadata: {
    title: string;
    description: string;
    category: string;
    tags: string[];
  };
}

interface RegisterIPResponse {
  success: boolean;
  ipId?: string;
  tokenId?: string;
  txHash?: string;
  error?: string;
}

class StoryProtocolService {
  private client: StoryClient;
  private account: any;

  constructor() {
    try {
      // Initialize wallet account with user's private key from environment
      const privateKey = process.env.STORY_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('STORY_PRIVATE_KEY environment variable is required');
      }
      console.log('🔍 Environment check:', {
        hasStoryPrivateKey: !!privateKey,
        storyRpcUrl: process.env.STORY_RPC_URL,
        privateKeyPreview: privateKey ? `${privateKey.slice(0, 6)}...${privateKey.slice(-4)}` : 'not found'
      });
      
      console.log('✅ Using provided private key for Story Protocol');
      this.account = privateKeyToAccount(privateKey as `0x${string}`);

      // Initialize Story Protocol client
      this.client = StoryClient.newClient({
        account: this.account,
        transport: http('https://aeneid.storyrpc.io'),
        chainId: 'aeneid',
      });
      console.log('📝 Story Protocol Service initialized');
      console.log(`   Account: ${this.account.address}`);
      console.log(`   Chain: Aeneid Testnet`);
    } catch (error) {
      console.error('❌ Failed to initialize Story Protocol Service:', error);
      throw error;
    }
  }

  getWalletAddress(): string {
    return this.account.address;
  }

  async registerIPAsset(request: RegisterIPRequest): Promise<RegisterIPResponse> {
    try {
      console.log(`📝 Registering IP asset for ${request.assetId}...`);
      console.log(`   Title: ${request.metadata.title}`);
      console.log(`   Category: ${request.metadata.category}`);
      console.log(`   IPFS: ${request.ipfsHash}`);

      // Create NFT metadata
      const nftMetadata = {
        name: request.metadata.title,
        description: request.metadata.description,
        image: `https://gateway.pinata.cloud/ipfs/${request.ipfsHash}`,
        external_url: `https://gateway.pinata.cloud/ipfs/${request.ipfsHash}`,
        attributes: [
          {
            trait_type: 'Category',
            value: request.metadata.category
          },
          {
            trait_type: 'Creator',
            value: request.creatorAddress
          },
          {
            trait_type: 'Asset Type',
            value: 'Digital Content'
          },
          {
            trait_type: 'Tags',
            value: request.metadata.tags.join(', ')
          }
        ]
      };

      console.log('📋 NFT Metadata created');

      // Use the Story Protocol official SPG NFT contract for testnet
      const response = await this.client.ipAsset.mintAndRegisterIp({
        spgNftContract: '0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc' as `0x${string}`,
        ipMetadata: {
          ipMetadataURI: `data:application/json;base64,${Buffer.from(JSON.stringify(nftMetadata)).toString('base64')}`,
          ipMetadataHash: `0x${Buffer.from(JSON.stringify(nftMetadata)).toString('hex').slice(0, 64)}` as `0x${string}`,
          nftMetadataURI: `data:application/json;base64,${Buffer.from(JSON.stringify(nftMetadata)).toString('base64')}`,
          nftMetadataHash: `0x${Buffer.from(JSON.stringify(nftMetadata)).toString('hex').slice(0, 64)}` as `0x${string}`
        },
        recipient: this.account.address as `0x${string}`
      });

      if (response.txHash && response.ipId) {
        console.log(`✅ IP Asset registered successfully:`);
        console.log(`   IP ID: ${response.ipId}`);
        console.log(`   Token ID: ${response.tokenId}`);
        console.log(`   Transaction: ${response.txHash}`);

        return {
          success: true,
          ipId: response.ipId,
          tokenId: response.tokenId?.toString(),
          txHash: response.txHash
        };
      } else {
        console.error('❌ IP registration failed: No response data');
        return {
          success: false,
          error: 'Registration failed: No response data'
        };
      }

    } catch (error: any) {
      console.error('❌ Story Protocol registration failed:', error);
      return {
        success: false,
        error: error.message || 'Unknown registration error'
      };
    }
  }

  async attachLicenseTerms(ipId: string, licenseTermsId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`📄 Attaching license terms to IP ${ipId}...`);

      const response = await this.client.license.attachLicenseTerms({
        ipId: ipId as `0x${string}`,
        licenseTermsId: BigInt(licenseTermsId)
      });

      if (response.txHash) {
        console.log(`✅ License terms attached: ${response.txHash}`);
        return { success: true };
      } else {
        return { success: false, error: 'Failed to attach license terms' };
      }

    } catch (error: any) {
      console.error('❌ License attachment failed:', error);
      return { success: false, error: error.message };
    }
  }

  async getIPAsset(ipId: string) {
    try {
      console.log(`🔍 Getting IP asset ${ipId}...`);
      // Note: The get method might not be available in this SDK version
      // For now, just return a placeholder
      return {
        ipId,
        owner: this.account.address,
        metadata: { name: 'Registered IP Asset' }
      };
    } catch (error: any) {
      console.error('❌ Failed to get IP asset:', error);
      return null;
    }
  }

  async createDefaultLicenseTerms() {
    try {
      console.log(`📄 Creating default license terms...`);
      
      // Create Non-Commercial Social Remixing PIL license terms
      const response = await this.client.license.registerNonComSocialRemixingPIL({});

      console.log(`✅ License terms created: ${response.licenseTermsId}`);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to create license terms:', error);
      return null;
    }
  }

  async createCommercialLicenseTerms(commercialRevShare: number = 10) {
    try {
      console.log(`📄 Creating commercial license terms...`);
      
      // Create Commercial Use PIL license terms - simplified
      const response = await this.client.license.registerCommercialUsePIL({
        defaultMintingFee: BigInt(0), // Free minting
        currency: '0x91f6F05B08c16769d3c85867548615d270C42fC7' as `0x${string}` // Story testnet USDC
      });

      console.log(`✅ Commercial license terms created: ${response.licenseTermsId}`);
      return response;
    } catch (error: any) {
      console.error('❌ Failed to create commercial license terms:', error);
      return null;
    }
  }
}

export const storyProtocolService = new StoryProtocolService();
export type { RegisterIPRequest, RegisterIPResponse };