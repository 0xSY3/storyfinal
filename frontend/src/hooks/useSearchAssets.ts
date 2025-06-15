import { useQuery } from '@tanstack/react-query';
import { AssetType } from '../types/assetTypes';

export interface SearchFilters {
  assetType?: AssetType[];
  category?: string[];
  tags?: string[];
  creator?: string;
  priceRange?: { min?: number; max?: number };
  dateRange?: { from?: string; to?: string };
  commercialUse?: boolean;
  minQualityScore?: number;
}

export interface SearchSort {
  field: 'relevance' | 'createdAt' | 'price' | 'popularityScore' | 'viewCount' | 'downloadCount';
  order: 'asc' | 'desc';
}

export interface SearchOptions {
  query?: string;
  filters?: SearchFilters;
  sort?: SearchSort;
  page?: number;
  size?: number;
  aggregations?: boolean;
}

export interface SearchResponse {
  hits: any[];
  total: number;
  page: number;
  size: number;
  aggregations?: any;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function searchAssets(options: SearchOptions): Promise<SearchResponse> {
  const {
    query = '',
    filters = {},
    sort = { field: 'relevance', order: 'desc' },
    page = 1,
    size = 20,
    aggregations = false,
  } = options;

  try {
    // If no search query or filters, get all assets from gallery API
    if (!query && (!filters || Object.keys(filters).length === 0)) {
      console.log('🔍 Fetching all assets from gallery API...');
      
      const response = await fetch(`${API_BASE_URL}/api/assets`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      
      const result = await response.json();
      const assets = result.data || [];
      
      // Apply sorting to real assets
      let sortedAssets = [...assets];
      switch (sort.field) {
        case 'createdAt':
          sortedAssets.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sort.order === 'desc' ? dateB - dateA : dateA - dateB;
          });
          break;
        case 'downloadCount':
          sortedAssets.sort((a, b) => {
            const countA = a.downloadCount || 0;
            const countB = b.downloadCount || 0;
            return sort.order === 'desc' ? countB - countA : countA - countB;
          });
          break;
        case 'viewCount':
          sortedAssets.sort((a, b) => {
            const countA = a.viewCount || 0;
            const countB = b.viewCount || 0;
            return sort.order === 'desc' ? countB - countA : countA - countB;
          });
          break;
        default:
          // Keep original order for relevance or other fields
          break;
      }
      
      // Apply pagination
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const paginatedAssets = sortedAssets.slice(startIndex, endIndex);
      
      return {
        hits: paginatedAssets,
        total: sortedAssets.length,
        page,
        size,
        aggregations: aggregations ? {
          assetTypes: getAssetTypeAggregations(sortedAssets),
          categories: getCategoryAggregations(sortedAssets)
        } : undefined
      };
    }

    // If search query or filters exist, try search API
    const params = new URLSearchParams();
    
    if (query) params.append('q', query);
    if (filters.assetType?.length) {
      filters.assetType.forEach(type => params.append('type', type));
    }
    if (filters.category?.length) {
      filters.category.forEach(cat => params.append('category', cat));
    }
    if (filters.tags?.length) {
      filters.tags.forEach(tag => params.append('tags', tag));
    }
    if (filters.creator) params.append('creator', filters.creator);
    
    params.append('sortBy', sort.field);
    params.append('sortOrder', sort.order);
    params.append('page', page.toString());
    params.append('size', size.toString());

    console.log('🔍 Searching assets with query:', query);
    
    const searchResponse = await fetch(`${API_BASE_URL}/api/search/assets?${params.toString()}`);
    
    if (searchResponse.ok) {
      return searchResponse.json();
    } else {
      // Fallback to simple filtering of all assets
      console.log('⚠️ Search API not available, filtering all assets...');
      return await searchInAllAssets(options);
    }

  } catch (error) {
    console.warn('🚨 Search failed, using fallback:', error);
    return await searchInAllAssets(options);
  }
}

// Fallback search function that filters all assets locally
async function searchInAllAssets(options: SearchOptions): Promise<SearchResponse> {
  const { query = '', filters = {}, sort = { field: 'relevance', order: 'desc' }, page = 1, size = 20 } = options;
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/assets`);
    if (!response.ok) {
      throw new Error('Failed to fetch assets');
    }
    
    const result = await response.json();
    let assets = result.data || [];
    
    // Apply search filters locally
    if (query) {
      const searchTerm = query.toLowerCase();
      assets = assets.filter((asset: any) => 
        asset.fileName?.toLowerCase().includes(searchTerm) ||
        asset.metadata?.description?.toLowerCase().includes(searchTerm) ||
        asset.metadata?.category?.toLowerCase().includes(searchTerm) ||
        asset.searchTags?.some((tag: string) => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filters.assetType?.length) {
      assets = assets.filter((asset: any) => filters.assetType!.includes(asset.assetType));
    }
    
    if (filters.category?.length) {
      assets = assets.filter((asset: any) => filters.category!.includes(asset.metadata?.category));
    }
    
    if (filters.creator) {
      assets = assets.filter((asset: any) => 
        asset.creatorAddress?.toLowerCase().includes(filters.creator!.toLowerCase())
      );
    }
    
    // Apply sorting
    switch (sort.field) {
      case 'createdAt':
        assets.sort((a: any, b: any) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sort.order === 'desc' ? dateB - dateA : dateA - dateB;
        });
        break;
      case 'downloadCount':
        assets.sort((a: any, b: any) => {
          const countA = a.downloadCount || 0;
          const countB = b.downloadCount || 0;
          return sort.order === 'desc' ? countB - countA : countA - countB;
        });
        break;
      default:
        // Keep original order for relevance
        break;
    }
    
    // Apply pagination
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedAssets = assets.slice(startIndex, endIndex);
    
    return {
      hits: paginatedAssets,
      total: assets.length,
      page,
      size,
      aggregations: {
        assetTypes: getAssetTypeAggregations(assets),
        categories: getCategoryAggregations(assets)
      }
    };
    
  } catch (error) {
    console.error('Fallback search failed:', error);
    // Return empty results instead of mock data
    return {
      results: [],
      total: 0,
      aggregations: {
        asset_type: { buckets: [] },
        category: { buckets: [] },
        creator: { buckets: [] }
      },
      suggestions: []
    };
  }
}

// Helper functions for aggregations
function getAssetTypeAggregations(assets: any[]) {
  const counts: Record<string, number> = {};
  assets.forEach(asset => {
    counts[asset.assetType] = (counts[asset.assetType] || 0) + 1;
  });
  return Object.entries(counts).map(([type, count]) => ({ key: type, doc_count: count }));
}

function getCategoryAggregations(assets: any[]) {
  const counts: Record<string, number> = {};
  assets.forEach(asset => {
    const category = asset.metadata?.category;
    if (category) {
      counts[category] = (counts[category] || 0) + 1;
    }
  });
  return Object.entries(counts).map(([category, count]) => ({ key: category, doc_count: count }));
}

async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];
  
  try {
    // Try suggestions API first
    const params = new URLSearchParams({ q: query });
    const response = await fetch(`${API_BASE_URL}/api/search/suggestions?${params.toString()}`);
    
    if (response.ok) {
      return response.json();
    }

    // Fallback: generate suggestions from real assets
    console.log('💡 Suggestions API not available, generating from assets...');
    
    const assetsResponse = await fetch(`${API_BASE_URL}/api/assets`);
    if (!assetsResponse.ok) {
      throw new Error('Failed to fetch assets');
    }
    
    const result = await assetsResponse.json();
    const assets = result.data || [];
    
    // Extract suggestions from asset data
    const suggestions = new Set<string>();
    const searchTerm = query.toLowerCase();
    
    assets.forEach((asset: any) => {
      // Add matching file names (without extension)
      const fileName = asset.fileName?.replace(/\.[^/.]+$/, "") || "";
      if (fileName.toLowerCase().includes(searchTerm)) {
        suggestions.add(fileName);
      }
      
      // Add matching categories
      if (asset.metadata?.category?.toLowerCase().includes(searchTerm)) {
        suggestions.add(asset.metadata.category);
      }
      
      // Add matching tags
      asset.searchTags?.forEach((tag: string) => {
        if (tag.toLowerCase().includes(searchTerm)) {
          suggestions.add(tag);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions

  } catch (error) {
    console.warn('Suggestions fetch failed:', error);
    return [];
  }
}

async function getTrendingAssets(timeframe: '1d' | '7d' | '30d' = '7d'): Promise<any[]> {
  try {
    // Try trending API first
    const params = new URLSearchParams({ timeframe });
    const response = await fetch(`${API_BASE_URL}/api/search/trending?${params.toString()}`);
    
    if (response.ok) {
      return response.json();
    }

    // Fallback: get recent assets from gallery API
    console.log('📊 Trending API not available, using recent assets...');
    
    const assetsResponse = await fetch(`${API_BASE_URL}/api/assets`);
    if (!assetsResponse.ok) {
      throw new Error('Failed to fetch assets');
    }
    
    const result = await assetsResponse.json();
    const assets = result.data || [];
    
    // Sort by creation date and take most recent as "trending"
    const sortedAssets = assets
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8); // Take top 8 recent assets
    
    return sortedAssets;

  } catch (error) {
    console.warn('Trending fetch failed:', error);
    return [];
  }
}

// React Query hooks
export function useSearchAssets(options: SearchOptions, queryOptions: any = {}) {
  return useQuery({
    queryKey: ['searchAssets', options],
    queryFn: () => searchAssets(options),
    enabled: true,
    staleTime: 30000, // 30 seconds
    cacheTime: 300000, // 5 minutes
    ...queryOptions,
  });
}

export function useSearchSuggestions(query: string, queryOptions: any = {}) {
  return useQuery({
    queryKey: ['searchSuggestions', query],
    queryFn: () => getSearchSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 60000, // 1 minute
    cacheTime: 300000, // 5 minutes
    ...queryOptions,
  });
}

export function useTrendingAssets(timeframe: '1d' | '7d' | '30d' = '7d', queryOptions: any = {}) {
  return useQuery({
    queryKey: ['trendingAssets', timeframe],
    queryFn: () => getTrendingAssets(timeframe),
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
    ...queryOptions,
  });
}

// Analytics function
export async function trackSearchAnalytics(query: string, results: number, userId?: string) {
  try {
    await fetch(`${API_BASE_URL}/api/search/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        results,
        timestamp: new Date().toISOString(),
        userId,
      }),
    });
  } catch (error) {
    console.warn('Failed to track search analytics:', error);
  }
}