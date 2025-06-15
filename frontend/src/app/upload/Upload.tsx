"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload as UploadIcon, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Box, 
  Database, 
  Code,
  AlertCircle,
  X,
  Plus,
  Eye
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { cn } from "../../lib/utils";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface UploadProps {
  walletAddress: string | null;
  isStoryChainConnected: boolean;
}

interface FileWithPreview extends File {
  preview?: string;
  assetType?: string;
}

const assetTypes = [
  { id: 'image', name: 'Images', icon: Image, accept: 'image/*' },
  { id: 'video', name: 'Videos', icon: Video, accept: 'video/*' },
  { id: 'audio', name: 'Audio', icon: Music, accept: 'audio/*' },
  { id: 'document', name: 'Documents', icon: FileText, accept: '.pdf,.doc,.docx,.txt,.ppt,.pptx' },
  { id: 'model', name: '3D Models', icon: Box, accept: '.obj,.fbx,.glb,.gltf,.stl' },
  { id: 'dataset', name: 'Datasets', icon: Database, accept: '.csv,.json,.xml,.sql' },
  { id: 'code', name: 'Code', icon: Code, accept: '.js,.ts,.py,.java,.cpp,.html,.css' },
];

const Upload: React.FC<UploadProps> = ({
  walletAddress,
  isStoryChainConnected,
}) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    description: '',
    tags: '',
    category: '',
  });
  const [licensePricing, setLicensePricing] = useState({
    basic: 0,
    commercial: 10,
    exclusive: 25,
  });
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ open: false, message: '', type: 'info' });

  const createFilePreview = useCallback((file: File): FileWithPreview => {
    const fileWithPreview = file as FileWithPreview;
    fileWithPreview.assetType = selectedType || 'document';
    
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      fileWithPreview.preview = URL.createObjectURL(file);
    }
    
    return fileWithPreview;
  }, [selectedType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    const filesWithPreviews = droppedFiles.map(createFilePreview);
    setFiles(prev => [...prev, ...filesWithPreviews]);
  }, [createFilePreview]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const filesWithPreviews = selectedFiles.map(createFilePreview);
      setFiles(prev => [...prev, ...filesWithPreviews]);
    }
  }, [createFilePreview]);

  const removeFile = useCallback((index: number) => {
    const fileToRemove = files[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(prev => prev.filter((_, i) => i !== index));
  }, [files]);

  const handleUpload = useCallback(async () => {
    if (!walletAddress || files.length === 0) {
      setNotification({
        open: true,
        message: 'Please connect your wallet and select files to upload.',
        type: 'error'
      });
      return;
    }
    
    try {
      setUploading(true);
      
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('assets', file);
      });
      formData.append('creatorAddress', walletAddress);
      formData.append('description', metadata.description);
      formData.append('tags', JSON.stringify(metadata.tags.split(',').map(t => t.trim()).filter(t => t)));
      formData.append('category', metadata.category || selectedType || 'general');
      formData.append('licensePricing', JSON.stringify(licensePricing));
      
      const response = await axios.post(
        `${API_URL}/api/assets/upload`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000,
        }
      );
      
      if (response.data && response.data.success) {
        setNotification({
          open: true,
          message: 'Files uploaded successfully!',
          type: 'success'
        });
        
        files.forEach(file => {
          if (file.preview) URL.revokeObjectURL(file.preview);
        });
        setFiles([]);
        setMetadata({ description: '', tags: '', category: '' });
      } else {
        throw new Error('Upload failed: Invalid response from server');
      }
      
    } catch (error: any) {
      console.error('Upload failed:', error);
      setNotification({
        open: true,
        message: 'Upload failed. Please try again.',
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  }, [walletAddress, files, metadata, selectedType, licensePricing]);

  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const canUpload = walletAddress;
  const selectedAssetType = assetTypes.find(type => type.id === selectedType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-emerald-200 shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center">
              <UploadIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-emerald-700">IP Asset Upload</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent mb-4">
            Upload & Protect Your Assets
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your creative work into protected intellectual property with custom licensing
          </p>
        </motion.div>

        {/* Connection Status */}
        {!canUpload && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900 mb-1">Wallet Connection Required</h3>
                <p className="text-amber-700">Connect your wallet to start uploading and protecting your assets</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Asset Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl ring-1 ring-emerald-200/50">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-50 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700">Step 1 of 3</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Asset Type</h2>
                <p className="text-gray-600">Select the type of content you want to upload and protect</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {assetTypes.map((type, index) => {
                  const Icon = type.icon;
                  const isSelected = selectedType === type.id;
                  
                  return (
                    <motion.button
                      key={type.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group",
                        isSelected 
                          ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/20" 
                          : "border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/50 hover:shadow-md",
                        !canUpload && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => canUpload && setSelectedType(type.id)}
                      disabled={!canUpload}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm",
                        isSelected ? "bg-emerald-500 scale-110" : "bg-emerald-100 group-hover:bg-emerald-200"
                      )}>
                        <Icon className={cn(
                          "w-6 h-6 transition-colors duration-300",
                          isSelected ? "text-white" : "text-emerald-600"
                        )} />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold transition-colors duration-300 text-center",
                        isSelected ? "text-emerald-700" : "text-gray-700 group-hover:text-emerald-700"
                      )}>
                        {type.name}
                      </span>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="w-3 h-3 bg-white rounded-full"
                          />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upload Area */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="mb-8"
            >
              <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl ring-1 ring-emerald-200/50">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-50 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-emerald-700">Step 2 of 3</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Files</h3>
                    <p className="text-gray-600">Drag and drop files or click to browse from your computer</p>
                  </div>
                  
                  <div className="relative">
                    <div
                      className={cn(
                        "relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 bg-gradient-to-br",
                        dragActive 
                          ? "border-emerald-500 bg-emerald-50 from-emerald-50 to-green-50 scale-[1.02]" 
                          : "border-gray-300 hover:border-emerald-400 from-gray-50 to-emerald-50/30 hover:from-emerald-50/50 hover:to-green-50/50",
                        !canUpload && "opacity-50 cursor-not-allowed"
                      )}
                      onDrop={handleDrop}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                    >
                      <input
                        type="file"
                        multiple
                        accept={selectedAssetType?.accept}
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={!canUpload}
                      />
                      
                      <div className="flex flex-col items-center relative z-0">
                        <motion.div
                          animate={{ 
                            y: dragActive ? -8 : 0,
                            scale: dragActive ? 1.1 : 1
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className={cn(
                            "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300",
                            dragActive ? "bg-emerald-500 shadow-emerald-500/50" : "bg-emerald-100 hover:bg-emerald-200"
                          )}
                        >
                          <UploadIcon className={cn(
                            "w-10 h-10 transition-colors duration-300",
                            dragActive ? "text-white" : "text-emerald-600"
                          )} />
                        </motion.div>
                        
                        <motion.h4 
                          animate={{ color: dragActive ? "#059669" : "#1f2937" }}
                          className="text-2xl font-bold mb-3"
                        >
                          {dragActive ? "Drop your files here" : "Choose your files"}
                        </motion.h4>
                        
                        <p className="text-lg text-gray-600 mb-6 max-w-md">
                          {dragActive 
                            ? "Release to upload your files" 
                            : "Drag and drop files here, or click to browse"
                          }
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Up to 100MB per file</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Multiple files supported</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>All formats welcome</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Metadata and Pricing */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="mb-8"
            >
              <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl ring-1 ring-emerald-200/50">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-emerald-50 rounded-full">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-emerald-700">Step 3 of 3</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Asset Information & Pricing</h3>
                    <p className="text-gray-600">Add details and set your licensing prices</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={metadata.description}
                        onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your assets..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                      <input
                        type="text"
                        value={metadata.tags}
                        onChange={(e) => setMetadata(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="tag1, tag2, tag3"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={metadata.category}
                        onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        <option value="">Select category</option>
                        <option value="art">Art & Design</option>
                        <option value="music">Music & Audio</option>
                        <option value="video">Video & Animation</option>
                        <option value="document">Documents</option>
                        <option value="software">Software & Code</option>
                        <option value="data">Data & Research</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* License Pricing */}
                  <div className="border-t border-gray-200 pt-8">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Set License Pricing</h4>
                      <p className="text-gray-600">Define how much users pay for different types of licenses</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="p-6 border border-gray-200 rounded-xl bg-gray-50/50"
                      >
                        <div className="text-center mb-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl">📄</span>
                          </div>
                          <h5 className="font-semibold text-gray-900">Basic License</h5>
                          <p className="text-sm text-gray-600">Personal use only</p>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={licensePricing.basic}
                              onChange={(e) => setLicensePricing(prev => ({ ...prev, basic: Number(e.target.value) }))}
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              placeholder="0.00"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Set to 0 for free basic license</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="p-6 border-2 border-emerald-200 rounded-xl bg-emerald-50/50 relative"
                      >
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">Recommended</span>
                        </div>
                        <div className="text-center mb-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl">💼</span>
                          </div>
                          <h5 className="font-semibold text-gray-900">Commercial License</h5>
                          <p className="text-sm text-gray-600">Full commercial rights</p>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={licensePricing.commercial}
                              onChange={(e) => setLicensePricing(prev => ({ ...prev, commercial: Number(e.target.value) }))}
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-4 py-3 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                              placeholder="10.00"
                            />
                          </div>
                          <p className="text-xs text-emerald-600">Most popular for creators</p>
                        </div>
                      </motion.div>
                      
                      <motion.div 
                        whileHover={{ scale: 1.02 }}
                        className="p-6 border border-purple-200 rounded-xl bg-purple-50/50"
                      >
                        <div className="text-center mb-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-xl">👑</span>
                          </div>
                          <h5 className="font-semibold text-gray-900">Exclusive License</h5>
                          <p className="text-sm text-gray-600">Exclusive rights</p>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Price (USD)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                            <input
                              type="number"
                              value={licensePricing.exclusive}
                              onChange={(e) => setLicensePricing(prev => ({ ...prev, exclusive: Number(e.target.value) }))}
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                              placeholder="25.00"
                            />
                          </div>
                          <p className="text-xs text-gray-500">Premium pricing option</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* File List & Upload */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <Card className="bg-white/90 backdrop-blur-lg border-0 shadow-xl ring-1 ring-emerald-200/50">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">Ready to Upload</h3>
                      <p className="text-gray-600">
                        {files.length} file{files.length > 1 ? 's' : ''} selected • Total: {(files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="lg"
                        onClick={handleUpload}
                        disabled={uploading || !canUpload}
                        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg shadow-emerald-500/25 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? (
                          <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Plus className="w-5 h-5 mr-2" />
                        )}
                        {uploading ? 'Uploading...' : 'Upload All Files'}
                      </Button>
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {files.map((file, index) => {
                      const selectedAssetType = assetTypes.find(type => type.id === selectedType);
                      const Icon = selectedAssetType?.icon || FileText;
                      
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group relative bg-gradient-to-br from-white to-emerald-50/30 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shadow-sm">
                                  <Icon className="w-6 h-6 text-emerald-600" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 truncate mb-1">{file.name}</h4>
                                  <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    <span>•</span>
                                    <span className="capitalize">{selectedAssetType?.name}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeFile(index)}
                                className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600 transition-all duration-200 opacity-60 hover:opacity-100 focus:opacity-100"
                              >
                                <X className="w-4 h-4" />
                              </motion.button>
                            </div>
                            
                            {/* File preview */}
                            <div className="w-full h-32 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 overflow-hidden relative group">
                              {file.preview ? (
                                file.type.startsWith('image/') ? (
                                  <>
                                    <img 
                                      src={file.preview} 
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Eye className="w-6 h-6 text-white" />
                                    </div>
                                  </>
                                ) : file.type.startsWith('video/') ? (
                                  <>
                                    <video 
                                      src={file.preview}
                                      className="w-full h-full object-cover"
                                      muted
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Eye className="w-6 h-6 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Icon className="w-12 h-12 text-emerald-400" />
                                  </div>
                                )
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Icon className="w-12 h-12 text-emerald-400" />
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                        </motion.div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notification */}
        <AnimatePresence>
          {notification.open && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <div className={cn(
                "p-4 rounded-lg shadow-lg border backdrop-blur-sm max-w-md",
                notification.type === 'success' && "bg-emerald-50/90 border-emerald-200 text-emerald-800",
                notification.type === 'error' && "bg-red-50/90 border-red-200 text-red-800",
                notification.type === 'info' && "bg-blue-50/90 border-blue-200 text-blue-800"
              )}>
                <div className="flex items-center justify-between">
                  <p className="font-medium">{notification.message}</p>
                  <button
                    onClick={() => setNotification(prev => ({ ...prev, open: false }))}
                    className="ml-4 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Upload;