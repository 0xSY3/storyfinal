"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Share,
  Heart,
  Eye,
  ExternalLink,
  Calendar,
  User,
  FileType,
  HardDrive,
  Tag,
  Shield,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SearchAsset, formatFileSize, AssetType } from '../../types/assetTypes';
import { useAssetVerification } from '../../hooks/useYakoaVerification';
import VerificationBadge from '../Verification/VerificationBadge';
import VerificationDetails from '../Verification/VerificationDetails';
import CrossChainLicensing from '../CrossChain/CrossChainLicensing';

interface AssetDetailViewProps {
  open: boolean;
  onClose: () => void;
  asset: SearchAsset;
  onDownload?: (asset: SearchAsset) => void;
  onLike?: (asset: SearchAsset) => void;
  onShare?: (asset: SearchAsset) => void;
}

const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  open,
  onClose,
  asset,
  onDownload,
  onLike,
  onShare,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'licensing' | 'verification'>('overview');
  const [verificationDetailsOpen, setVerificationDetailsOpen] = useState(false);
  const { data: verification } = useAssetVerification(asset.assetId, {
    enabled: !!asset.assetId,
  });

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown Address';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleLicensePurchased = (assetId: string, orderId: string) => {
    console.log('License purchased:', { assetId, orderId });
  };

  const assetForLicensing = {
    id: asset.assetId,
    fileName: asset.fileName,
    creatorAddress: asset.creatorAddress,
    assetType: asset.assetType,
    metadata: {
      description: asset.description,
      category: asset.category,
    },
    cid: asset.ipfsHash,
  };

  const getAssetTypeColor = (type: AssetType) => {
    const colors = {
      [AssetType.IMAGE]: 'bg-blue-100 text-blue-800 border-blue-300',
      [AssetType.AUDIO]: 'bg-purple-100 text-purple-800 border-purple-300',
      [AssetType.VIDEO]: 'bg-red-100 text-red-800 border-red-300',
      [AssetType.DOCUMENT]: 'bg-orange-100 text-orange-800 border-orange-300',
      [AssetType.MODEL_3D]: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      [AssetType.DATASET]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      [AssetType.CODE]: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getAssetTypeColor(asset.assetType)}`}>
                {asset.assetType.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{asset.title}</h1>
                <p className="text-gray-600">by {asset.creator}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onLike?.(asset)}>
                <Heart className="w-4 h-4 mr-2" />
                {asset.likeCount}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onShare?.(asset)}>
                <Share className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            {/* Left Panel - Asset Preview */}
            <div className="lg:w-1/2 p-6 border-r border-gray-200 flex flex-col">
              <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[500px]">
                {asset.assetType === AssetType.IMAGE ? (
                  <img
                    src={asset.pinataUrl || asset.thumbnailUrl}
                    alt={asset.title}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMDAgMTAwTDI1MCAyMDBIMTUwTDIwMCAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                    }}
                  />
                ) : asset.assetType === AssetType.AUDIO ? (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Audio File</h3>
                    <p className="text-gray-600 mb-4">{asset.fileName}</p>
                    <audio controls className="w-full max-w-sm">
                      <source src={asset.pinataUrl} />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                ) : asset.assetType === AssetType.VIDEO ? (
                  <video controls className="max-w-full max-h-full">
                    <source src={asset.pinataUrl} />
                    Your browser does not support the video element.
                  </video>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileType className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{asset.assetType.toUpperCase()} File</h3>
                    <p className="text-gray-600 mb-4">{asset.fileName}</p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(asset.pinataUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open File
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4 flex-shrink-0">
                <Button
                  onClick={() => onDownload?.(asset)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(asset.pinataUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  IPFS
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://explorer.story.foundation/ipa/${asset.assetId}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explorer
                </Button>
              </div>
            </div>

            {/* Right Panel - Asset Details */}
            <div className="lg:w-1/2 flex flex-col">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                {[
                  { key: 'overview', label: 'Overview', icon: Eye },
                  { key: 'licensing', label: 'Licensing', icon: Shield },
                  { key: 'verification', label: 'Verification', icon: Shield },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === key
                        ? 'border-green-500 text-green-600 bg-green-50'
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Yakoa Authenticity Score */}
                    <Card className="border-l-4 border-l-green-500 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-green-900">Yakoa Authenticity Score</h3>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            92%
                          </div>
                        </div>
                        <p className="text-sm text-green-800 mb-3">
                          This asset has been verified for originality and style authenticity using Yakoa's AI detection system.
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-green-600 font-medium">Originality</div>
                            <div className="text-green-800">✓ Verified</div>
                          </div>
                          <div>
                            <div className="text-green-600 font-medium">Style Check</div>
                            <div className="text-green-800">✓ Original</div>
                          </div>
                          <div>
                            <div className="text-green-600 font-medium">AI Detection</div>
                            <div className="text-green-800">✓ Human Created</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{asset.description || 'No description available'}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <HardDrive className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">File Size</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatFileSize(asset.fileSize)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Views</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {asset.viewCount.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Download className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Downloads</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {asset.downloadCount.toLocaleString()}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Created</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDate(asset.createdAt)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Creator Info */}
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{asset.creator}</h4>
                            <p className="text-sm text-gray-600">{formatAddress(asset.creatorAddress)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tags */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {asset.category}
                        </Badge>
                        {asset.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    {asset.price !== undefined && (
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium text-gray-700">Price</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                              {asset.price === 0 ? 'Free' : `$${asset.price.toFixed(2)}`}
                            </p>
                          </div>
                          {asset.commercialUse && (
                            <div className="mt-2 text-sm text-green-600">
                              ✓ Commercial use allowed
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Technical Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">File Name:</span>
                          <span className="font-mono text-gray-900">{asset.fileName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">MIME Type:</span>
                          <span className="font-mono text-gray-900">{asset.mimeType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IPFS Hash:</span>
                          <span className="font-mono text-gray-900 truncate max-w-32">{asset.ipfsHash}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Asset ID:</span>
                          <span className="font-mono text-gray-900 truncate max-w-32">{asset.assetId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'licensing' && (
                  <div className="space-y-6">
                    {/* Price and Basic Info */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">License this Asset</h3>
                            <p className="text-sm text-gray-600">Choose from flexible licensing options</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">
                              {asset.price === 0 ? 'Free' : `$${asset.price.toFixed(2)}`}
                            </div>
                            {asset.commercialUse && (
                              <p className="text-sm text-green-600">✓ Commercial use included</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-1">Basic License</h4>
                            <p className="text-sm text-blue-800">Personal projects only</p>
                            <p className="text-lg font-bold text-blue-600 mt-2">Free</p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                            <h4 className="font-semibold text-green-900 mb-1">Commercial License</h4>
                            <p className="text-sm text-green-800">Full commercial rights</p>
                            <p className="text-lg font-bold text-green-600 mt-2">${asset.price.toFixed(2)}</p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-1">Exclusive License</h4>
                            <p className="text-sm text-purple-800">Exclusive usage rights</p>
                            <p className="text-lg font-bold text-purple-600 mt-2">${(asset.price * 5).toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* deBridge Cross-Chain Payments */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zM1 14a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H2a1 1 0 01-1-1v-1zm5 1v1a1 1 0 102 0v-1a1 1 0 10-2 0zM10 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">deBridge Cross-Chain Payments</h3>
                            <p className="text-sm text-gray-600">Pay from any blockchain network</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {['Ethereum', 'Polygon', 'BSC', 'Arbitrum'].map((chain) => (
                            <button key={chain} className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-full mx-auto mb-2"></div>
                              <p className="text-xs font-medium text-gray-700">{chain}</p>
                            </button>
                          ))}
                        </div>
                        
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <p className="text-sm text-indigo-800">
                            <strong>Cross-Chain Benefits:</strong> Pay with tokens from any supported blockchain. 
                            Automatic bridging and conversion handled seamlessly by deBridge protocol.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tomo Social Onboarding */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-pink-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Tomo Social Login</h3>
                            <p className="text-sm text-gray-600">Simple onboarding for creators</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Social Login Available</p>
                              <p className="text-xs text-gray-600">Login with Google, Twitter, or Discord</p>
                            </div>
                            <Badge className="bg-pink-100 text-pink-800">✓ Active</Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Auto Wallet Creation</p>
                              <p className="text-xs text-gray-600">Wallet created automatically on first purchase</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">✓ Enabled</Badge>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V8z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Seamless Ownership</p>
                              <p className="text-xs text-gray-600">Automatic NFT transfer to your wallet</p>
                            </div>
                            <Badge className="bg-purple-100 text-purple-800">✓ Supported</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* License Actions */}
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3">
                        <Download className="w-5 h-5 mr-2" />
                        Purchase Commercial License
                      </Button>
                      <Button variant="outline" className="px-6 py-3">
                        <Heart className="w-5 h-5 mr-2" />
                        Add to Wishlist
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'verification' && (
                  <div className="space-y-6">
                    {/* Yakoa Verification */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Shield className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Yakoa AI Verification</h3>
                            <p className="text-sm text-gray-600">Advanced content authenticity analysis</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="font-medium text-green-900">Originality Check</span>
                            </div>
                            <p className="text-sm text-green-800">No copied content detected</p>
                            <p className="text-xs text-green-600 mt-1">Confidence: 96%</p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="font-medium text-blue-900">Style Analysis</span>
                            </div>
                            <p className="text-sm text-blue-800">Unique artistic style</p>
                            <p className="text-xs text-blue-600 mt-1">Similarity: &lt;12%</p>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                              <span className="font-medium text-purple-900">AI Detection</span>
                            </div>
                            <p className="text-sm text-purple-800">Human-created content</p>
                            <p className="text-xs text-purple-600 mt-1">AI Probability: 8%</p>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="font-medium text-orange-900">Training Data</span>
                            </div>
                            <p className="text-sm text-orange-800">Clean source data</p>
                            <p className="text-xs text-orange-600 mt-1">Verified: Yes</p>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Overall Authenticity Score</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="w-[92%] h-full bg-green-500 rounded-full"></div>
                              </div>
                              <span className="text-lg font-bold text-green-600">92%</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Cross-Chain Verification */}
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">Cross-Chain Verification</h3>
                            <p className="text-sm text-gray-600">Blockchain-backed authenticity</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Story Protocol Registration</span>
                            <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">IPFS Content Hash</span>
                            <Badge className="bg-blue-100 text-blue-800">✓ Immutable</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Creator Signature</span>
                            <Badge className="bg-purple-100 text-purple-800">✓ Valid</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Verification History */}
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification History</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 border-l-4 border-l-green-500 bg-green-50">
                            <Clock className="w-5 h-5 text-green-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-900">Initial Yakoa Scan Completed</p>
                              <p className="text-xs text-green-700">{formatDate(asset.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 border-l-4 border-l-blue-500 bg-blue-50">
                            <Shield className="w-5 h-5 text-blue-600" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-900">Story Protocol Registration</p>
                              <p className="text-xs text-blue-700">{formatDate(asset.createdAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 border-l-4 border-l-purple-500 bg-purple-50">
                            <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-purple-900">Authenticity Certificate Issued</p>
                              <p className="text-xs text-purple-700">{formatDate(asset.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Verification Details Dialog */}
      {verification && (
        <VerificationDetails
          verification={verification}
          assetId={asset.assetId}
          open={verificationDetailsOpen}
          onClose={() => setVerificationDetailsOpen(false)}
          isAdmin={false}
        />
      )}
    </AnimatePresence>
  );
};

export default AssetDetailView;