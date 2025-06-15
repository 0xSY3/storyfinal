import { useQuery } from '@tanstack/react-query';
import { storyProtocolApi, StoryProtocolAsset } from '../services/storyProtocolApi';
import { SearchAsset, AssetType } from '../types/assetTypes';

interface UseStoryProtocolAssetsParams {
  page?: number;
  limit?: number;
  search?: string;
  owner?: string;
  enabled?: boolean;
}

export const useStoryProtocolAssets = (params: UseStoryProtocolAssetsParams = {}) => {
  const { page = 1, limit = 20, search, owner, enabled = true } = params;

  return useQuery({
    queryKey: ['storyProtocolAssets', page, limit, search, owner],
    queryFn: () => storyProtocolApi.getAssets({ page, limit, search, owner }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStoryProtocolAsset = (ipId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['storyProtocolAsset', ipId],
    queryFn: () => storyProtocolApi.getAssetById(ipId),
    enabled: enabled && !!ipId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Convert Story Protocol asset to SearchAsset format
export const convertStoryProtocolAssetToSearchAsset = (asset: StoryProtocolAsset): SearchAsset => {
  // Determine asset type from metadata or name
  const getAssetType = (asset: StoryProtocolAsset): AssetType => {
    const name = asset.name.toLowerCase();
    const category = asset.metadata?.attributes?.find(attr => attr.trait_type === 'Category')?.value.toLowerCase() || '';
    
    if (name.includes('music') || name.includes('audio') || category.includes('music')) {
      return AssetType.AUDIO;
    }
    if (name.includes('video') || category.includes('video')) {
      return AssetType.VIDEO;
    }
    if (name.includes('3d') || name.includes('model') || category.includes('3d')) {
      return AssetType.MODEL_3D;
    }
    if (name.includes('code') || name.includes('contract') || category.includes('code')) {
      return AssetType.CODE;
    }
    if (name.includes('document') || name.includes('pdf') || category.includes('document')) {
      return AssetType.DOCUMENT;
    }
    if (name.includes('dataset') || name.includes('data') || category.includes('data')) {
      return AssetType.DATASET;
    }
    
    // Default to image
    return AssetType.IMAGE;
  };

  // Generate filename from name and asset type
  const generateFileName = (name: string, assetType: AssetType): string => {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
    const extensions: Record<AssetType, string> = {
      [AssetType.IMAGE]: 'png',
      [AssetType.AUDIO]: 'mp3',
      [AssetType.VIDEO]: 'mp4',
      [AssetType.DOCUMENT]: 'pdf',
      [AssetType.MODEL_3D]: 'glb',
      [AssetType.DATASET]: 'csv',
      [AssetType.CODE]: 'sol',
    };
    
    return `${cleanName}.${extensions[assetType]}`;
  };

  const assetType = getAssetType(asset);
  const fileName = generateFileName(asset.name, assetType);
  
  // Extract category from metadata
  const category = asset.metadata?.attributes?.find(attr => attr.trait_type === 'Category')?.value || 'Uncategorized';
  
  // Extract tags from metadata attributes
  const tags = asset.metadata?.attributes?.map(attr => attr.value) || [];

  return {
    assetId: asset.ipId,
    title: asset.name,
    description: asset.description || 'No description available',
    creator: asset.creator.substring(0, 8) + '...' + asset.creator.slice(-4), // Shortened address
    creatorAddress: asset.creator,
    assetType,
    category,
    tags,
    fileName,
    fileSize: 1024 * 1024, // Mock 1MB file size
    mimeType: assetType === AssetType.IMAGE ? 'image/png' : 'application/octet-stream',
    ipfsHash: asset.ipId, // Using ipId as hash for now
    pinataUrl: asset.image || 'https://via.placeholder.com/400x300',
    thumbnailUrl: asset.image || 'https://via.placeholder.com/400x300',
    viewCount: Math.floor(Math.random() * 10000) + 100,
    downloadCount: Math.floor(Math.random() * 1000) + 10,
    likeCount: Math.floor(Math.random() * 500) + 5,
    popularityScore: Math.random() * 0.5 + 0.5, // Random score between 0.5 and 1
    createdAt: asset.registrationDate,
    updatedAt: asset.registrationDate,
    price: asset.licenseTerms?.[0]?.commercial ? Math.floor(Math.random() * 100) + 10 : 0,
    currency: 'USD',
    commercialUse: asset.licenseTerms?.[0]?.commercial || false,
  };
};