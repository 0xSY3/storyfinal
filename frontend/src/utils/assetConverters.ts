import { MockAsset } from '../types/assetTypes';
import { SearchAsset, AssetType } from '../types/assetTypes';

const getMimeTypeFromFormat = (format: string): string => {
  const mimeTypes: Record<string, string> = {
    'PNG': 'image/png',
    'JPG': 'image/jpeg',
    'JPEG': 'image/jpeg',
    'GIF': 'image/gif',
    'WEBP': 'image/webp',
    'SVG': 'image/svg+xml',
    'MP3': 'audio/mpeg',
    'WAV': 'audio/wav',
    'FLAC': 'audio/flac',
    'AAC': 'audio/aac',
    'OGG': 'audio/ogg',
    'MP4': 'video/mp4',
    'MOV': 'video/quicktime',
    'AVI': 'video/x-msvideo',
    'MKV': 'video/x-matroska',
    'WEBM': 'video/webm',
    'PDF': 'application/pdf',
    'DOCX': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'TXT': 'text/plain',
    'MD': 'text/markdown',
    'RTF': 'application/rtf',
    'GLB': 'model/gltf-binary',
    'GLTF': 'model/gltf+json',
    'FBX': 'application/octet-stream',
    'OBJ': 'application/octet-stream',
    'DAE': 'application/octet-stream',
    'BLEND': 'application/octet-stream',
    'CSV': 'text/csv',
    'JSON': 'application/json',
    'JSONL': 'application/json',
    'PARQUET': 'application/octet-stream',
    'XLSX': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'JS': 'text/javascript',
    'TS': 'application/typescript',
    'PY': 'text/x-python',
    'SOL': 'text/plain',
    'RS': 'text/plain',
    'GO': 'text/plain',
    'JAVA': 'text/plain',
    'CPP': 'text/plain',
    'C': 'text/plain',
    'PHP': 'text/plain',
    'RB': 'text/plain',
    'ZIP': 'application/zip',
    'RAW': 'image/x-canon-crw',
  };
  
  return mimeTypes[format.toUpperCase()] || 'application/octet-stream';
};

const parseFileSize = (sizeString: string): number => {
  if (!sizeString) return 0;
  
  const sizeMatch = sizeString.match(/([0-9.]+)\s*(KB|MB|GB|Bytes?)/i);
  if (!sizeMatch) return 0;
  
  const [, size, unit] = sizeMatch;
  const numSize = parseFloat(size);
  
  switch (unit.toUpperCase()) {
    case 'GB':
      return numSize * 1024 * 1024 * 1024;
    case 'MB':
      return numSize * 1024 * 1024;
    case 'KB':
      return numSize * 1024;
    case 'BYTES':
    case 'BYTE':
    default:
      return numSize;
  }
};

const convertAssetType = (mockAssetType: string): AssetType => {
  const typeMap: Record<string, AssetType> = {
    'IMAGE': AssetType.IMAGE,
    'AUDIO': AssetType.AUDIO,
    'VIDEO': AssetType.VIDEO,
    'DOCUMENT': AssetType.DOCUMENT,
    'MODEL_3D': AssetType.MODEL_3D,
    'DATASET': AssetType.DATASET,
    'CODE': AssetType.CODE,
  };
  
  return typeMap[mockAssetType] || AssetType.IMAGE;
};

export const convertMockAssetToSearchAsset = (mockAsset: MockAsset): SearchAsset => {
  // Generate a mock creator address based on the asset ID
  const creatorAddress = '0x' + mockAsset.assetId.substring(mockAsset.assetId.length - 40).padStart(40, '0');
  
  // Generate filename from title and format
  const fileName = `${mockAsset.title.replace(/[^a-zA-Z0-9]/g, '_')}.${mockAsset.metadata.format.toLowerCase()}`;
  
  // Extract IPFS hash from pinataUrl
  const ipfsHash = mockAsset.pinataUrl.includes('ipfs/') 
    ? mockAsset.pinataUrl.split('ipfs/')[1] 
    : mockAsset.pinataUrl.split('/').pop() || '';
  
  return {
    assetId: mockAsset.assetId,
    title: mockAsset.title,
    description: mockAsset.description,
    creator: mockAsset.creator,
    creatorAddress: creatorAddress,
    assetType: convertAssetType(mockAsset.assetType),
    category: mockAsset.category,
    tags: mockAsset.tags,
    fileName: fileName,
    fileSize: parseFileSize(mockAsset.metadata.fileSize || '0'),
    mimeType: getMimeTypeFromFormat(mockAsset.metadata.format),
    ipfsHash: ipfsHash,
    pinataUrl: mockAsset.pinataUrl,
    thumbnailUrl: mockAsset.thumbnailUrl,
    viewCount: mockAsset.viewCount,
    downloadCount: mockAsset.downloadCount,
    likeCount: Math.floor(mockAsset.viewCount * 0.1), // Mock like count as 10% of views
    popularityScore: mockAsset.popularityScore,
    createdAt: mockAsset.createdAt,
    updatedAt: mockAsset.createdAt,
    price: mockAsset.price,
    currency: 'USD',
    commercialUse: mockAsset.commercialUse,
  };
};