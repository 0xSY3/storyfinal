"use client";

import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Modal,
  IconButton,
  Pagination,
  Snackbar,
  Alert,
  Chip,
  Checkbox,
  Button,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  TokenOutlined,
  CheckBoxOutlineBlank,
  CheckBox,
} from "@mui/icons-material";
import { useImageLoader } from "../../hooks/useImageLoader";
import { useStoryProtocol } from "../../hooks/useStoryProtocol";
import axios from "axios";
import FineTuneModal from "./FineTuneModal";
import Link from "next/link";
import Image from "next/image";
import IPRegistration from "../../components/IPRegistration";
import { useStoryClient } from "../../hooks/useStoryClient";
import { keccak256 } from "viem";
import { LicenseTerms } from "@story-protocol/core-sdk";

interface ImageData {
  cid: string;
  fileName: string;
  mimeType: string;
  size: number;
  timestamp: string;
  tokenId?: string;
  mintedAt?: string;
  ipId?: string;
  licenseTermsIds?: string[];
}

interface DashboardProps {
  walletAddress?: string | null;
}

const ITEMS_PER_PAGE = 50;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const ImageModal: React.FC<{
  open: boolean;
  onClose: () => void;
  image: ImageData | null;
}> = ({ open, onClose, image }) => {
  const theme = useTheme();

  if (!image) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90%",
          maxWidth: 600,
          bgcolor: theme.palette.background.paper,
          backdropFilter: "blur(16px)",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          color: theme.palette.text.primary,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
        <Image
          src={`https://gateway.pinata.cloud/ipfs/${image.cid}`}
          alt={image.fileName}
          width={800}
          height={600}
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
        <Typography variant="body2" sx={{ mt: 2 }}>
          <strong>CID:</strong> {image.cid}
          <br />
          <strong>File:</strong> {image.fileName}
          <br />
          <strong>Type:</strong> {image.mimeType}
          <br />
          <strong>Size:</strong> {(image.size / 1024).toFixed(2)} KB
          <br />
          <strong>Uploaded:</strong>{" "}
          {new Date(image.timestamp).toLocaleString()}
          <br />
          {image.tokenId && (
            <>
              <strong>Token ID:</strong> #{image.tokenId}
              <br />
              <strong>Minted At:</strong>{" "}
              {new Date(image.mintedAt || "").toLocaleString()}
            </>
          )}
        </Typography>
      </Box>
    </Modal>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ walletAddress }) => {
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCids, setSelectedCids] = useState<string[]>([]);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info",
  });
  const [openFineTuneModal, setOpenFineTuneModal] = useState(false);

  const theme = useTheme();
  const { images, loading, error, refetchImages, setImages } = useImageLoader(
    walletAddress || null
  );
  const { getNFTInfo } = useStoryProtocol(walletAddress || null);
  const { client } = useStoryClient();

  const toggleSelect = (cid: string) => {
    const image = images.find((img) => img.cid === cid);
    if (!image?.ipId) {
      setNotification({
        open: true,
        message: "Only IP registered images can be selected for fine-tuning",
        severity: "info",
      });
      return;
    }

    setSelectedCids((prev) =>
      prev.includes(cid) ? prev.filter((c) => c !== cid) : [...prev, cid]
    );
  };

  const selectAllIPImages = () => {
    const ipRegisteredCids = images
      .filter((img) => img.ipId)
      .map((img) => img.cid);

    const allIPImagesSelected = ipRegisteredCids.every((cid) =>
      selectedCids.includes(cid)
    );

    if (allIPImagesSelected) {
      setSelectedCids([]);
    } else {
      setSelectedCids(ipRegisteredCids);
    }
  };

  const areAllIPImagesSelected = () => {
    const ipRegisteredCids = images
      .filter((img) => img.ipId)
      .map((img) => img.cid);

    return (
      ipRegisteredCids.length > 0 &&
      ipRegisteredCids.every((cid) => selectedCids.includes(cid))
    );
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const handleMintSuccess = async (
    cid: string,
    tokenId: string,
    ipId?: string,
    licenseTermsIds?: bigint[]
  ) => {
    try {
      await axios.post(`${API_BASE_URL}/api/update-nft-info`, {
        cid,
        tokenId,
        walletAddress,
        ipId,
        licenseTermsIds: licenseTermsIds?.map((id) => id.toString()),
      });

      await refetchImages();

      setNotification({
        open: true,
        message: `NFT minted & IP registered! (Token ID: ${tokenId}, IP ID: ${
          ipId || "None"
        })`,
        severity: "success",
      });
    } catch (error) {
      console.error("Minting error:", error);
      setNotification({
        open: true,
        message:
          "Failed to update database with NFT info: " +
          (error instanceof Error ? error.message : "Unknown error"),
        severity: "error",
      });
    }
  };

  const handleMintError = (error: Error) => {
    setNotification({
      open: true,
      message: "Mint failed: " + error.message,
      severity: "error",
    });
  };

  const handleFineTuneSubmit = async (data: {
    modelName: string;
    description?: string;
  }) => {
    try {
      const selectedIpIds = images
        .filter((img) => selectedCids.includes(img.cid))
        .map((img) => img.ipId)
        .filter((ipId): ipId is string => ipId !== undefined);

      const selectedLicenseTermsIds = images
        .filter((img) => selectedCids.includes(img.cid))
        .map((img) => img.licenseTermsIds)
        .filter((ids): ids is string[] => ids !== undefined)
        .flat();

      if (selectedCids.length === 0) {
        setNotification({
          open: true,
          message: "Please select at least one image",
          severity: "error",
        });
        return;
      }

      await axios.post(`${API_BASE_URL}/api/fine-tune-dataset`, {
        walletAddress,
        modelName: data.modelName,
        description: data.description || "",
        selectedCids,
        selectedIpIds: selectedIpIds.length > 0 ? selectedIpIds : ["default"],
        selectedLicenseTermsIds: selectedLicenseTermsIds.length > 0 ? selectedLicenseTermsIds : ["default"],
      });

      setNotification({
        open: true,
        message: "Fine-tuning request submitted successfully",
        severity: "success",
      });
      setOpenFineTuneModal(false);
      setSelectedCids([]);
    } catch (error) {
      console.error("Fine-tuning request failed:", error);
      setNotification({
        open: true,
        message: "Failed to submit fine-tuning request",
        severity: "error",
      });
    }
  };

  if (!walletAddress) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" align="center" color="text.secondary">
          Please connect your wallet to view images
        </Typography>
      </Container>
    );
  }

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!images.length) return <Typography>No images uploaded.</Typography>;

  const totalPages = Math.ceil(images.length / ITEMS_PER_PAGE);
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const currentImages = images.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          className="header-container"
          sx={{
            textAlign: "center",
            px: 3,
            py: 4,
            mb: 4,
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(16px)",
            borderRadius: 4,
            border: "1px solid rgba(16, 185, 129, 0.2)",
            boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #059669, #10b981, #14b8a6)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              mb: 2,
            }}
          >
            {`Asset Dashboard`}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.1rem" }}>
            Manage your assets and register them as intellectual property
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
          <Button
            component={Link}
            href="/models"
            variant="outlined"
            startIcon={<TokenOutlined />}
            sx={{
              borderRadius: 8,
              textTransform: "none",
              px: 3,
              py: 1,
              borderColor: "rgba(16, 185, 129, 0.5)",
              color: "#059669",
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(8px)",
              "&:hover": {
                borderColor: "#059669",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            View My Models
          </Button>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(16, 185, 129, 0.1)",
          }}
        >
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
                mb: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={selectAllIPImages}
                startIcon={
                  areAllIPImagesSelected() ? (
                    <CheckBox />
                  ) : (
                    <CheckBoxOutlineBlank />
                  )
                }
                sx={{
                  borderRadius: 8,
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  borderColor: "rgba(16, 185, 129, 0.5)",
                  color: "#059669",
                  background: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    borderColor: "#059669",
                    backgroundColor: "rgba(16, 185, 129, 0.1)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {areAllIPImagesSelected()
                  ? "Deselect All IP Assets"
                  : "Select All IP Assets"}
              </Button>
              <Button
                variant="outlined"
                sx={{
                  ml: 2,
                  borderRadius: 8,
                  textTransform: "none",
                  px: 3,
                  py: 1,
                  borderColor: "rgba(20, 184, 166, 0.5)",
                  color: "#0d9488",
                  background: "rgba(255, 255, 255, 0.8)",
                  "&:hover": {
                    borderColor: "#0d9488",
                    backgroundColor: "rgba(20, 184, 166, 0.1)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 12px rgba(20, 184, 166, 0.2)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Register All Unminted
              </Button>
            </Box>
          {currentImages.map((image, index) => (
            <Grid key={`${image.cid}-${index}`}>
              <Box
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  position: "relative",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.08)",
                  background: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(8px)",
                  transform: "translateY(0)",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 25px rgba(16, 185, 129, 0.15)",
                  },
                  border: selectedCids.includes(image.cid)
                    ? "2px solid #10b981"
                    : "2px solid rgba(16, 185, 129, 0.1)",
                }}
              >
                <Checkbox
                  checked={selectedCids.includes(image.cid)}
                  onChange={() => toggleSelect(image.cid)}
                  sx={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}
                />
                <Image
                  src={`https://gateway.pinata.cloud/ipfs/${image.cid}`}
                  alt={image.fileName}
                  width={300}
                  height={200}
                  style={{
                    objectFit: "cover",
                    width: "100%",
                    height: "200px",
                  }}
                  onClick={() => setSelectedImage(image)}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    width: "100%",
                    bgcolor: "rgba(0, 0, 0, 0.6)",
                    color: "#fff",
                    p: 1,
                    transition: "0.3s ease",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {decodeURIComponent(image.fileName)}
                  </Typography>
                  {image.tokenId && (
                    <Chip
                      icon={<TokenOutlined />}
                      label={`NFT #${image.tokenId}`}
                      color="primary"
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </Box>

              {image.ipId && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1,
                    bgcolor: "rgba(0, 0, 0, 0.02)",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Chip
                    icon={
                      <Box
                        sx={{ display: "flex", alignItems: "center", mr: -0.5 }}
                      >
                        <Image
                          src="/ip_token.svg"
                          alt="IP Token"
                          width={16}
                          height={16}
                        />
                      </Box>
                    }
                    label={`IP: ${image.ipId.substring(
                      0,
                      6
                    )}...${image.ipId.substring(image.ipId.length - 4)}`}
                    size="small"
                    color="secondary"
                    sx={{
                      background: "linear-gradient(135deg, #059669, #10b981, #14b8a6)",
                      color: "white",
                      fontWeight: 500,
                      "& .MuiChip-icon": {
                        color: "white",
                      },
                      boxShadow: "0 2px 10px rgba(16, 185, 129, 0.2)",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                      },
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => {
                      window.open(
                        `https://explorer.story.foundation/ipa/${image.ipId}`,
                        "_blank"
                      );
                    }}
                  />
                </Box>
              )}

              {!image.tokenId && (
                <Box sx={{ mt: 1 }}>
                  <IPRegistration
                    cid={image.cid}
                    walletAddress={walletAddress}
                    onSuccess={(
                      tokenId: string,
                      ipId: string,
                      licenseTermsIds: bigint[]
                    ) =>
                      handleMintSuccess(
                        image.cid,
                        tokenId,
                        ipId,
                        licenseTermsIds
                      )
                    }
                    onError={handleMintError}
                  />
                </Box>
              )}
            </Grid>
          ))}
        </Grid>

          {selectedCids.length > 0 && (
            <Box
              sx={{
                mt: 5,
                display: "flex",
                justifyContent: "center",
                p: 3,
                borderRadius: 4,
                background: "rgba(16, 185, 129, 0.05)",
                border: "1px solid rgba(16, 185, 129, 0.1)",
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => setOpenFineTuneModal(true)}
                sx={{
                  px: 5,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: "1rem",
                  borderRadius: "20px",
                  background: "linear-gradient(135deg, #059669, #10b981, #14b8a6)",
                  color: "#fff",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #047857, #059669, #0d9488)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(16, 185, 129, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Fine-Tune Model ({selectedCids.length})
              </Button>
              <FineTuneModal
                open={openFineTuneModal}
                onClose={() => setOpenFineTuneModal(false)}
                onSubmit={handleFineTuneSubmit}
              />
            </Box>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "#059669",
                    "&.Mui-selected": {
                      background: "linear-gradient(135deg, #059669, #10b981)",
                      color: "white",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(16, 185, 129, 0.1)",
                    },
                  },
                }}
              />
            </Box>
          )}
        </Paper>

        <ImageModal
          open={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          image={selectedImage}
        />

        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{
              "&.MuiAlert-filledSuccess": {
                background: "linear-gradient(135deg, #059669, #10b981)",
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default Dashboard;
