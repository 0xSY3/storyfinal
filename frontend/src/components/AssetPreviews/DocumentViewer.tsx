"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Paper,
  useTheme,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Code as CodeIcon,
  Article as ArticleIcon,
  OpenInNew as OpenIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

interface DocumentViewerProps {
  src: string;
  fileName: string;
  mimeType: string;
  extractedText?: string;
  fileSize?: number;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  src,
  fileName,
  mimeType,
  extractedText,
  fileSize,
}) => {
  const theme = useTheme();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getDocumentIcon = () => {
    const iconProps = { sx: { fontSize: 48, color: "primary.main" } };
    
    if (mimeType.includes("pdf")) {
      return <PdfIcon {...iconProps} />;
    } else if (mimeType.includes("text")) {
      return <ArticleIcon {...iconProps} />;
    } else if (fileName.endsWith(".md")) {
      return <CodeIcon {...iconProps} />;
    }
    return <DocumentIcon {...iconProps} />;
  };

  const getFileExtension = () => {
    return fileName.split('.').pop()?.toUpperCase() || "DOC";
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

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: 200,
          background: `linear-gradient(135deg, ${theme.palette.grey[100]}, ${theme.palette.grey[50]})`,
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
          position: "relative",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* File Type Badge */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: theme.palette.primary.main,
            color: "white",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: 600,
          }}
        >
          {getFileExtension()}
        </Box>

        {/* Document Icon */}
        <Box sx={{ mb: 1 }}>
          {getDocumentIcon()}
        </Box>

        {/* File Info */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            textAlign: "center",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          }}
        >
          {fileName}
        </Typography>

        {fileSize && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            {formatFileSize(fileSize)}
          </Typography>
        )}

        {/* Text Preview */}
        {extractedText && (
          <Box
            sx={{
              backgroundColor: "rgba(255,255,255,0.8)",
              p: 1,
              borderRadius: 1,
              maxHeight: 60,
              overflow: "hidden",
              textAlign: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
              }}
            >
              {extractedText}
            </Typography>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, mt: "auto" }}>
          {extractedText && (
            <IconButton
              size="small"
              onClick={() => setIsPreviewOpen(true)}
              sx={{
                backgroundColor: "rgba(255,255,255,0.9)",
                "&:hover": { backgroundColor: "white" },
              }}
            >
              <OpenIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={handleDownload}
            sx={{
              backgroundColor: "rgba(255,255,255,0.9)",
              "&:hover": { backgroundColor: "white" },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Text Preview Dialog */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Document Preview: {fileName}
        </DialogTitle>
        <DialogContent>
          <Paper
            sx={{
              p: 2,
              backgroundColor: "grey.50",
              maxHeight: 400,
              overflow: "auto",
              fontFamily: "monospace",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {extractedText}
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
            Download
          </Button>
          <Button onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentViewer;