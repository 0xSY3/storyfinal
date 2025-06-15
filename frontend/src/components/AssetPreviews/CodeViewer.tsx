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
  Paper,
} from "@mui/material";
import {
  Code as CodeIcon,
  OpenInNew as OpenIcon,
  Download as DownloadIcon,
  ContentCopy as CopyIcon,
} from "@mui/icons-material";

interface CodeViewerProps {
  src: string;
  fileName: string;
  extractedText?: string;
  language?: string;
  lineCount?: number;
  fileSize?: number;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  src,
  fileName,
  extractedText,
  language,
  lineCount,
  fileSize,
}) => {
  const theme = useTheme();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getLanguageColor = (lang?: string) => {
    const colors: Record<string, string> = {
      javascript: "#f7df1e",
      typescript: "#3178c6",
      python: "#3776ab",
      solidity: "#363636",
      rust: "#ce422b",
      go: "#00add8",
      java: "#ed8b00",
      cpp: "#00599c",
      c: "#a8b9cc",
      php: "#777bb4",
      ruby: "#cc342d",
    };
    return colors[lang?.toLowerCase() || ""] || theme.palette.primary.main;
  };

  const getFileExtension = () => {
    return fileName.split('.').pop()?.toUpperCase() || "CODE";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = fileName;
    link.click();
  };

  const handleCopyCode = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
    }
  };

  const renderCodePreview = () => {
    if (!extractedText) return null;

    const lines = extractedText.split('\n').slice(0, 6); // Show first 6 lines
    
    return (
      <Box
        sx={{
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
          p: 1,
          borderRadius: 1,
          fontFamily: "Monaco, 'Courier New', monospace",
          fontSize: "0.7rem",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {lines.map((line, index) => (
          <Box key={index} sx={{ display: "flex", minHeight: "1.2em" }}>
            <Typography
              component="span"
              sx={{
                color: "#858585",
                width: "2em",
                textAlign: "right",
                mr: 1,
                fontSize: "0.65rem",
              }}
            >
              {index + 1}
            </Typography>
            <Typography
              component="span"
              sx={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {line || " "}
            </Typography>
          </Box>
        ))}
        {extractedText.split('\n').length > 6 && (
          <Typography
            sx={{
              color: "#858585",
              fontSize: "0.65rem",
              fontStyle: "italic",
              textAlign: "center",
              mt: 0.5,
            }}
          >
            ...{extractedText.split('\n').length - 6} more lines
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: 200,
          background: `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.grey[800]})`,
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          p: 2,
          position: "relative",
          color: "white",
        }}
      >
        {/* File Type Badge */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: getLanguageColor(language),
            color: language === "solidity" ? "white" : "#000",
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: 600,
          }}
        >
          {getFileExtension()}
        </Box>

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <CodeIcon sx={{ fontSize: 24, mr: 1, color: "white" }} />
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
        </Box>

        {/* Language and Stats */}
        <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
          {language && (
            <Chip
              label={language}
              size="small"
              sx={{
                backgroundColor: getLanguageColor(language),
                color: language === "solidity" ? "white" : "#000",
                fontSize: "0.7rem",
                height: 20,
              }}
            />
          )}
          {lineCount && (
            <Chip
              label={`${lineCount} lines`}
              size="small"
              variant="outlined"
              sx={{ color: "white", borderColor: "white", fontSize: "0.7rem", height: 20 }}
            />
          )}
          {fileSize && (
            <Chip
              label={formatFileSize(fileSize)}
              size="small"
              variant="outlined"
              sx={{ color: "white", borderColor: "white", fontSize: "0.7rem", height: 20 }}
            />
          )}
        </Box>

        {/* Code Preview */}
        <Box sx={{ flex: 1, mb: 1 }}>
          {renderCodePreview()}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
          {extractedText && (
            <IconButton
              size="small"
              onClick={() => setIsPreviewOpen(true)}
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              <OpenIcon fontSize="small" />
            </IconButton>
          )}
          {extractedText && (
            <IconButton
              size="small"
              onClick={handleCopyCode}
              sx={{
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
              }}
            >
              <CopyIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={handleDownload}
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "white",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Code Preview Dialog */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Code Preview: {fileName}</span>
          <Box sx={{ display: "flex", gap: 1 }}>
            {language && (
              <Chip
                label={language}
                size="small"
                sx={{ backgroundColor: getLanguageColor(language) }}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper
            sx={{
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
              p: 2,
              maxHeight: 500,
              overflow: "auto",
              fontFamily: "Monaco, 'Courier New', monospace",
              fontSize: "0.8rem",
            }}
          >
            {extractedText?.split('\n').map((line, index) => (
              <Box key={index} sx={{ display: "flex", minHeight: "1.3em" }}>
                <Typography
                  component="span"
                  sx={{
                    color: "#858585",
                    width: "3em",
                    textAlign: "right",
                    mr: 2,
                    fontSize: "0.75rem",
                    userSelect: "none",
                  }}
                >
                  {index + 1}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    flex: 1,
                    whiteSpace: "pre",
                  }}
                >
                  {line || " "}
                </Typography>
              </Box>
            ))}
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyCode} startIcon={<CopyIcon />}>
            Copy Code
          </Button>
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

export default CodeViewer;