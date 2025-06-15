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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  TableChart as DatasetIcon,
  OpenInNew as OpenIcon,
  Download as DownloadIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";

interface DatasetPreviewProps {
  src: string;
  fileName: string;
  rowCount?: number;
  columnCount?: number;
  sampleData?: any[];
  format?: string;
  fileSize?: number;
}

const DatasetPreview: React.FC<DatasetPreviewProps> = ({
  src,
  fileName,
  rowCount,
  columnCount,
  sampleData,
  format,
  fileSize,
}) => {
  const theme = useTheme();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getFormatColor = () => {
    const colors: Record<string, string> = {
      "text/csv": "#28a745",
      "application/json": "#ffc107",
      "application/vnd.ms-excel": "#217346",
    };
    return colors[format || ""] || theme.palette.primary.main;
  };

  const getFileExtension = () => {
    return fileName.split('.').pop()?.toUpperCase() || "DATA";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    return num.toLocaleString();
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = fileName;
    link.click();
  };

  const renderDataTable = () => {
    if (!sampleData || sampleData.length === 0) return null;

    // Handle CSV data (array of strings)
    if (typeof sampleData[0] === "string") {
      const csvLines = sampleData;
      const headers = csvLines[0]?.split(",") || [];
      const rows = csvLines.slice(1, 6); // Show up to 5 data rows

      return (
        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell key={index} sx={{ fontWeight: 600 }}>
                    {header.trim()}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => {
                const cells = row.split(",");
                return (
                  <TableRow key={rowIndex}>
                    {cells.map((cell, cellIndex) => (
                      <TableCell key={cellIndex}>
                        {cell.trim()}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // Handle JSON data (array of objects)
    if (typeof sampleData[0] === "object") {
      const headers = Object.keys(sampleData[0] || {});
      const rows = sampleData.slice(0, 5); // Show up to 5 rows

      return (
        <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headers.map((header, index) => (
                  <TableCell key={index} sx={{ fontWeight: 600 }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {headers.map((header, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {String(row[header] || "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return null;
  };

  const renderMiniChart = () => {
    if (!rowCount) return null;

    // Simple bar chart representation
    const bars = Math.min(10, columnCount || 5);
    
    return (
      <Box sx={{ display: "flex", alignItems: "end", gap: 0.5, height: 30, mb: 1 }}>
        {Array.from({ length: bars }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: Math.random() * 20 + 5,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1,
            }}
          />
        ))}
      </Box>
    );
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: 200,
          background: `linear-gradient(135deg, ${theme.palette.success.light}20, ${theme.palette.info.light}20)`,
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
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
            backgroundColor: getFormatColor(),
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

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <DatasetIcon sx={{ fontSize: 24, mr: 1, color: "primary.main" }} />
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

        {/* Dataset Stats */}
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          {rowCount && (
            <Chip
              label={`${formatNumber(rowCount)} rows`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
          )}
          {columnCount && (
            <Chip
              label={`${columnCount} cols`}
              size="small"
              color="secondary"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
          )}
          {fileSize && (
            <Chip
              label={formatFileSize(fileSize)}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 20 }}
            />
          )}
        </Box>

        {/* Mini Visualization */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          {renderMiniChart()}
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
            Dataset Preview
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, justifyContent: "center", mt: "auto" }}>
          {sampleData && (
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

      {/* Dataset Preview Dialog */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Dataset Preview: {fileName}</span>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              icon={<AnalyticsIcon />}
              label={`${formatNumber(rowCount)} × ${columnCount}`}
              size="small"
              color="primary"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing first 5 rows of {formatNumber(rowCount)} total rows
            </Typography>
          </Box>
          {renderDataTable()}
          {!sampleData && (
            <Paper sx={{ p: 3, textAlign: "center", backgroundColor: "grey.50" }}>
              <Typography color="text.secondary">
                Preview not available for this dataset format
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownload} startIcon={<DownloadIcon />}>
            Download Dataset
          </Button>
          <Button onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DatasetPreview;