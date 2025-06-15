"use client";

import React from "react";
import {
  Paper,
  Box,
  Typography,
  IconButton,
  Chip,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Image as ImageIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
  Description as DocumentIcon,
  ViewInAr as Model3DIcon,
  TableChart as DatasetIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import {
  AssetPreview,
  AssetType,
  formatFileSize,
  ASSET_TYPE_CONFIGS,
} from "../../types/assetTypes";

interface AssetPreviewCardProps {
  preview: AssetPreview;
  onRemove: () => void;
}

const AssetPreviewCard: React.FC<AssetPreviewCardProps> = ({
  preview,
  onRemove,
}) => {
  const theme = useTheme();

  const getAssetIcon = (assetType: AssetType) => {
    const iconProps = { sx: { fontSize: 40, color: "primary.main" } };
    
    switch (assetType) {
      case AssetType.IMAGE:
        return <ImageIcon {...iconProps} />;
      case AssetType.AUDIO:
        return <AudioIcon {...iconProps} />;
      case AssetType.VIDEO:
        return <VideoIcon {...iconProps} />;
      case AssetType.DOCUMENT:
        return <DocumentIcon {...iconProps} />;
      case AssetType.MODEL_3D:
        return <Model3DIcon {...iconProps} />;
      case AssetType.DATASET:
        return <DatasetIcon {...iconProps} />;
      case AssetType.CODE:
        return <CodeIcon {...iconProps} />;
      default:
        return <ImageIcon {...iconProps} />;
    }
  };

  const renderPreview = () => {
    switch (preview.assetType) {
      case AssetType.IMAGE:
        return (
          <Box
            sx={{
              width: "100%",
              height: 200,
              backgroundImage: `url(${preview.preview})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "12px 12px 0 0",
            }}
          />
        );
      
      case AssetType.VIDEO:
        return (
          <Box
            sx={{
              width: "100%",
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.1)",
              borderRadius: "12px 12px 0 0",
              position: "relative",
            }}
          >
            <video
              src={preview.preview}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "12px 12px 0 0",
              }}
              muted
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontSize: "0.75rem",
              }}
            >
              VIDEO
            </Box>
          </Box>
        );
      
      case AssetType.AUDIO:
        return (
          <Box
            sx={{
              width: "100%",
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(123, 97, 255, 0.1)",
              borderRadius: "12px 12px 0 0",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {getAssetIcon(AssetType.AUDIO)}
            <audio
              src={preview.preview}
              controls
              style={{ width: "90%", maxWidth: "250px" }}
            />
          </Box>
        );
      
      default:
        return (
          <Box
            sx={{
              width: "100%",
              height: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(123, 97, 255, 0.1)",
              borderRadius: "12px 12px 0 0",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {getAssetIcon(preview.assetType)}
            <Typography variant="caption" color="text.secondary">
              {ASSET_TYPE_CONFIGS[preview.assetType].category}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Paper
      sx={{
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        border: preview.duplicated ? "2px solid" : "1px solid",
        borderColor: preview.duplicated ? "error.main" : "divider",
        backgroundColor: preview.duplicated ? "error.light" : "background.paper",
        opacity: preview.duplicated ? 0.7 : 1,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      {/* Remove Button */}
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          zIndex: 1,
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.8)",
          },
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {/* Duplicate Badge */}
      {preview.duplicated && (
        <Chip
          label="Duplicate"
          size="small"
          color="error"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 1,
            fontSize: "0.7rem",
          }}
        />
      )}

      {/* Asset Type Badge */}
      <Chip
        label={ASSET_TYPE_CONFIGS[preview.assetType].icon}
        size="small"
        sx={{
          position: "absolute",
          bottom: 8,
          left: 8,
          zIndex: 1,
          backgroundColor: "rgba(255,255,255,0.9)",
          fontSize: "0.8rem",
        }}
      />

      {/* Preview Content */}
      {renderPreview()}

      {/* File Info */}
      <Box sx={{ p: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {preview.fileName}
        </Typography>
        
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Chip
            label={ASSET_TYPE_CONFIGS[preview.assetType].category}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.7rem" }}
          />
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(preview.file.size)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default AssetPreviewCard;