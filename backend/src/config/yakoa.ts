import axios from 'axios';
import crypto from 'crypto';

// Yakoa API configuration
const YAKOA_API_KEY = process.env.YAKOA_API_KEY || 'ykbr86b5Zo3AfiSkvGd5c7Un4mNYSsAV8rg4iQOz';
const YAKOA_BASE_URL = 'https://docs-demo.ip-api-sandbox.yakoa.io';
const YAKOA_NETWORK = 'docs-demo'; // Demo network for testing

// Supported chains by Yakoa
export enum YakoaChain {
  STORY_MAINNET = 'story-mainnet',
  STORY_AENEID = 'story-aeneid',
  STORY_ILLIAD = 'story-illiad',
  STORY_ODYSSEY = 'story-odyssey'
}

// Yakoa API client
export class YakoaClient {
  private apiKey: string;
  private baseUrl: string;
  private network: string;

  constructor(apiKey?: string, baseUrl?: string, network?: string) {
    this.apiKey = apiKey || YAKOA_API_KEY;
    this.baseUrl = baseUrl || YAKOA_BASE_URL;
    this.network = network || YAKOA_NETWORK;
  }

  private getHeaders() {
    return {
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private getApiUrl(endpoint: string) {
    return `${this.baseUrl}/${this.network}${endpoint}`;
  }

  // Generate a unique token ID for our assets
  generateTokenId(contractAddress: string, tokenId?: string): string {
    // Ensure contractAddress follows Ethereum address format and is lowercase
    let validContractAddress = contractAddress.startsWith('0x') ? 
      contractAddress : `0x${'0'.repeat(40 - contractAddress.length)}${contractAddress}`;
    
    // Convert to lowercase for Yakoa API compatibility
    validContractAddress = validContractAddress.toLowerCase();
    
    if (tokenId) {
      return `${validContractAddress}:${tokenId}`;
    }
    return validContractAddress;
  }

  // Generate a content hash for verification
  generateContentHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  // Register a token with Yakoa
  async registerToken(tokenData: YakoaTokenRegistration): Promise<YakoaTokenResponse> {
    try {
      const response = await axios.post(
        this.getApiUrl('/token'),
        tokenData,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yakoa token registration failed:', error.response?.data || error.message);
      throw new Error(`Yakoa registration failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Get token details and infringement results
  async getToken(tokenId: string): Promise<YakoaTokenResponse> {
    try {
      const response = await axios.get(
        this.getApiUrl(`/token/${encodeURIComponent(tokenId)}`),
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yakoa token fetch failed:', error.response?.data || error.message);
      throw new Error(`Failed to fetch token: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Get specific media item
  async getTokenMedia(tokenId: string, mediaId: string): Promise<YakoaMediaResponse> {
    try {
      const response = await axios.get(
        this.getApiUrl(`/token/${encodeURIComponent(tokenId)}/media/${encodeURIComponent(mediaId)}`),
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yakoa media fetch failed:', error.response?.data || error.message);
      throw new Error(`Failed to fetch media: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Update media trust reason
  async updateMediaTrust(tokenId: string, mediaId: string, trustReason: YakoaTrustReason): Promise<YakoaMediaResponse> {
    try {
      const response = await axios.patch(
        this.getApiUrl(`/token/${encodeURIComponent(tokenId)}/media/${encodeURIComponent(mediaId)}`),
        { trust_reason: trustReason },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yakoa media trust update failed:', error.response?.data || error.message);
      throw new Error(`Failed to update media trust: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Create or update brand authorization
  async createAuthorization(tokenId: string, authorization: YakoaAuthorization): Promise<YakoaAuthorizationResponse> {
    try {
      const response = await axios.post(
        this.getApiUrl(`/token/${encodeURIComponent(tokenId)}/authorization`),
        authorization,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yakoa authorization creation failed:', error.response?.data || error.message);
      throw new Error(`Failed to create authorization: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Get brand authorization
  async getAuthorization(tokenId: string, brandId: string): Promise<YakoaAuthorizationResponse> {
    try {
      const response = await axios.get(
        this.getApiUrl(`/token/${encodeURIComponent(tokenId)}/authorization/${encodeURIComponent(brandId)}`),
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error: any) {
      console.error('Yakoa authorization fetch failed:', error.response?.data || error.message);
      throw new Error(`Failed to fetch authorization: ${error.response?.data?.detail || error.message}`);
    }
  }

  // Delete brand authorization
  async deleteAuthorization(tokenId: string, brandId: string): Promise<void> {
    try {
      await axios.delete(
        this.getApiUrl(`/token/${encodeURIComponent(tokenId)}/authorization/${encodeURIComponent(brandId)}`),
        { headers: this.getHeaders() }
      );
    } catch (error: any) {
      console.error('Yakoa authorization deletion failed:', error.response?.data || error.message);
      throw new Error(`Failed to delete authorization: ${error.response?.data?.detail || error.message}`);
    }
  }
}

// Type definitions for Yakoa API
export interface YakoaTokenRegistration {
  id: string;
  registration_tx: {
    hash: string;
    block_number: number;
    timestamp: string;
    chain: YakoaChain;
  };
  creator_id: string;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
    [key: string]: any;
  };
  media: YakoaMediaItem[];
  license_parents?: YakoaLicenseParent[];
  authorizations?: YakoaAuthorization[];
}

export interface YakoaMediaItem {
  media_id: string;
  url: string;
  hash?: string; // Required for non-IPFS URLs
  trust_reason?: YakoaTrustReason;
}

export interface YakoaLicenseParent {
  parent_token_id: {
    chain: YakoaChain;
    contract_address: string;
    token_id?: string;
  };
  license_id: string;
}

export interface YakoaAuthorization {
  brand_id?: string;
  brand_name?: string;
  data: YakoaAuthorizationData;
}

export interface YakoaAuthorizationData {
  type: 'email' | 'false_positive';
  email_address?: string;
  reason?: string;
  [key: string]: any;
}

export interface YakoaTrustReason {
  type: 'trusted_platform' | 'no_licenses';
  trusted_platform?: {
    platform_name: string;
    platform_url?: string;
  };
  reason?: string;
}

export interface YakoaTokenResponse {
  id: {
    chain: YakoaChain;
    contract_address: string;
    token_id?: string;
  };
  registration_tx: {
    hash: string;
    block_number: number;
    timestamp: string;
    chain: YakoaChain;
  };
  creator_id: string;
  metadata: any;
  license_parents: YakoaLicenseParent[];
  token_authorizations: YakoaAuthorizationResponse[];
  creator_authorizations: YakoaAuthorizationResponse[];
  media: YakoaMediaResponse[];
}

export interface YakoaMediaResponse {
  media_id: string;
  url: string;
  hash?: string;
  trust_reason?: YakoaTrustReason;
  fetch_status?: string;
  uri_id?: string;
  infringements?: YakoaInfringements;
}

export interface YakoaAuthorizationResponse {
  brand_id?: string;
  brand_name?: string;
  data: YakoaAuthorizationData;
}

export interface YakoaInfringements {
  status: 'pending' | 'failed' | 'succeeded';
  external_infringements?: YakoaExternalInfringement[];
  in_network_infringements?: YakoaInNetworkInfringement[];
}

export interface YakoaExternalInfringement {
  brand_id: string;
  brand_name: string;
  confidence: number;
  matched_content: string;
}

export interface YakoaInNetworkInfringement {
  token_id: {
    chain: YakoaChain;
    contract_address: string;
    token_id?: string;
  };
  media_id: string;
  confidence: number;
}

// Create singleton instance
export const yakoaClient = new YakoaClient();

// Utility functions
export function getStoryChain(): YakoaChain {
  // Map Story Protocol chains to Yakoa chains
  const chainId = process.env.STORY_CHAIN_ID || '1315'; // Aeneid testnet by default
  switch (chainId) {
    case '1513': return YakoaChain.STORY_MAINNET;
    case '1315': return YakoaChain.STORY_AENEID;
    case '1516': return YakoaChain.STORY_ILLIAD;
    case '1517': return YakoaChain.STORY_ODYSSEY;
    default: return YakoaChain.STORY_AENEID;
  }
}

// Removed generateMockTransactionData - now using real transaction data generation in YakoaVerificationService