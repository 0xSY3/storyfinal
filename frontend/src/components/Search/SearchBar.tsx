"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  X as ClearIcon,
  History as HistoryIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSearchSuggestions } from "../../hooks/useSearchAssets";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search assets...",
  initialValue = "",
}) => {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: suggestions, isLoading: suggestionsLoading } = useSearchSuggestions(
    query,
    { enabled: query.length >= 2 && showSuggestions }
  );

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      
      // Add to recent searches
      const newRecentSearches = [
        searchQuery.trim(),
        ...recentSearches.filter(s => s !== searchQuery.trim())
      ].slice(0, 5);
      
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSubmit();
    } else if (event.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 1);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSubmit(suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const popularSearches = [
    "AI generated art", "Music samples", "3D models", "Code templates", 
    "Stock photos", "Video clips", "Datasets", "NFT collections"
  ];

  const showRecentOrPopular = query.length < 2 && showSuggestions;
  const showSuggestionsPanel = showSuggestions && (
    suggestions?.length > 0 || 
    showRecentOrPopular || 
    suggestionsLoading
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-4 bg-white border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-lg shadow-sm"
        />
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {suggestionsLoading && (
            <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
          )}
          {query && (
            <button
              onClick={() => {
                setQuery('');
                onSearch('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ClearIcon className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Panel */}
      {showSuggestionsPanel && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Loading */}
          {suggestionsLoading && (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 text-green-500 animate-spin mx-auto" />
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="p-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors text-left group"
                >
                  <SearchIcon className="w-4 h-4 text-gray-400 group-hover:text-green-500" />
                  <span className={`text-gray-700 ${
                    query && suggestion.toLowerCase().includes(query.toLowerCase()) 
                      ? 'font-semibold' 
                      : 'font-normal'
                  }`}>
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {showRecentOrPopular && recentSearches.length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <HistoryIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Recent searches</span>
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ClearIcon className="w-3 h-3 text-gray-400" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors text-gray-700 border-gray-300"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {showRecentOrPopular && (
            <div className={`p-4 ${recentSearches.length > 0 ? 'border-t border-gray-100' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <SearchIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">Popular searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-green-600 hover:text-white transition-colors bg-green-50 text-green-700 border-green-200"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;