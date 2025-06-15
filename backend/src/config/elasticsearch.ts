import { Client } from '@elastic/elasticsearch';

// Elasticsearch configuration
export const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  auth: process.env.ELASTICSEARCH_USERNAME && process.env.ELASTICSEARCH_PASSWORD ? {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  } : undefined,
  // For development, allow self-signed certificates
  tls: {
    rejectUnauthorized: false,
  },
});

// Asset index configuration
export const ASSET_INDEX = 'story_ip_assets';

// Search index mapping for assets
export const assetIndexMapping = {
  mappings: {
    properties: {
      // Core asset properties
      assetId: { type: 'keyword' },
      ipId: { type: 'keyword' },
      title: {
        type: 'text',
        analyzer: 'standard',
        fields: {
          keyword: { type: 'keyword' },
          autocomplete: {
            type: 'search_as_you_type',
            max_shingle_size: 3,
          },
        },
      },
      description: {
        type: 'text',
        analyzer: 'standard',
      },
      creator: { type: 'keyword' },
      creatorAddress: { type: 'keyword' },
      
      // Asset type and metadata
      assetType: { type: 'keyword' },
      category: { type: 'keyword' },
      tags: { type: 'keyword' },
      
      // File properties
      fileName: {
        type: 'text',
        fields: { keyword: { type: 'keyword' } },
      },
      fileSize: { type: 'long' },
      mimeType: { type: 'keyword' },
      
      // IPFS and storage
      ipfsHash: { type: 'keyword' },
      pinataUrl: { type: 'keyword' },
      thumbnailUrl: { type: 'keyword' },
      
      // Story Protocol
      storyProtocolId: { type: 'keyword' },
      licenseTerms: { type: 'keyword' },
      commercialUse: { type: 'boolean' },
      
      // Pricing and licensing
      price: { type: 'float' },
      currency: { type: 'keyword' },
      royaltyPercentage: { type: 'float' },
      
      // Usage and analytics
      viewCount: { type: 'long' },
      downloadCount: { type: 'long' },
      likeCount: { type: 'long' },
      popularityScore: { type: 'float' },
      
      // Temporal data
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
      
      // Asset-specific metadata
      metadata: {
        type: 'object',
        properties: {
          // Image metadata
          width: { type: 'integer' },
          height: { type: 'integer' },
          format: { type: 'keyword' },
          
          // Audio/Video metadata
          duration: { type: 'float' },
          bitrate: { type: 'integer' },
          sampleRate: { type: 'integer' },
          
          // Document metadata
          pageCount: { type: 'integer' },
          wordCount: { type: 'integer' },
          
          // Code metadata
          language: { type: 'keyword' },
          framework: { type: 'keyword' },
          
          // Dataset metadata
          recordCount: { type: 'long' },
          columnCount: { type: 'integer' },
          dataFormat: { type: 'keyword' },
        },
      },
      
      // Geographic data
      location: { type: 'geo_point' },
      
      // Content analysis (AI-generated)
      contentAnalysis: {
        type: 'object',
        properties: {
          dominantColors: { type: 'keyword' },
          detectedObjects: { type: 'keyword' },
          sentiment: { type: 'keyword' },
          complexity: { type: 'float' },
          qualityScore: { type: 'float' },
        },
      },
    },
  },
  settings: {
    number_of_shards: 1,
    number_of_replicas: 1,
    analysis: {
      analyzer: {
        autocomplete: {
          tokenizer: 'autocomplete',
          filter: ['lowercase'],
        },
        autocomplete_search: {
          tokenizer: 'keyword',
          filter: ['lowercase'],
        },
      },
      tokenizer: {
        autocomplete: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 10,
          token_chars: ['letter'],
        },
      },
    },
  },
};

// Initialize Elasticsearch index
export async function initializeElasticsearch(): Promise<void> {
  try {
    // Check if the index exists
    const indexExists = await esClient.indices.exists({
      index: ASSET_INDEX,
    });

    if (!indexExists) {
      // Create the index with mapping
      await esClient.indices.create({
        index: ASSET_INDEX,
        ...assetIndexMapping,
      });
      console.log(`✅ Created Elasticsearch index: ${ASSET_INDEX}`);
    } else {
      console.log(`✅ Elasticsearch index already exists: ${ASSET_INDEX}`);
    }

    // Test connection
    const health = await esClient.cluster.health();
    console.log(`✅ Elasticsearch cluster health: ${health.status}`);
  } catch (error) {
    console.error('❌ Elasticsearch initialization failed:', error);
    console.log('⚠️  Continuing without search functionality');
  }
}

// Health check function
export async function checkElasticsearchHealth(): Promise<boolean> {
  try {
    await esClient.ping();
    return true;
  } catch (error) {
    console.error('Elasticsearch health check failed:', error);
    return false;
  }
}