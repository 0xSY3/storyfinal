"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Eye,
  Download,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrendingAssets } from "../../hooks/useSearchAssets";
import { MockAsset } from "../../types/assetTypes";

interface TrendingSectionProps {
  onAssetClick?: (asset: MockAsset) => void;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ onAssetClick }) => {
  const [timeframe, setTimeframe] = useState<'1d' | '7d' | '30d'>('7d');
  const { data: trendingAssets, isLoading } = useTrendingAssets(timeframe);

  const formatNumber = (num: number) => {
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

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trending Assets</h2>
            <p className="text-gray-600">Most popular content right now</p>
          </div>
        </div>

        {/* Time Filter */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['24 Hours', '7 Days', '30 Days'] as const).map((label, index) => {
            const value = (['1d', '7d', '30d'] as const)[index];
            return (
              <button
                key={value}
                onClick={() => setTimeframe(value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeframe === value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
          ))}
        </div>
      )}

      {/* Trending Assets Grid */}
      {trendingAssets && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingAssets.map((asset: MockAsset, index: number) => (
            <motion.div
              key={asset.assetId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => onAssetClick?.(asset)}
            >
              {/* Rank Badge */}
              <div className="relative">
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
                
                {/* Trending Rank */}
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  #{index + 1}
                </div>
                
                {/* Asset Type */}
                <div className="absolute top-2 right-2">
                  <Badge className={getAssetTypeColor(asset.assetType)} variant="secondary">
                    {asset.assetType}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                  {asset.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {asset.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatNumber(asset.viewCount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{formatNumber(asset.downloadCount)}</span>
                    </div>
                  </div>
                  <div className="font-medium text-gray-900">
                    {asset.price === 0 ? 'Free' : `$${asset.price.toFixed(2)}`}
                  </div>
                </div>

                {/* Creator */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    by {asset.creator}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(asset.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {trendingAssets && trendingAssets.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trending assets found</h3>
          <p className="text-gray-600">Check back later for popular content</p>
        </div>
      )}
    </div>
  );
};

export default TrendingSection;