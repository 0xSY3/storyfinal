"use client";

import React from "react";
import { Box } from "@mui/material";
import { AssetType, Asset } from "../../types/assetTypes";
import AudioPlayer from "./AudioPlayer";
import VideoPlayer from "./VideoPlayer";
import DocumentViewer from "./DocumentViewer";
import CodeViewer from "./CodeViewer";
import DatasetPreview from "./DatasetPreview";
import Model3DViewer from "./Model3DViewer";

interface UniversalAssetPreviewProps {
  asset: Asset;
  showActions?: boolean;
}

const UniversalAssetPreview: React.FC<UniversalAssetPreviewProps> = ({
  asset,
  showActions = true,
}) => {
  const assetUrl = `https://gateway.pinata.cloud/ipfs/${asset.cid}`;
  const thumbnailUrl = asset.metadata.processingData?.thumbnailCid
    ? `https://gateway.pinata.cloud/ipfs/${asset.metadata.processingData.thumbnailCid}`
    : undefined;

  const renderPreview = () => {
    switch (asset.assetType) {
      case AssetType.IMAGE:
        return (
          <Box
            sx={{
              width: "100%",
              height: 200,
              backgroundImage: `url(${thumbnailUrl || assetUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "12px",
              position: "relative",
            }}
          >
            {/* Optional overlay for additional info */}
            {asset.metadata.processingData?.colorPalette && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  display: "flex",
                  gap: 0.5,
                }}
              >
                {asset.metadata.processingData.colorPalette.slice(0, 3).map((color, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 16,
                      height: 16,
                      backgroundColor: color,
                      borderRadius: "50%",
                      border: "2px solid white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        );

      case AssetType.AUDIO:
        return (
          <AudioPlayer
            src={assetUrl}
            title={asset.fileName}
            artist={asset.creatorAddress.slice(0, 6) + "..." + asset.creatorAddress.slice(-4)}
          />
        );

      case AssetType.VIDEO:
        return (
          <VideoPlayer
            src={assetUrl}
            title={asset.fileName}
            poster={thumbnailUrl}
          />
        );

      case AssetType.DOCUMENT:
        return (
          <DocumentViewer
            src={assetUrl}
            fileName={asset.fileName}
            mimeType={asset.mimeType}
            extractedText={asset.metadata.processingData?.extractedText}
            fileSize={asset.size}
          />
        );

      case AssetType.CODE:
        return (
          <CodeViewer
            src={assetUrl}
            fileName={asset.fileName}
            extractedText={asset.metadata.processingData?.extractedText}
            language={asset.metadata.processingData?.technicalSpecs?.language}
            lineCount={asset.metadata.processingData?.technicalSpecs?.lineCount}
            fileSize={asset.size}
          />
        );

      case AssetType.DATASET:
        return (
          <DatasetPreview
            src={assetUrl}
            fileName={asset.fileName}
            rowCount={asset.metadata.processingData?.technicalSpecs?.rowCount}
            columnCount={asset.metadata.processingData?.technicalSpecs?.columnCount}
            sampleData={asset.metadata.processingData?.technicalSpecs?.sampleData}
            format={asset.mimeType}
            fileSize={asset.size}
          />
        );

      case AssetType.MODEL_3D:
        return (
          <Model3DViewer
            src={assetUrl}
            fileName={asset.fileName}
            format={asset.metadata.processingData?.technicalSpecs?.format}
            fileSize={asset.size}
            thumbnailUrl={thumbnailUrl}
          />
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
              backgroundColor: "grey.100",
              borderRadius: "12px",
            }}
          >
            <span>Unsupported asset type: {asset.assetType}</span>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {renderPreview()}
    </Box>
  );
};

export default UniversalAssetPreview;