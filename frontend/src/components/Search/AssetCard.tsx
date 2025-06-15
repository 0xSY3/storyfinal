"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Download,
  Star,
  Clock,
  Shield,
  User,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MockAsset } from "../../types/assetTypes";

interface AssetCardProps {
  asset: MockAsset;
  viewMode: 'grid' | 'list';
  highlights?: any;
  onView: (asset: MockAsset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  viewMode,
  highlights,
  onView,
}) => {
  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'Free';
    return `$${price.toFixed(2)}`;
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  const getAssetTypeColor = (type: string) => {
    const colors = {
      IMAGE: 'bg-blue-100 text-blue-800',
      AUDIO: 'bg-purple-100 text-purple-800', 
      VIDEO: 'bg-red-100 text-red-800',
      DOCUMENT: 'bg-orange-100 text-orange-800',
      MODEL_3D: 'bg-cyan-100 text-cyan-800',
      DATASET: 'bg-yellow-100 text-yellow-800',
      CODE: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLicenseColor = (license: string) => {
    const colors = {
      BASIC: 'bg-gray-100 text-gray-800',
      COMMERCIAL: 'bg-green-100 text-green-800',
      EXCLUSIVE: 'bg-purple-100 text-purple-800',
      CUSTOM: 'bg-blue-100 text-blue-800',
    };
    return colors[license as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
      >
        <div className="flex gap-6">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={asset.thumbnailUrl}
                alt={asset.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDI0MCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjAgNjVMMTc1IDE3NUg2NUwxMjAgNjVaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo=';
                }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-grow min-w-0 mr-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                  {asset.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {asset.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="w-4 h-4" />
                  <span>{asset.creator}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {formatPrice(asset.price)}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(asset.viewCount)}</span>
                  <Download className="w-4 h-4 ml-2" />
                  <span>{formatNumber(asset.downloadCount)}</span>
                </div>
              </div>
            </div>

            {/* Tags and Badges */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge className={getAssetTypeColor(asset.assetType)}>
                  {asset.assetType}
                </Badge>
                <Badge className={getLicenseColor(asset.licenseType)}>
                  {asset.licenseType}
                </Badge>
                {asset.commercialUse && (
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Commercial
                  </Badge>
                )}
              </div>
              
              <Button
                onClick={() => onView(asset)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                View Details
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-100 overflow-hidden">
        <img
          src={asset.thumbnailUrl}
          alt={asset.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNjAgNzBMMjAwIDEyMEgxMjBMMTYwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
          }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-grow min-w-0 mr-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
              {asset.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {asset.description}
            </p>
          </div>
          <div className="text-lg font-bold text-gray-900 flex-shrink-0">
            {formatPrice(asset.price)}
          </div>
        </div>

        {/* Creator and Stats */}
        <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span className="truncate">{asset.creator}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(asset.viewCount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{formatNumber(asset.downloadCount)}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getAssetTypeColor(asset.assetType)} variant="secondary">
            {asset.assetType}
          </Badge>
          <Badge className={getLicenseColor(asset.licenseType)} variant="secondary">
            {asset.licenseType}
          </Badge>
          {asset.commercialUse && (
            <Badge className="bg-green-100 text-green-800" variant="secondary">
              <Shield className="w-3 h-3 mr-1" />
              Commercial
            </Badge>
          )}
        </div>

        {/* Quality Score */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {(asset.qualityScore * 5).toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(asset.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Action Button */}
        <Button
          onClick={() => onView(asset)}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          View Details
          <ExternalLink className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </motion.div>
  );
};

export default AssetCard;