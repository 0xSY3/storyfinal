"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  X as ClearIcon,
  SlidersHorizontal,
  Calendar,
  DollarSign,
  Shield,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AssetType } from "../../types/assetTypes";

interface SearchFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  sort: any;
  onSortChange: (sort: any) => void;
  aggregations?: any;
  isMobile?: boolean;
}

const assetTypeLabels = {
  [AssetType.IMAGE]: 'Images',
  [AssetType.AUDIO]: 'Audio',
  [AssetType.VIDEO]: 'Videos',
  [AssetType.DOCUMENT]: 'Documents',
  [AssetType.MODEL_3D]: '3D Models',
  [AssetType.DATASET]: 'Datasets',
  [AssetType.CODE]: 'Code',
};

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'popularityScore', label: 'Popularity' },
  { value: 'viewCount', label: 'Views' },
  { value: 'downloadCount', label: 'Downloads' },
  { value: 'price', label: 'Price' },
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  aggregations,
  isMobile = false,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    sort: true,
    assetTypes: true,
    categories: false,
    priceRange: false,
    dateRange: false,
    license: false,
    quality: false,
  });

  const handleAssetTypeChange = (assetType: AssetType, checked: boolean) => {
    const currentTypes = filters.assetType || [];
    const newTypes = checked
      ? [...currentTypes, assetType]
      : currentTypes.filter((type: AssetType) => type !== assetType);
    
    onFiltersChange({
      ...filters,
      assetType: newTypes.length > 0 ? newTypes : undefined,
    });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = filters.category || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter((cat: string) => cat !== category);
    
    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: {
        min: min > 0 ? min : undefined,
        max: max < 1000 ? max : undefined,
      },
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev],
    }));
  };

  const FilterSection = ({ 
    id, 
    title, 
    icon: Icon, 
    children, 
    defaultExpanded = false 
  }: any) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {expandedSections[id as keyof typeof expandedSections] ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expandedSections[id as keyof typeof expandedSections] && (
        <div className="px-4 pb-4 bg-gray-50">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ClearIcon className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
        {/* Sort */}
        <FilterSection id="sort" title="Sort By" icon={SlidersHorizontal}>
          <div className="space-y-3">
            <select
              value={sort.field}
              onChange={(e) => onSortChange({ ...sort, field: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sort.order === 'desc'}
                onChange={(e) => onSortChange({ ...sort, order: e.target.checked ? 'desc' : 'asc' })}
                className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
              />
              <span className="text-sm text-gray-700 font-medium">
                {sort.order === 'desc' ? 'Descending' : 'Ascending'}
              </span>
            </label>
          </div>
        </FilterSection>

        {/* Asset Types */}
        <FilterSection id="assetTypes" title="Asset Types" icon={SlidersHorizontal}>
          <div className="space-y-2">
            {Object.entries(assetTypeLabels).map(([type, label]) => (
              <label key={type} className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filters.assetType?.includes(type) || false}
                    onChange={(e) => handleAssetTypeChange(type as AssetType, e.target.checked)}
                    className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="text-sm text-gray-900 font-medium">{label}</span>
                </div>
                {aggregations?.assetTypes?.buckets?.find((b: any) => b.key === type) && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                    {aggregations.assetTypes.buckets.find((b: any) => b.key === type).doc_count}
                  </Badge>
                )}
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Categories */}
        {aggregations?.categories?.buckets && aggregations.categories.buckets.length > 0 && (
          <FilterSection id="categories" title="Categories" icon={SlidersHorizontal}>
            <div className="space-y-2">
              {aggregations.categories.buckets.slice(0, 10).map((bucket: any) => (
                <label key={bucket.key} className="flex items-center justify-between p-2 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.category?.includes(bucket.key) || false}
                      onChange={(e) => handleCategoryChange(bucket.key, e.target.checked)}
                      className="rounded text-green-600 focus:ring-green-500"
                    />
                    <span className="text-sm text-slate-700">{bucket.key}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {bucket.doc_count}
                  </Badge>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Price Range */}
        <FilterSection id="priceRange" title="Price Range" icon={DollarSign}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange?.min || ''}
                onChange={(e) => handlePriceRangeChange(
                  parseInt(e.target.value) || 0,
                  filters.priceRange?.max || 1000
                )}
                className="flex-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange?.max || ''}
                onChange={(e) => handlePriceRangeChange(
                  filters.priceRange?.min || 0,
                  parseInt(e.target.value) || 1000
                )}
                className="flex-1 p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {[0, 100, 500, 1000].map((value) => (
                <Badge
                  key={value}
                  variant="outline"
                  className="cursor-pointer hover:bg-green-50"
                  onClick={() => handlePriceRangeChange(0, value)}
                >
                  {value === 0 ? 'Free' : value === 1000 ? '$1000+' : `$${value}`}
                </Badge>
              ))}
            </div>
          </div>
        </FilterSection>

        {/* License */}
        <FilterSection id="license" title="License" icon={Shield}>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.commercialUse === true}
              onChange={(e) => onFiltersChange({
                ...filters,
                commercialUse: e.target.checked ? true : undefined,
              })}
              className="rounded text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-slate-700">Commercial Use Allowed</span>
          </label>
        </FilterSection>

        {/* Quality Score */}
        <FilterSection id="quality" title="Quality" icon={Star}>
          <div className="space-y-2">
            <p className="text-sm text-slate-500 mb-2">Minimum Quality Score</p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={filters.minQualityScore || 0}
              onChange={(e) => onFiltersChange({
                ...filters,
                minQualityScore: parseFloat(e.target.value) > 0 ? parseFloat(e.target.value) : undefined,
              })}
              className="w-full accent-green-600"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Any</span>
              <span>Good</span>
              <span>High</span>
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default SearchFilters;