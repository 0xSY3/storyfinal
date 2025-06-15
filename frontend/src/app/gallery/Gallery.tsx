import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Copy,
  Grid3X3,
  List,
  Image,
  Video,
  Music,
  FileText,
  Box,
  Database,
  Code,
  Calendar,
  HardDrive,
  Eye,
  ExternalLink,
  DollarSign,
  Shield,
  TrendingUp,
  X,
  Users,
  Globe
} from "lucide-react";
import axios from "axios";
import { AssetType, Asset, ASSET_TYPE_CONFIGS } from "../../types/assetTypes";
import UniversalAssetPreview from "../../components/AssetPreviews/UniversalAssetPreview";
import VerificationBadge from "../../components/Verification/VerificationBadge";
import GalleryAssetDetailView from "../../components/AssetDetail/GalleryAssetDetailView";
import { useAssetVerification, useBatchVerification } from "../../hooks/useYakoaVerification";
import { useSearchAssets, SearchFilters as SearchFiltersType, SearchSort } from "../../hooks/useSearchAssets";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/utils";
import SearchBar from "../../components/Search/SearchBar";
import SearchFilters from "../../components/Search/SearchFilters";

interface GalleryProps {
  walletAddress: string | null;
}

const assetTypeIcons = {
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
  model_3d: Box,
  dataset: Database,
  code: Code,
};

const Gallery: React.FC<GalleryProps> = ({ walletAddress }) => {
  // Search and filter state
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [sort, setSort] = useState<SearchSort>({ field: 'createdAt', order: 'desc' });
  const [page, setPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [viewScope, setViewScope] = useState<'all' | 'my'>('all');

  // Apply user filter when in "my assets" mode
  const searchFilters = viewScope === 'my' && walletAddress ? 
    { ...filters, creator: walletAddress } : 
    filters;

  // Use search hook for all asset loading and searching
  const { data: searchResults, isLoading: searchLoading, error: searchError } = useSearchAssets({
    query,
    filters: searchFilters,
    sort,
    page,
    size: 24,
    aggregations: true,
  });

  // Current assets to display
  const currentAssets = searchResults?.hits || [];
  
  // Get verification status for all visible assets
  const assetIds = currentAssets.map((asset: Asset) => asset.id);
  const { data: verificationData } = useBatchVerification(assetIds, {
    enabled: assetIds.length > 0,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Search handlers
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (newSort: SearchSort) => {
    setSort(newSort);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleCopyFileName = (fileName: string) => {
    navigator.clipboard.writeText(fileName);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  const downloadAsset = (url: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = decodeURIComponent(fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenDetailView = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleCloseDetailView = () => {
    setSelectedAsset(null);
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                IP Asset Repository
              </h1>
              <p className="text-gray-600 text-lg">
                Discover, manage, and license intellectual property assets
              </p>
            </div>
          </div>
          
          {/* Scope Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex bg-white/80 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-green-200">
              <Button
                variant={viewScope === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewScope('all')}
                className={cn(
                  'flex items-center gap-2',
                  viewScope === 'all' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' : 'text-gray-700 hover:bg-green-50'
                )}
              >
                <Globe className="w-4 h-4" />
                All Assets
              </Button>
              {walletAddress && (
                <Button
                  variant={viewScope === 'my' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewScope('my')}
                  className={cn(
                    'flex items-center gap-2',
                    viewScope === 'my' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' : 'text-gray-700 hover:bg-green-50'
                  )}
                >
                  <Users className="w-4 h-4" />
                  My Assets
                </Button>
              )}
            </div>
            
            {searchResults && (
              <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                {searchResults.total.toLocaleString()} assets found
              </Badge>
            )}
          </div>
          
          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for images, audio, videos, datasets, and more..."
            initialValue={query}
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-6 shadow-md">
                <SearchFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  sort={sort}
                  onSortChange={handleSortChange}
                  aggregations={searchResults?.aggregations}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {searchLoading ? 'Searching...' : 
                   searchResults ? `${searchResults.total.toLocaleString()} results found` : 'Browse assets'}
                </p>
                {query && (
                  <p className="text-sm text-gray-600 mt-1">
                    for "{query}"
                  </p>
                )}
                {viewScope === 'my' && (
                  <p className="text-sm text-gray-600 mt-1">
                    showing your assets only
                  </p>
                )}
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-green-50'}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-green-50'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {searchLoading && (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className={`bg-gray-100 rounded-lg ${viewMode === 'grid' ? 'h-64' : 'h-32'} animate-pulse`}
                  />
                ))}
              </div>
            )}

            {/* Error State */}
            {searchError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-red-700 mb-2">
                  Search Error
                </h3>
                <p className="text-red-600">
                  Unable to load assets. Please try again later.
                </p>
              </div>
            )}

            {/* Results Grid */}
            {searchResults && !searchLoading && (
              <>
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {currentAssets.map((asset: Asset) => {
                    const verification = verificationData?.[asset.id];
                    const IconComponent = assetTypeIcons[asset.assetType as keyof typeof assetTypeIcons] || FileText;
                    
                    return (
                      <motion.div
                        key={asset.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-200/50 overflow-hidden hover:shadow-xl hover:border-green-300 transition-all duration-300 cursor-pointer group hover:scale-[1.02]",
                          viewMode === 'list' && "flex flex-row items-center"
                        )}
                        onClick={() => handleOpenDetailView(asset)}
                      >
                        {/* Asset Preview */}
                        <div className={cn(
                          "relative overflow-hidden",
                          viewMode === 'grid' ? "h-48" : "w-32 h-32 flex-shrink-0"
                        )}>
                          <UniversalAssetPreview asset={asset} />
                          
                          {/* Verification Badge */}
                          {verification && (
                            <div className="absolute top-2 right-2">
                              <VerificationBadge verification={verification} size="small" />
                            </div>
                          )}

                          {/* Asset Type Badge */}
                          <div className="absolute top-2 left-2">
                            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs shadow-md">
                              <IconComponent className="w-3 h-3 mr-1" />
                              {ASSET_TYPE_CONFIGS[asset.assetType]?.category || asset.assetType}
                            </Badge>
                          </div>
                        </div>

                        {/* Asset Info */}
                        <div className={cn(
                          "p-4",
                          viewMode === 'list' && "flex-1"
                        )}>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                              {decodeURIComponent(asset.fileName)}
                            </h3>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadAsset(
                                  `https://gateway.pinata.cloud/ipfs/${asset.cid}`,
                                  asset.fileName
                                );
                              }}
                              className="opacity-70 hover:opacity-100 transition-opacity"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(asset.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              {formatFileSize(asset.size)}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyFileName(asset.fileName);
                                }}
                                className="text-xs px-2 py-1 h-auto bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                Copy
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`https://gateway.pinata.cloud/ipfs/${asset.cid}`, '_blank');
                                }}
                                className="text-xs px-2 py-1 h-auto bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                IPFS
                              </Button>
                            </div>
                            
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetailView(asset);
                              }}
                              className="text-xs px-2 py-1 h-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {searchResults.total > 24 && (
                  <div className="flex justify-center mt-8">
                    <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-md">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="text-gray-700 hover:bg-gray-100 disabled:text-gray-400"
                        >
                          Previous
                        </Button>
                        <span className="text-sm font-medium text-gray-900 px-3">
                          Page {page} of {Math.ceil(searchResults.total / 24)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(Math.min(Math.ceil(searchResults.total / 24), page + 1))}
                          disabled={page === Math.ceil(searchResults.total / 24)}
                          className="text-gray-700 hover:bg-gray-100 disabled:text-gray-400"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Results */}
                {currentAssets.length === 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                      No assets found
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      {viewScope === 'my' 
                        ? "You haven't uploaded any assets yet. Head to the upload page to get started!"
                        : "Try adjusting your search terms or filters to find what you're looking for"}
                    </p>
                    <Button
                      onClick={() => {
                        setQuery('');
                        setFilters({});
                        setPage(1);
                      }}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <GalleryAssetDetailView
          asset={selectedAsset}
          verification={verificationData?.[selectedAsset.id]}
          isOpen={!!selectedAsset}
          onClose={handleCloseDetailView}
          walletAddress={walletAddress}
        />
      )}
    </div>
  );
};

export default Gallery;