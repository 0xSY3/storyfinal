"use client";

import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Grid,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import axios from "axios";
import {
  AssetType,
  AssetPreview,
  ASSET_TYPE_CONFIGS,
  getAssetTypeFromFile,
  formatFileSize,
  isFileTypeSupported,
  validateFileSize,
} from "../../types/assetTypes";
import AssetPreviewCard from "./AssetPreviewCard";

interface UniversalAssetUploadProps {
  walletAddress: string | null;
  isStoryChainConnected: boolean;
  onUploadSuccess?: (results: any[]) => void;
}

const UniversalAssetUpload: React.FC<UniversalAssetUploadProps> = ({
  walletAddress,
  isStoryChainConnected,
  onUploadSuccess,
}) => {
  const [selectedTab, setSelectedTab] = useState<AssetType>(AssetType.IMAGE);
  const [previews, setPreviews] = useState<AssetPreview[]>([]);
  const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState({
    description: "",
    tags: "",
    category: "",
    subcategory: "",
  });

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const currentConfig = ASSET_TYPE_CONFIGS[selectedTab];

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles: AssetPreview[] = [];
      const invalidFiles: string[] = [];

      acceptedFiles.forEach((file) => {
        const assetType = getAssetTypeFromFile(file);
        
        if (!assetType) {
          invalidFiles.push(`${file.name}: Unsupported file type`);
          return;
        }

        if (!validateFileSize(file, assetType)) {
          invalidFiles.push(
            `${file.name}: File too large (max ${formatFileSize(
              ASSET_TYPE_CONFIGS[assetType].maxSize
            )})`
          );
          return;
        }

        // Create preview URL
        let previewUrl = "";
        if (assetType === AssetType.IMAGE) {
          previewUrl = URL.createObjectURL(file);
        } else if (assetType === AssetType.VIDEO) {
          previewUrl = URL.createObjectURL(file);
        } else if (assetType === AssetType.AUDIO) {
          previewUrl = URL.createObjectURL(file);
        }

        validFiles.push({
          file,
          preview: previewUrl,
          fileName: file.name,
          assetType,
        });
      });

      if (invalidFiles.length > 0) {
        setNotification({
          open: true,
          message: `Some files were rejected: ${invalidFiles.join(", ")}`,
          severity: "error",
        });
      }

      if (validFiles.length > 0) {
        setPreviews((prev) => [...prev, ...validFiles]);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: currentConfig.mimeTypes.reduce((acc, mimeType) => {
      acc[mimeType] = currentConfig.extensions;
      return acc;
    }, {} as Record<string, string[]>),
    disabled: !walletAddress || !isStoryChainConnected,
  });

  const handleUpload = async () => {
    try {
      setUploading(true);

      if (!walletAddress) throw new Error("Wallet connection required");
      if (!isStoryChainConnected) throw new Error("Story chain connection required");

      const formData = new FormData();
      previews.forEach((preview) => formData.append("assets", preview.file));
      formData.append("creatorAddress", walletAddress);
      formData.append("description", metadata.description);
      formData.append("tags", JSON.stringify(metadata.tags.split(",").map(t => t.trim()).filter(t => t)));
      formData.append("category", metadata.category || currentConfig.category);
      if (metadata.subcategory) {
        formData.append("subcategory", metadata.subcategory);
      }

      const response = await axios.post(
        "http://localhost:3001/api/assets/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const results = response.data.data;
      const duplicated = results.filter((item: any) => item.duplicated);
      const successful = results.filter((item: any) => item.success);

      // Update previews to show duplicated items
      if (duplicated.length > 0) {
        setPreviews((prev) =>
          prev
            .filter((preview) =>
              duplicated.some((dup: any) => preview.file.name === dup.originalName)
            )
            .map((preview) => ({ ...preview, duplicated: true }))
        );

        setNotification({
          open: true,
          message: `${duplicated.length} assets already exist and were not uploaded.`,
          severity: "info",
        });
      }

      if (successful.length > 0) {
        setNotification({
          open: true,
          message: `Successfully uploaded ${successful.length} assets!`,
          severity: "success",
        });
        
        // Clear successful uploads from previews
        setPreviews((prev) =>
          prev.filter((preview) =>
            !successful.some((success: any) => 
              preview.file.name === decodeURIComponent(success.fileName)
            )
          )
        );

        // Reset metadata
        setMetadata({
          description: "",
          tags: "",
          category: "",
          subcategory: "",
        });

        onUploadSuccess?.(successful);
      }

    } catch (err) {
      console.error("Upload failed:", err);
      setNotification({
        open: true,
        message: "Upload failed. Please try again.",
        severity: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const removePreview = (index: number) => {
    const previewToRemove = previews[index];
    if (previewToRemove.preview && previewToRemove.preview.startsWith("blob:")) {
      URL.revokeObjectURL(previewToRemove.preview);
    }
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.preview && preview.preview.startsWith("blob:")) {
          URL.revokeObjectURL(preview.preview);
        }
      });
    };
  }, [previews]);

  const hasValidPreviews = previews.filter(p => !p.duplicated).length > 0;

  return (
    <Box>
      {/* Asset Type Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {Object.entries(ASSET_TYPE_CONFIGS).map(([type, config]) => (
            <Tab
              key={type}
              value={type}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>{config.icon}</span>
                  <Typography variant="body2">{config.category}</Typography>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Upload Area */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: "16px" }}>
        <Typography variant="h6" gutterBottom>
          Upload {currentConfig.category}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {currentConfig.description}
        </Typography>

        <Box
          {...getRootProps()}
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: isDragActive
              ? "rgba(123, 97, 255, 0.08)"
              : "rgba(123, 97, 255, 0.04)",
            borderRadius: "12px",
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "primary.light",
            cursor: !walletAddress || !isStoryChainConnected ? "not-allowed" : "pointer",
            opacity: !walletAddress || !isStoryChainConnected ? 0.6 : 1,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(123, 97, 255, 0.08)",
            },
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon
            sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
          />
          <Typography variant="h6" gutterBottom>
            {!walletAddress
              ? "Connect Wallet"
              : !isStoryChainConnected
              ? "Connect to Story Chain"
              : isDragActive
              ? `Drop your ${currentConfig.category.toLowerCase()} here`
              : `Upload ${currentConfig.category}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: {currentConfig.extensions.join(", ")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Max size: {formatFileSize(currentConfig.maxSize)}
          </Typography>
        </Box>
      </Paper>

      {/* Metadata Input */}
      {hasValidPreviews && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: "16px" }}>
          <Typography variant="h6" gutterBottom>
            Asset Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={metadata.description}
                onChange={(e) =>
                  setMetadata((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe your assets..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tags (comma-separated)"
                value={metadata.tags}
                onChange={(e) =>
                  setMetadata((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="tag1, tag2, tag3"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={metadata.category}
                  onChange={(e) =>
                    setMetadata((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  label="Category"
                >
                  <MenuItem value={currentConfig.category}>
                    {currentConfig.category}
                  </MenuItem>
                  {currentConfig.subcategory?.map((sub) => (
                    <MenuItem key={sub} value={sub}>
                      {sub}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Asset Previews */}
      {previews.length > 0 && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: "16px" }}>
          <Typography variant="h6" gutterBottom>
            Asset Previews ({previews.length})
          </Typography>
          <Grid container spacing={2}>
            {previews.map((preview, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <AssetPreviewCard
                  preview={preview}
                  onRemove={() => removePreview(index)}
                />
              </Grid>
            ))}
          </Grid>

          {hasValidPreviews && (
            <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                disabled={uploading || !walletAddress || !isStoryChainConnected}
                startIcon={uploading ? <CircularProgress size={20} /> : <AddIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: "999px",
                  background: "linear-gradient(135deg, #7b61ff 0%, #4fc3f7 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #6f55e6 0%, #47b0df 100%)",
                  },
                }}
              >
                {uploading ? "Uploading..." : `Upload ${previews.filter(p => !p.duplicated).length} Assets`}
              </Button>
            </Box>
          )}
        </Paper>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UniversalAssetUpload;