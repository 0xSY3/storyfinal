export enum AssetType {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  DOCUMENT = 'document',
  MODEL_3D = 'model_3d',
  DATASET = 'dataset',
  CODE = 'code'
}

export interface AssetTypeConfig {
  extensions: string[];
  maxSize: number; // in bytes
  mimeTypes: string[];
  category: string;
  subcategory?: string[];
  previewable: boolean;
  requiresProcessing: boolean;
}

export const ASSET_TYPE_CONFIGS: Record<AssetType, AssetTypeConfig> = {
  [AssetType.IMAGE]: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    category: 'Visual',
    subcategory: ['Photography', 'Digital Art', 'Graphics', 'NFT Art'],
    previewable: true,
    requiresProcessing: false
  },
  [AssetType.AUDIO]: {
    extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
    maxSize: 50 * 1024 * 1024, // 50MB
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/mp4'],
    category: 'Audio',
    subcategory: ['Music', 'Sound Effects', 'Podcasts', 'Voice Overs'],
    previewable: true,
    requiresProcessing: true // for waveform generation
  },
  [AssetType.VIDEO]: {
    extensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    maxSize: 100 * 1024 * 1024, // 100MB
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
    category: 'Video',
    subcategory: ['Short Films', 'Animations', 'Tutorials', 'Stock Footage'],
    previewable: true,
    requiresProcessing: true // for thumbnail generation
  },
  [AssetType.DOCUMENT]: {
    extensions: ['.pdf', '.docx', '.txt', '.md', '.rtf'],
    maxSize: 20 * 1024 * 1024, // 20MB
    mimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/rtf'],
    category: 'Documents',
    subcategory: ['Research Papers', 'Legal Documents', 'Creative Writing', 'Technical Docs'],
    previewable: true,
    requiresProcessing: true // for text extraction and preview generation
  },
  [AssetType.MODEL_3D]: {
    extensions: ['.glb', '.gltf', '.fbx', '.obj', '.dae', '.blend'],
    maxSize: 50 * 1024 * 1024, // 50MB
    mimeTypes: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
    category: '3D Models',
    subcategory: ['Characters', 'Environments', 'Props', 'Vehicles', 'Architecture'],
    previewable: true,
    requiresProcessing: true // for thumbnail and metadata extraction
  },
  [AssetType.DATASET]: {
    extensions: ['.csv', '.json', '.jsonl', '.parquet', '.xlsx'],
    maxSize: 100 * 1024 * 1024, // 100MB
    mimeTypes: ['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    category: 'Data',
    subcategory: ['Training Data', 'Research Data', 'Market Data', 'Survey Data'],
    previewable: true,
    requiresProcessing: true // for data analysis and preview generation
  },
  [AssetType.CODE]: {
    extensions: ['.js', '.ts', '.py', '.sol', '.rs', '.go', '.java', '.cpp', '.c', '.php', '.rb'],
    maxSize: 5 * 1024 * 1024, // 5MB
    mimeTypes: ['text/javascript', 'application/typescript', 'text/x-python', 'text/plain'],
    category: 'Code',
    subcategory: ['Smart Contracts', 'Libraries', 'Scripts', 'Templates', 'Frameworks'],
    previewable: true,
    requiresProcessing: true // for syntax highlighting and analysis
  }
};

export interface AssetMetadata {
  fileName: string;
  mimeType: string;
  size: number;
  assetType: AssetType;
  dimensions?: {
    width?: number;
    height?: number;
    duration?: number; // for audio/video
  };
  tags: string[];
  description: string;
  category: string;
  subcategory?: string;
  processingData?: {
    thumbnailCid?: string;
    previewCid?: string;
    extractedText?: string;
    colorPalette?: string[];
    technicalSpecs?: Record<string, any>;
  };
  timestamp: string;
}

export interface Asset {
  id: string;
  cid: string;
  assetType: AssetType;
  fileName: string;
  mimeType: string;
  size: number;
  creatorAddress: string;
  metadata: AssetMetadata;
  searchTags: string[];
  authenticity?: {
    yakoaVerified: boolean;
    verificationScore?: number;
    verificationDate?: string;
    verificationId?: string;
  };
  ipId?: string;
  tokenId?: string;
  txHash?: string;
  licenseTermsIds?: string[];
  mintedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Utility functions
export function getAssetTypeFromMimeType(mimeType: string): AssetType | null {
  for (const [type, config] of Object.entries(ASSET_TYPE_CONFIGS)) {
    if (config.mimeTypes.includes(mimeType)) {
      return type as AssetType;
    }
  }
  return null;
}

export function getAssetTypeFromExtension(filename: string): AssetType | null {
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  for (const [type, config] of Object.entries(ASSET_TYPE_CONFIGS)) {
    if (config.extensions.includes(extension)) {
      return type as AssetType;
    }
  }
  return null;
}

export function validateAssetFile(file: { mimetype: string; originalname: string; size: number }): {
  valid: boolean;
  assetType?: AssetType;
  error?: string;
} {
  // Get asset type from both mime type and extension
  const typeFromMime = getAssetTypeFromMimeType(file.mimetype);
  const typeFromExt = getAssetTypeFromExtension(file.originalname);
  
  // Prefer extension-based detection as it's more reliable
  const assetType = typeFromExt || typeFromMime;
  
  if (!assetType) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.mimetype} (${file.originalname})`
    };
  }
  
  const config = ASSET_TYPE_CONFIGS[assetType];
  
  // Check file size
  if (file.size > config.maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size for ${assetType} is ${config.maxSize / (1024 * 1024)}MB`
    };
  }
  
  return {
    valid: true,
    assetType
  };
}