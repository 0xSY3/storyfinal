import { esClient, ASSET_INDEX } from '../config/elasticsearch';
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
  location?: { lat: number; lon: number; distance: string };
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
  suggestions?: string[];
}

/**
 * Search assets in Elasticsearch
 */
export async function searchAssets(options: SearchOptions): Promise<SearchResponse> {
  const {
    query = '',
    filters = {},
    sort = { field: 'relevance', order: 'desc' },
    page = 1,
    size = 20,
    aggregations = false,
  } = options;

  const from = (page - 1) * size;

  // Build Elasticsearch query
  const esQuery: any = {
    index: ASSET_INDEX,
    body: {
      from,
      size,
      query: buildSearchQuery(query, filters),
      sort: buildSortQuery(sort),
      highlight: {
        fields: {
          title: {},
          description: {},
          tags: {},
        },
      },
    },
  };

  // Add aggregations if requested
  if (aggregations) {
    esQuery.body.aggs = buildAggregations();
  }

  try {
    const response = await esClient.search(esQuery);
    
    return {
      hits: response.hits.hits.map((hit: any) => ({
        ...hit._source,
        _score: hit._score,
        _highlights: hit.highlight,
      })),
      total: response.hits.total.value,
      page,
      size,
      aggregations: response.aggregations,
    };
  } catch (error) {
    console.error('Search error:', error);
    throw new Error('Search service unavailable');
  }
}

/**
 * Get search suggestions/autocomplete
 */
export async function getSearchSuggestions(query: string): Promise<string[]> {
  if (!query || query.length < 2) return [];

  try {
    const response = await esClient.search({
      index: ASSET_INDEX,
      body: {
        size: 0,
        suggest: {
          title_suggest: {
            text: query,
            completion: {
              field: 'title.autocomplete',
              size: 10,
            },
          },
        },
      },
    });

    return response.suggest?.title_suggest?.[0]?.options?.map((option: any) => option.text) || [];
  } catch (error) {
    console.error('Suggestion error:', error);
    return [];
  }
}

/**
 * Index an asset document
 */
export async function indexAsset(assetData: any): Promise<void> {
  try {
    await esClient.index({
      index: ASSET_INDEX,
      id: assetData.assetId,
      body: {
        ...assetData,
        createdAt: new Date(),
        updatedAt: new Date(),
        popularityScore: calculatePopularityScore(assetData),
      },
    });
  } catch (error) {
    console.error('Indexing error:', error);
    throw new Error('Failed to index asset');
  }
}

/**
 * Update asset document
 */
export async function updateAssetIndex(assetId: string, updates: any): Promise<void> {
  try {
    await esClient.update({
      index: ASSET_INDEX,
      id: assetId,
      body: {
        doc: {
          ...updates,
          updatedAt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Update indexing error:', error);
    throw new Error('Failed to update asset index');
  }
}

/**
 * Delete asset from index
 */
export async function deleteAssetFromIndex(assetId: string): Promise<void> {
  try {
    await esClient.delete({
      index: ASSET_INDEX,
      id: assetId,
    });
  } catch (error) {
    console.error('Delete indexing error:', error);
    throw new Error('Failed to delete asset from index');
  }
}

/**
 * Get trending assets
 */
export async function getTrendingAssets(timeframe: '1d' | '7d' | '30d' = '7d'): Promise<any[]> {
  const now = new Date();
  const fromDate = new Date(now.getTime() - getTimeframeMs(timeframe));

  try {
    const response = await esClient.search({
      index: ASSET_INDEX,
      body: {
        size: 20,
        query: {
          range: {
            createdAt: {
              gte: fromDate.toISOString(),
            },
          },
        },
        sort: [
          { popularityScore: { order: 'desc' } },
          { viewCount: { order: 'desc' } },
          { createdAt: { order: 'desc' } },
        ],
      },
    });

    return response.hits.hits.map((hit: any) => hit._source);
  } catch (error) {
    console.error('Trending assets error:', error);
    return [];
  }
}

// Helper functions

function buildSearchQuery(query: string, filters: SearchFilters): any {
  const must: any[] = [];
  const filter: any[] = [];

  // Text search
  if (query) {
    must.push({
      multi_match: {
        query,
        fields: [
          'title^3',
          'title.autocomplete^2',
          'description^2',
          'tags^2',
          'creator',
          'fileName',
        ],
        type: 'best_fields',
        fuzziness: 'AUTO',
      },
    });
  }

  // Filters
  if (filters.assetType?.length) {
    filter.push({ terms: { assetType: filters.assetType } });
  }

  if (filters.category?.length) {
    filter.push({ terms: { category: filters.category } });
  }

  if (filters.tags?.length) {
    filter.push({ terms: { tags: filters.tags } });
  }

  if (filters.creator) {
    filter.push({ term: { creatorAddress: filters.creator } });
  }

  if (filters.commercialUse !== undefined) {
    filter.push({ term: { commercialUse: filters.commercialUse } });
  }

  if (filters.priceRange) {
    const priceFilter: any = {};
    if (filters.priceRange.min !== undefined) priceFilter.gte = filters.priceRange.min;
    if (filters.priceRange.max !== undefined) priceFilter.lte = filters.priceRange.max;
    filter.push({ range: { price: priceFilter } });
  }

  if (filters.dateRange) {
    const dateFilter: any = {};
    if (filters.dateRange.from) dateFilter.gte = filters.dateRange.from;
    if (filters.dateRange.to) dateFilter.lte = filters.dateRange.to;
    filter.push({ range: { createdAt: dateFilter } });
  }

  if (filters.minQualityScore) {
    filter.push({
      range: {
        'contentAnalysis.qualityScore': { gte: filters.minQualityScore },
      },
    });
  }

  if (filters.location) {
    filter.push({
      geo_distance: {
        distance: filters.location.distance,
        location: {
          lat: filters.location.lat,
          lon: filters.location.lon,
        },
      },
    });
  }

  return {
    bool: {
      must: must.length ? must : [{ match_all: {} }],
      filter,
    },
  };
}

function buildSortQuery(sort: SearchSort): any[] {
  if (sort.field === 'relevance') {
    return [{ _score: { order: 'desc' } }];
  }

  return [{ [sort.field]: { order: sort.order } }];
}

function buildAggregations(): any {
  return {
    assetTypes: {
      terms: { field: 'assetType', size: 10 },
    },
    categories: {
      terms: { field: 'category', size: 20 },
    },
    creators: {
      terms: { field: 'creator', size: 20 },
    },
    priceRanges: {
      range: {
        field: 'price',
        ranges: [
          { to: 10 },
          { from: 10, to: 50 },
          { from: 50, to: 100 },
          { from: 100, to: 500 },
          { from: 500 },
        ],
      },
    },
    dateHistogram: {
      date_histogram: {
        field: 'createdAt',
        calendar_interval: 'month',
      },
    },
  };
}

function calculatePopularityScore(assetData: any): number {
  const views = assetData.viewCount || 0;
  const downloads = assetData.downloadCount || 0;
  const likes = assetData.likeCount || 0;
  const quality = assetData.contentAnalysis?.qualityScore || 0.5;
  
  // Weighted popularity calculation
  return (views * 0.3 + downloads * 0.4 + likes * 0.2 + quality * 0.1);
}

function getTimeframeMs(timeframe: string): number {
  switch (timeframe) {
    case '1d': return 24 * 60 * 60 * 1000;
    case '7d': return 7 * 24 * 60 * 60 * 1000;
    case '30d': return 30 * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}