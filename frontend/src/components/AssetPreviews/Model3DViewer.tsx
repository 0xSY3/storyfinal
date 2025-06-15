"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Chip,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import {
  ViewInAr as Model3DIcon,
  OpenInNew as OpenIcon,
  Download as DownloadIcon,
  ThreeDRotation as RotateIcon,
  ZoomIn as ZoomIcon,
} from "@mui/icons-material";

interface Model3DViewerProps {
  src: string;
  fileName: string;
  format?: string;
  fileSize?: number;
  thumbnailUrl?: string;
}

const Model3DViewer: React.FC<Model3DViewerProps> = ({
  src,
  fileName,
  format,
  fileSize,
  thumbnailUrl,
}) => {
  const theme = useTheme();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getFormatColor = () => {
    const colors: Record<string, string> = {
      glb: "#ff6b6b",
      gltf: "#4ecdc4",
      fbx: "#45b7d1",
      obj: "#96ceb4",
      dae: "#feca57",
      blend: "#ff9ff3",
    };
    return colors[format?.toLowerCase() || ""] || theme.palette.primary.main;
  };

  const getFileExtension = () => {
    return fileName.split('.').pop()?.toUpperCase() || "3D";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = fileName;
    link.click();
  };

  const render3DPlaceholder = () => {
    // This would be replaced with actual 3D viewer like Three.js
    return (
      <Box
        sx={{
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at center, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 3D Grid Background */}
        <Box
          sx={{
            position: "absolute",
            width: "120%",
            height: "120%",
            background: `
              linear-gradient(90deg, transparent 49%, ${theme.palette.divider} 50%, transparent 51%),
              linear-gradient(0deg, transparent 49%, ${theme.palette.divider} 50%, transparent 51%)
            `,
            backgroundSize: "20px 20px",
            opacity: 0.3,
            transform: "perspective(400px) rotateX(45deg)",
          }}
        />

        {/* Floating 3D Cubes Animation */}
        {Array.from({ length: 6 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              width: 16,
              height: 16,
              backgroundColor: theme.palette.primary.main,
              opacity: 0.6,
              borderRadius: 1,
              animation: `float3D${index} 3s ease-in-out infinite`,
              animationDelay: `${index * 0.5}s`,
              transform: `translate3d(${(index - 2) * 30}px, ${(index - 2) * 20}px, 0)`,
              "@keyframes float3D0": {
                "0%, 100%": { transform: "translate3d(-60px, -40px, 0) rotateY(0deg)" },
                "50%": { transform: "translate3d(-60px, -60px, 0) rotateY(180deg)" },
              },
              "@keyframes float3D1": {
                "0%, 100%": { transform: "translate3d(-30px, -20px, 0) rotateY(0deg)" },
                "50%": { transform: "translate3d(-30px, -40px, 0) rotateY(180deg)" },
              },
              "@keyframes float3D2": {
                "0%, 100%": { transform: "translate3d(0px, 0px, 0) rotateY(0deg)" },
                "50%": { transform: "translate3d(0px, -20px, 0) rotateY(180deg)" },
              },
              "@keyframes float3D3": {
                "0%, 100%": { transform: "translate3d(30px, 20px, 0) rotateY(0deg)" },
                "50%": { transform: "translate3d(30px, 0px, 0) rotateY(180deg)" },
              },
              "@keyframes float3D4": {
                "0%, 100%": { transform: "translate3d(60px, 40px, 0) rotateY(0deg)" },
                "50%": { transform: "translate3d(60px, 20px, 0) rotateY(180deg)" },
              },
              "@keyframes float3D5": {
                "0%, 100%": { transform: "translate3d(90px, 60px, 0) rotateY(0deg)" },
                "50%": { transform: "translate3d(90px, 40px, 0) rotateY(180deg)" },
              },
            }}
          />
        ))}

        {/* Central 3D Icon */}
        <Model3DIcon
          sx={{
            fontSize: 48,
            color: "primary.main",
            zIndex: 1,
            animation: "rotate3D 4s linear infinite",
            "@keyframes rotate3D": {
              "0%": { transform: "rotateY(0deg)" },
              "100%": { transform: "rotateY(360deg)" },
            },
          }}
        />

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            mt: 1,
            zIndex: 1,
            textAlign: "center",
          }}
        >
          3D Model
        </Typography>

        {/* Interactive Hint */}
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            left: 8,
            display: "flex",
            gap: 0.5,
            opacity: 0.7,
          }}
        >
          <RotateIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <ZoomIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: 200,
          position: "relative",
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* File Type Badge */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: getFormatColor(),
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          {getFileExtension()}
        </Box>

        {/* 3D Preview */}
        {thumbnailUrl ? (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${thumbnailUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                color: "white",
                p: 1,
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                {fileName}
              </Typography>
            </Box>
          </Box>
        ) : (
          render3DPlaceholder()
        )}

        {/* Action Buttons Overlay */}
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            right: 8,
            display: "flex",
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            onClick={() => setIsPreviewOpen(true)}
            sx={{
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
            }}
          >
            <OpenIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDownload}
            sx={{
              backgroundColor: "rgba(0,0,0,0.6)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.8)" },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* 3D Model Info */}
      <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {fileName}
        </Typography>
        
        <Box sx={{ display: "flex", gap: 1 }}>
          {format && (
            <Chip
              label={format.toUpperCase()}
              size="small"
              sx={{
                backgroundColor: getFormatColor(),
                color: "white",
                fontSize: "0.7rem",
                height: 20,
              }}
            />
          )}
          {fileSize && (
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(fileSize)}
            </Typography>
          )}
        </Box>
      </Box>

      {/* 3D Model Viewer Dialog */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>3D Model: {fileName}</span>
          <Chip
            label={format?.toUpperCase() || "3D"}
            sx={{ backgroundColor: getFormatColor(), color: "white" }}
          />
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 400,
              backgroundColor: "grey.100",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* This would be replaced with actual 3D viewer */}
            {render3DPlaceholder()}
            
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                position: "absolute",
                bottom: 16,
                textAlign: "center",
                backgroundColor: "rgba(255,255,255,0.9)",
                px: 2,
                py: 1,
                borderRadius: 1,
              }}
            >
              Interactive 3D viewer would be implemented here with Three.js
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
            Download Model
          </Button>
          <Button onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Model3DViewer;