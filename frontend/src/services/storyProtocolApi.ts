interface StoryProtocolAsset {
  id: string;
  ipId: string;
  tokenId: string;
  name: string;
  description?: string;
  image?: string;
  owner: string;
  creator: string;
  registrationDate: string;
  licenseTerms?: {
    id: string;
    commercial: boolean;
    derivatives: boolean;
    territory: string;
    currency: string;
    royaltyPercentage: number;
  }[];
  metadata?: {
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
}

interface StoryProtocolResponse {
  data: StoryProtocolAsset[];
  total: number;
  page: number;
  limit: number;
}

class StoryProtocolApiService {
  private baseUrl = 'https://explorer.story.foundation/api';
  
  async getAssets(params: {
    page?: number;
    limit?: number;
    search?: string;
    owner?: string;
  } = {}): Promise<StoryProtocolResponse> {
    try {
      // Return empty results since we're removing mock data
      // Real Story Protocol API integration would go here
      return {
        data: [],
        total: 0,
        page: params.page || 1,
        limit: params.limit || 20
      };
    } catch (error) {
      console.error('Error fetching assets from Story Protocol:', error);
      throw new Error('Failed to fetch assets from Story Protocol');
    }
  }

  async getAssetById(ipId: string): Promise<StoryProtocolAsset | null> {
    try {
      // Real Story Protocol API integration would go here
      return null;
    } catch (error) {
      console.error('Error fetching asset by ID:', error);
      throw new Error('Failed to fetch asset details');
    }
  }
}

export const storyProtocolApi = new StoryProtocolApiService();
export type { StoryProtocolAsset, StoryProtocolResponse };