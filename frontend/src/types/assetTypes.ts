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
  maxSize: number;
  mimeTypes: string[];
  category: string;
  subcategory?: string[];
  previewable: boolean;
  requiresProcessing: boolean;
  icon: string;
  description: string;
}

export const ASSET_TYPE_CONFIGS: Record<AssetType, AssetTypeConfig> = {
  [AssetType.IMAGE]: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    category: 'Visual',
    subcategory: ['Photography', 'Digital Art', 'Graphics', 'NFT Art'],
    previewable: true,
    requiresProcessing: false,
    icon: '🖼️',
    description: 'Images, photos, digital art, and graphics'
  },
  [AssetType.AUDIO]: {
    extensions: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a'],
    maxSize: 50 * 1024 * 1024, // 50MB
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg', 'audio/mp4'],
    category: 'Audio',
    subcategory: ['Music', 'Sound Effects', 'Podcasts', 'Voice Overs'],
    previewable: true,
    requiresProcessing: true,
    icon: '🎵',
    description: 'Audio files, music, sound effects, and voice recordings'
  },
  [AssetType.VIDEO]: {
    extensions: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    maxSize: 100 * 1024 * 1024, // 100MB
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
    category: 'Video',
    subcategory: ['Short Films', 'Animations', 'Tutorials', 'Stock Footage'],
    previewable: true,
    requiresProcessing: true,
    icon: '🎬',
    description: 'Video files, animations, and moving content'
  },
  [AssetType.DOCUMENT]: {
    extensions: ['.pdf', '.docx', '.txt', '.md', '.rtf'],
    maxSize: 20 * 1024 * 1024, // 20MB
    mimeTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown', 'application/rtf'],
    category: 'Documents',
    subcategory: ['Research Papers', 'Legal Documents', 'Creative Writing', 'Technical Docs'],
    previewable: true,
    requiresProcessing: true,
    icon: '📄',
    description: 'Documents, PDFs, text files, and written content'
  },
  [AssetType.MODEL_3D]: {
    extensions: ['.glb', '.gltf', '.fbx', '.obj', '.dae', '.blend'],
    maxSize: 50 * 1024 * 1024, // 50MB
    mimeTypes: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
    category: '3D Models',
    subcategory: ['Characters', 'Environments', 'Props', 'Vehicles', 'Architecture'],
    previewable: true,
    requiresProcessing: true,
    icon: '🧊',
    description: '3D models, sculptures, and dimensional assets'
  },
  [AssetType.DATASET]: {
    extensions: ['.csv', '.json', '.jsonl', '.parquet', '.xlsx'],
    maxSize: 100 * 1024 * 1024, // 100MB
    mimeTypes: ['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    category: 'Data',
    subcategory: ['Training Data', 'Research Data', 'Market Data', 'Survey Data'],
    previewable: true,
    requiresProcessing: true,
    icon: '📊',
    description: 'Datasets, CSV files, and structured data'
  },
  [AssetType.CODE]: {
    extensions: ['.js', '.ts', '.py', '.sol', '.rs', '.go', '.java', '.cpp', '.c', '.php', '.rb'],
    maxSize: 5 * 1024 * 1024, // 5MB
    mimeTypes: ['text/javascript', 'application/typescript', 'text/x-python', 'text/plain'],
    category: 'Code',
    subcategory: ['Smart Contracts', 'Libraries', 'Scripts', 'Templates', 'Frameworks'],
    previewable: true,
    requiresProcessing: true,
    icon: '💻',
    description: 'Source code, smart contracts, and software'
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
    duration?: number;
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
  licenseTermsIds?: string[];
  mintedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetPreview {
  file: File;
  preview: string;
  fileName: string;
  assetType: AssetType;
  duplicated?: boolean;
}

// Utility functions
export function getAssetTypeFromFile(file: File): AssetType | null {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  for (const [type, config] of Object.entries(ASSET_TYPE_CONFIGS)) {
    if (config.extensions.includes(extension)) {
      return type as AssetType;
    }
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function isFileTypeSupported(file: File): boolean {
  return getAssetTypeFromFile(file) !== null;
}

export function validateFileSize(file: File, assetType: AssetType): boolean {
  const config = ASSET_TYPE_CONFIGS[assetType];
  return file.size <= config.maxSize;
}

// Mock asset interface for compatibility
export interface MockAsset {
  assetId: string;
  title: string;
  description: string;
  creator: string;
  assetType: string;
  category: string;
  tags: string[];
  pinataUrl: string;
  thumbnailUrl: string;
  viewCount: number;
  downloadCount: number;
  popularityScore: number;
  createdAt: string;
  price: number;
  commercialUse: boolean;
  licenseType: string;
  qualityScore: number;
  metadata: {
    format: string;
    fileSize?: string;
  };
}

// Search-specific interfaces
export interface SearchAsset {
  assetId: string;
  title: string;
  description?: string;
  creator: string;
  creatorAddress: string;
  assetType: AssetType;
  category: string;
  tags: string[];
  fileName: string;
  fileSize: number;
  mimeType: string;
  ipfsHash: string;
  pinataUrl: string;
  thumbnailUrl?: string;
  metadata?: AssetMetadata;
  viewCount: number;
  downloadCount: number;
  likeCount: number;
  popularityScore: number;
  createdAt: string;
  updatedAt: string;
  price?: number;
  currency?: string;
  commercialUse?: boolean;
  _score?: number;
  _highlights?: any;
}