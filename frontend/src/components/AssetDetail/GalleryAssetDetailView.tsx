"use client";

import React, { useState } from "react";

// Extend window object for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Copy,
  Share2,
  Heart,
  Play,
  Calendar,
  User,
  FileType,
  HardDrive,
  ExternalLink,
  X,
  Shield,
  DollarSign,
  Wallet,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Eye,
  Tag,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UniversalAssetPreview from "../AssetPreviews/UniversalAssetPreview";
import VerificationBadge from "../Verification/VerificationBadge";
import CrossChainPayment from "../CrossChain/CrossChainPayment";
import IPRegistrationButton from "../IPRegistration/IPRegistrationButton";
import SuccessNotification from "../SuccessNotification";
import { Asset, ASSET_TYPE_CONFIGS } from "../../types/assetTypes";
import { YakoaVerificationResult } from "../../hooks/useYakoaVerification";
import { cn } from "@/lib/utils";
import { DEBRIDGE_CONFIG } from "../../config/deBridgeConfig";

interface GalleryAssetDetailViewProps {
  asset: Asset;
  verification?: YakoaVerificationResult | null;
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string | null;
}

const GalleryAssetDetailView: React.FC<GalleryAssetDetailViewProps> = ({
  asset,
  verification,
  isOpen,
  onClose,
  walletAddress,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'licensing' | 'verification'>('overview');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedLicenseType, setSelectedLicenseType] = useState<'BASIC' | 'COMMERCIAL' | 'EXCLUSIVE'>('COMMERCIAL');
  const [successNotificationOpen, setSuccessNotificationOpen] = useState(false);
  const [purchaseSubmissionId, setPurchaseSubmissionId] = useState<string>('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatAddress = (address: string) => {
    if (!address) return 'Unknown Address';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleCopyFileName = () => {
    navigator.clipboard.writeText(asset.fileName);
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = `https://gateway.pinata.cloud/ipfs/${asset.cid}`;
    a.download = decodeURIComponent(asset.fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleLicensePurchase = (licenseType: 'BASIC' | 'COMMERCIAL' | 'EXCLUSIVE') => {
    setSelectedLicenseType(licenseType);
    setPaymentModalOpen(true);
  };

  const getLicensePrice = (type: 'BASIC' | 'COMMERCIAL' | 'EXCLUSIVE') => {
    switch (type) {
      case 'BASIC': return DEBRIDGE_CONFIG.LICENSE_PRICING.BASIC;
      case 'COMMERCIAL': return DEBRIDGE_CONFIG.LICENSE_PRICING.COMMERCIAL;
      case 'EXCLUSIVE': return DEBRIDGE_CONFIG.LICENSE_PRICING.EXCLUSIVE;
      default: return 0;
    }
  };

  const assetTypeConfig = ASSET_TYPE_CONFIGS[asset.assetType];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="gallery-asset-detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="gallery-asset-modal"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  {assetTypeConfig.category}
                </Badge>
                {verification && (
                  <VerificationBadge verification={verification} size="small" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {decodeURIComponent(asset.fileName)}
                </h1>
                <p className="text-gray-600">by {formatAddress(asset.creatorAddress)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopyFileName();
                }}
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Name
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 min-h-0">
            {/* Left Panel - Asset Preview */}
            <div className="lg:w-1/2 p-6 border-r border-gray-200 flex flex-col">
              <div className="flex-1 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[500px] relative">
                <UniversalAssetPreview asset={asset} />
                
                {/* Verification Overlay */}
                {verification && (
                  <div className="absolute top-4 right-4">
                    <VerificationBadge verification={verification} showDetails={true} />
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-4 flex-shrink-0">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownload();
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(`https://gateway.pinata.cloud/ipfs/${asset.cid}`, '_blank');
                  }}
                  className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  IPFS
                </Button>
                {asset.ipId ? (
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      window.open(`https://explorer.story.foundation/ipa/${asset.ipId}`, '_blank');
                    }}
                    className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Story Explorer
                  </Button>
                ) : (
                  <IPRegistrationButton
                    asset={{
                      id: asset.id,
                      fileName: asset.fileName,
                      ipfsHash: asset.cid,
                      assetType: asset.assetType,
                      metadata: asset.metadata
                    }}
                    onSuccess={(ipId, txHash) => {
                      console.log('IP registration successful:', { ipId, txHash });
                      // Optionally refresh the page or update the asset
                      window.location.reload();
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Panel - Details */}
            <div className="lg:w-1/2 flex flex-col min-h-0">
              {/* Tab Navigation */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                  <TabsTrigger value="overview" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="licensing" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Licensing
                  </TabsTrigger>
                  <TabsTrigger value="verification" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Verification
                  </TabsTrigger>
                </TabsList>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  <TabsContent value="overview" className="p-6 space-y-6">
                    {/* Description */}
                    {asset.metadata.description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-600">{asset.metadata.description}</p>
                      </div>
                    )}

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <HardDrive className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">File Size</span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatFileSize(asset.size)}
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
                            <h4 className="font-semibold text-gray-900">Creator</h4>
                            <p className="text-sm text-gray-600 font-mono">{formatAddress(asset.creatorAddress)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tags */}
                    {asset.searchTags.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Tag className="w-4 h-4 text-gray-500" />
                          <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {asset.metadata.category}
                          </Badge>
                          {asset.searchTags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">File Name:</span>
                          <span className="font-mono text-gray-900 text-right max-w-48 truncate">
                            {decodeURIComponent(asset.fileName)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">MIME Type:</span>
                          <span className="font-mono text-gray-900">{asset.mimeType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">IPFS Hash:</span>
                          <span className="font-mono text-gray-900 truncate max-w-32">{asset.cid}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Asset ID:</span>
                          <span className="font-mono text-gray-900 truncate max-w-32">{asset.id}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="licensing" className="p-6 space-y-6">
                    {/* License Options */}
                    <div>
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">License Options</h3>
                        <p className="text-gray-600">Choose the license that best fits your intended use of this IP asset</p>
                      </div>
                      
                      <div className="grid gap-4">
                        {/* Basic License */}
                        <Card className="border-2 hover:border-green-300 transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900 text-lg">Basic License</h4>
                                  <Badge variant="outline" className="text-xs">Personal Use</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Perfect for personal projects and non-commercial use</p>
                                <ul className="text-xs text-gray-500 space-y-1">
                                  <li>• Personal use only</li>
                                  <li>• No commercial applications</li>
                                  <li>• Attribution required</li>
                                  <li>• No redistribution</li>
                                </ul>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-green-600 mb-2">
                                  {getLicensePrice('BASIC') === 0 ? 'FREE' : `$${getLicensePrice('BASIC')}`}
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleLicensePurchase('BASIC');
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Get License
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Commercial License */}
                        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-green-900 text-lg">Commercial License</h4>
                                  <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                                </div>
                                <p className="text-sm text-green-700 mb-3">Full commercial rights with cross-chain payment support</p>
                                <ul className="text-xs text-green-600 space-y-1">
                                  <li>• Full commercial use</li>
                                  <li>• Resale and distribution allowed</li>
                                  <li>• Cross-chain payments via deBridge</li>
                                  <li>• Instant Story Protocol verification</li>
                                  <li>• Royalty tracking & revenue sharing</li>
                                </ul>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-green-600 mb-1">${getLicensePrice('COMMERCIAL')}</div>
                                <div className="text-xs text-green-600 mb-2">Pay from any chain</div>
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleLicensePurchase('COMMERCIAL');
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Purchase Now
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Exclusive License */}
                        <Card className="border-2 hover:border-purple-300 transition-all duration-200 hover:shadow-md">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900 text-lg">Exclusive License</h4>
                                  <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">Premium</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">Exclusive rights with complete control over the IP asset</p>
                                <ul className="text-xs text-gray-500 space-y-1">
                                  <li>• Exclusive usage rights</li>
                                  <li>• Block others from licensing</li>
                                  <li>• Full derivative work control</li>
                                  <li>• Priority creator support</li>
                                  <li>• Transferable ownership</li>
                                </ul>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold text-purple-600 mb-1">${getLicensePrice('EXCLUSIVE')}</div>
                                <div className="text-xs text-purple-600 mb-2">One-time purchase</div>
                                <Button 
                                  size="sm" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleLicensePurchase('EXCLUSIVE');
                                  }}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  Purchase
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Cross-Chain Payment Info */}
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-blue-900">🌉 Cross-Chain Payments</h4>
                            <p className="text-sm text-blue-700">Pay from any supported blockchain network</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                          {[
                            { name: 'Ethereum', symbol: 'ETH' },
                            { name: 'Polygon', symbol: 'MATIC' },
                            { name: 'BSC', symbol: 'BNB' },
                            { name: 'Arbitrum', symbol: 'ARB' },
                            { name: 'Optimism', symbol: 'OP' },
                            { name: 'Base', symbol: 'BASE' }
                          ].map((chain) => (
                            <div key={chain.name} className="p-3 bg-white/80 rounded-lg text-center hover:bg-white transition-colors">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full mx-auto mb-1 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{chain.symbol[0]}</span>
                              </div>
                              <p className="text-xs font-medium text-blue-900">{chain.name}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-3">
                          <div className="bg-blue-100 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="w-4 h-4 text-blue-700" />
                              <span className="text-sm font-semibold text-blue-900">Powered by deBridge Protocol</span>
                            </div>
                            <p className="text-xs text-blue-800">
                              Seamless cross-chain payments with automatic token bridging. Pay with ETH, USDC, USDT, 
                              or native tokens from any supported chain. Payments are automatically converted to WIP tokens 
                              and delivered to Story Protocol.
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="flex items-center gap-2 text-blue-700">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Instant execution</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-700">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Low fees</span>
                            </div>
                            <div className="flex items-center gap-2 text-blue-700">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span>Secure & trusted</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="verification" className="p-6 space-y-4 h-full">
                    {verification ? (
                      <>
                        {/* Yakoa Verification Overview */}
                        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                  <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-blue-900">Yakoa Content Verification</h3>
                                  <p className="text-sm text-blue-700">Comprehensive IP infringement analysis</p>
                                </div>
                              </div>
                              <VerificationBadge verification={verification} showDetails={false} />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Trust Score */}
                              <div className="bg-white/80 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm font-medium text-gray-700">Trust Score</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        verification.trustScore >= 0.8 ? 'bg-green-500' : 
                                        verification.trustScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${verification.trustScore * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-lg font-bold text-gray-900">
                                    {Math.round(verification.trustScore * 100)}%
                                  </span>
                                </div>
                              </div>

                              {/* Verification Status */}
                              <div className="bg-white/80 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Eye className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm font-medium text-gray-700">Status</span>
                                </div>
                                <Badge className={cn(
                                  "text-xs",
                                  verification.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                  verification.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  verification.verificationStatus === 'flagged' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                )}>
                                  {verification.verificationStatus.charAt(0).toUpperCase() + verification.verificationStatus.slice(1)}
                                </Badge>
                              </div>

                              {/* Media Results */}
                              <div className="bg-white/80 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <FileType className="w-4 h-4 text-purple-600" />
                                  <span className="text-sm font-medium text-gray-700">Media Check</span>
                                </div>
                                <p className="text-sm text-gray-900">
                                  {verification.mediaResults?.length || 0} files scanned
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Detailed Analysis */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Infringement Analysis */}
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                                <h4 className="font-semibold text-gray-900">Infringement Analysis</h4>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-700">External Infringements</span>
                                  <Badge variant="outline" className={
                                    verification.infringements.external.length === 0 ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300'
                                  }>
                                    {verification.infringements.external.length}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <span className="text-sm text-gray-700">Network Infringements</span>
                                  <Badge variant="outline" className={
                                    verification.infringements.inNetwork.length === 0 ? 'text-green-700 border-green-300' : 'text-red-700 border-red-300'
                                  }>
                                    {verification.infringements.inNetwork.length}
                                  </Badge>
                                </div>
                                
                                {verification.infringements.external.length === 0 && verification.infringements.inNetwork.length === 0 && (
                                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-800">No infringements detected</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>

                          {/* Authorizations */}
                          <Card>
                            <CardContent className="p-6">
                              <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-green-600" />
                                <h4 className="font-semibold text-gray-900">Authorizations</h4>
                              </div>
                              
                              <div className="space-y-3">
                                {verification.authorizations.length > 0 ? (
                                  verification.authorizations.map((auth, index) => (
                                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                                      <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="font-medium text-green-900">
                                          {auth.brand_name || 'Platform Authorization'}
                                        </span>
                                      </div>
                                      <p className="text-xs text-green-700">
                                        Type: {auth.data.type} {auth.data.reason && `- ${auth.data.reason}`}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">No special authorizations</span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Media Results Details */}
                        {verification.mediaResults && verification.mediaResults.length > 0 && (
                          <Card>
                            <CardContent className="p-4">
                              <h4 className="font-semibold text-gray-900 mb-3">Media Verification Details</h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {verification.mediaResults.map((media, index) => (
                                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">Media ID: {media.mediaId}</p>
                                        <p className="text-sm text-gray-600">Fetch Status: {media.fetchStatus}</p>
                                      </div>
                                      <Badge className={cn(
                                        "ml-2",
                                        media.infringementStatus === 'clean' ? 'bg-green-100 text-green-800' :
                                        media.infringementStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                      )}>
                                        {media.infringementStatus}
                                      </Badge>
                                    </div>
                                    
                                    {media.confidence !== undefined && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-sm text-gray-600">Confidence:</span>
                                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <div 
                                            className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                            style={{ width: `${media.confidence * 100}%` }}
                                          />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                          {Math.round(media.confidence * 100)}%
                                        </span>
                                      </div>
                                    )}
                                    
                                    {media.brandMatches && media.brandMatches.length > 0 && (
                                      <div className="mt-2">
                                        <span className="text-sm text-gray-600">Brand Matches:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {media.brandMatches.map((brand, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {brand}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Token ID Information */}
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Yakoa Token Information</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Token ID:</span>
                                <div className="flex items-center gap-2">
                                  <code className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded text-xs max-w-48 truncate">
                                    {verification.tokenId}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigator.clipboard.writeText(verification.tokenId)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Verification Date:</span>
                                <span className="font-mono text-gray-900">{formatDate(asset.createdAt)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Last Updated:</span>
                                <span className="font-mono text-gray-900">{formatDate(asset.createdAt)}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            Verification In Progress
                          </h3>
                          <p className="text-gray-600 mb-4">
                            This asset is currently being processed by Yakoa verification system.
                          </p>
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left max-w-md mx-auto">
                            <h4 className="font-semibold text-blue-900 mb-2">What we're checking:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Content authenticity analysis</li>
                              <li>• Brand and trademark infringement</li>
                              <li>• Cross-platform duplicate detection</li>
                              <li>• IP ownership verification</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Cross-Chain Payment Modal */}
      {paymentModalOpen && (
        <CrossChainPayment
          asset={{
            id: asset.id,
            fileName: decodeURIComponent(asset.fileName),
            creatorAddress: asset.creatorAddress,
            assetType: asset.assetType,
            metadata: asset.metadata,
            cid: asset.cid,
          }}
          licenseType={selectedLicenseType}
          basePrice={getLicensePrice(selectedLicenseType)}
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          walletAddress={walletAddress}
          onSuccess={(orderId) => {
            console.log('Payment successful:', orderId);
            setPaymentModalOpen(false);
            setPurchaseSubmissionId(orderId);
            setSuccessNotificationOpen(true);
          }}
        />
      )}

      {/* Success Notification */}
      <SuccessNotification
        isOpen={successNotificationOpen}
        onClose={() => setSuccessNotificationOpen(false)}
        submissionId={purchaseSubmissionId}
        onViewLicenses={() => {
          setSuccessNotificationOpen(false);
          window.location.href = '/licenses';
        }}
      />
    </AnimatePresence>
  );
};

export default GalleryAssetDetailView;