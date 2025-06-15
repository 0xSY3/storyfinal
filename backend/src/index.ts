import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
import multer from "multer";
import pinataSDK from "@pinata/sdk";
import path from "path";
import { Readable } from "stream";
import axios from "axios";
import crypto from "crypto";
import { firebaseDB } from "./utils/firebase";
import { db } from "./config/firebase";
import { digitalAssetDownloader } from "./utils/assetDownloader";
import { CreativeAIProcessor } from "./utils/aiImageProcessor";
import { AssetType, AssetMetadata, validateAssetFile, getAssetTypeFromExtension } from "./types/assetTypes";
import { AssetProcessor } from "./utils/assetProcessor";
import { yakoaService } from "./utils/yakoaService";
import { storyProtocolService } from "./utils/storyProtocolService";
import { uploadMetadataToIPFS } from "./api/upload-metadata";

interface ModelData {
  modelName: string;
  walletAddress: string;
  description?: string;
  status: string;
  selectedCids: string[];
  selectedIpIds: string[];
  selectedLicenseTermsIds: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface GeneratedImage {
  cid: string;
  prompt: string;
  url: string;
  modelName: string;
  modelOwner: string;
  createdAt: string;
}

console.log("Environment check:", {
  firebaseUrl: process.env.FIREBASE_DATABASE_URL ? "configured" : "not configured",
  pinataKey: process.env.PINATA_API_KEY ? "configured" : "not configured",
  pinataSecret: process.env.PINATA_API_SECRET ? "configured" : "not configured",
});

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const assetProcessor = new AssetProcessor();

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY ?? "",
  process.env.PINATA_API_SECRET ?? ""
);

pinata
  .testAuthentication()
  .then(() => {
    console.log("Pinata connection successful!");
  })
  .catch((err) => {
    console.error("Pinata connection failed:", err);
  });

app.use(cors());
app.use(express.json());

app.post("/api/assets/upload", upload.array("assets"), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: "No files provided" });
    }

    const creatorAddress = req.body.creatorAddress;
    if (!creatorAddress) {
      return res.status(400).json({ error: "Creator address is required" });
    }

    const uploadResults = await Promise.all(
      req.files.map(async (file) => {
        try {
          const validation = validateAssetFile(file);
          if (!validation.valid) {
            return {
              error: true,
              fileName: file.originalname,
              message: validation.error
            };
          }

          const assetType = validation.assetType!;
          const readableStream = Readable.from(file.buffer);
          const safeFileName = encodeURIComponent(file.originalname);

          const options = {
            pinataMetadata: {
              name: safeFileName,
            },
          };

          const result = await pinata.pinFileToIPFS(readableStream, options);
          const cid = result.IpfsHash;

          const existingAsset = await firebaseDB.findAssetByCID(cid, creatorAddress);
          if (existingAsset) {
            return {
              duplicated: true,
              fileName: safeFileName,
              originalName: file.originalname,
              cid,
              assetType
            };
          }

          const processingResult = await assetProcessor.processAsset(file, assetType);

          let thumbnailCid = undefined;
          if (processingResult.thumbnailBuffer) {
            const thumbnailStream = Readable.from(processingResult.thumbnailBuffer);
            const thumbnailResult = await pinata.pinFileToIPFS(thumbnailStream, {
              pinataMetadata: { name: `${safeFileName}_thumbnail` }
            });
            thumbnailCid = thumbnailResult.IpfsHash;
          }

          const metadata: AssetMetadata = {
            fileName: safeFileName,
            mimeType: file.mimetype,
            size: file.size,
            assetType,
            tags: req.body.tags ? JSON.parse(req.body.tags) : [],
            description: req.body.description || "",
            category: req.body.category || "General",
            timestamp: new Date().toISOString(),
            ...processingResult.metadata,
            processingData: {
              ...processingResult.metadata.processingData,
              ...(thumbnailCid && { thumbnailCid })
            }
          };

          if (req.body.subcategory) {
            metadata.subcategory = req.body.subcategory;
          }

          const asset = await firebaseDB.createAsset({
            cid,
            assetType,
            fileName: safeFileName,
            mimeType: file.mimetype,
            size: file.size,
            creatorAddress,
            metadata,
            searchTags: [
              file.originalname.toLowerCase(),
              assetType,
              metadata.category.toLowerCase(),
              ...(metadata.tags || [])
            ]
          });

          const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
          const thumbnailUrl = thumbnailCid ? `https://gateway.pinata.cloud/ipfs/${thumbnailCid}` : undefined;
          
          // Yakoa verification enabled - register asset for content verification
          console.log(`🔍 Registering asset ${asset.id} with Yakoa for verification...`);
          let yakoaResult = null;
          try {
            yakoaResult = await yakoaService.registerAssetForVerification({
              assetId: asset.id,
              creatorAddress,
              fileName: safeFileName,
              ipfsUrl,
              thumbnailUrl,
              assetType,
              metadata,
              fileBuffer: file.buffer
            });
            console.log(`✅ Yakoa verification registered for asset ${asset.id}:`, yakoaResult.verificationStatus);
          } catch (yakoaError: any) {
            console.warn(`⚠️ Yakoa verification failed for asset ${asset.id}:`, yakoaError?.message || 'Unknown error');
            // Continue upload even if Yakoa fails - don't block user experience
          }

          // Note: Automatic IP registration disabled to allow smooth uploads
          // Users can manually register assets as IP using the "Register as IP" button
          console.log(`💡 Asset ${asset.id} uploaded successfully. Use "Register as IP" button to register on Story Protocol.`);

          return {
            success: true,
            assetId: asset.id,
            cid,
            assetType,
            fileName: safeFileName,
            size: file.size,
            thumbnailUrl,
            ipfsUrl,
            yakoaVerification: yakoaResult?.verificationStatus || 'pending',
            yakoaTrustScore: yakoaResult?.trustScore,
            yakoaTokenId: yakoaResult?.tokenId
          };

        } catch (error) {
          console.error("Asset upload failed:", error);
          return {
            error: true,
            fileName: file.originalname,
            message: "Upload failed"
          };
        }
      })
    );

    res.json({
      success: true,
      data: uploadResults
    });

  } catch (error) {
    console.error("Asset upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Metadata upload endpoint for Story Protocol
app.post("/api/upload-metadata", uploadMetadataToIPFS);

app.get("/api/assets", async (req, res) => {
  try {
    const { type, limit } = req.query;
    const assetType = type as AssetType | undefined;
    const assets = await firebaseDB.getAllAssets(assetType, limit ? parseInt(limit as string) : undefined);
    res.json({ success: true, data: assets });
  } catch (error) {
    console.error("Asset retrieval failed:", error);
    res.status(500).json({ error: "Failed to retrieve assets" });
  }
});

// Manual IP registration endpoint for existing assets
app.post("/api/assets/:assetId/register-ip", async (req, res) => {
  try {
    const { assetId } = req.params;
    const { title, description, category, tags, licenseType } = req.body;

    console.log(`📝 IP Registration request for asset ${assetId}:`, {
      title, description, category, tags, licenseType
    });

    // Get asset data
    const asset = await firebaseDB.getAssetById(assetId);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    // Check if already registered
    if (asset.ipId) {
      return res.json({ 
        success: true, 
        message: "Asset already registered",
        ipId: asset.ipId 
      });
    }

    // Use backend wallet address as creator (get from Story Protocol service)
    const backendWalletAddress = storyProtocolService.getWalletAddress();

    // Register as IP on Story Protocol
    const ipResult = await storyProtocolService.registerIPAsset({
      assetId: asset.id,
      ipfsHash: asset.cid,
      creatorAddress: backendWalletAddress,
      metadata: {
        title: title || decodeURIComponent(asset.fileName),
        description: description || asset.metadata.description || `${asset.assetType} asset registered on Story Protocol`,
        category: category || asset.metadata.category || 'digital-content',
        tags: tags || asset.metadata.tags || []
      }
    });

    if (ipResult.success && ipResult.ipId) {
      // Create default license terms for the IP asset
      const licenseTerms = await storyProtocolService.createDefaultLicenseTerms();
      if (licenseTerms && licenseTerms.licenseTermsId) {
        await storyProtocolService.attachLicenseTerms(ipResult.ipId, licenseTerms.licenseTermsId.toString());
      }
      
      // Update asset with IP information
      await firebaseDB.updateAsset(asset.id, {
        ipId: ipResult.ipId,
        tokenId: ipResult.tokenId,
        mintedAt: new Date().toISOString(),
        licenseTermsIds: licenseTerms?.licenseTermsId ? [licenseTerms.licenseTermsId.toString()] : []
      });

      console.log(`✅ Manual IP registration completed for asset ${assetId}: ${ipResult.ipId}`);
      
      res.json({
        success: true,
        ipId: ipResult.ipId,
        tokenId: ipResult.tokenId,
        txHash: ipResult.txHash,
        licenseTermsId: licenseTerms?.licenseTermsId?.toString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: ipResult.error || "Registration failed"
      });
    }

  } catch (error) {
    console.error("Manual IP registration failed:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Prepare Story Protocol registration data for frontend signing
app.post("/api/assets/:assetId/prepare-ip-registration", async (req, res) => {
  try {
    const { assetId } = req.params;
    const { creatorAddress } = req.body;

    if (!creatorAddress) {
      return res.status(400).json({ error: "Creator address is required" });
    }

    // Get asset data
    const asset = await firebaseDB.getAssetById(assetId);
    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    // Check if already registered
    if (asset.ipId) {
      return res.json({ 
        success: true, 
        alreadyRegistered: true,
        ipId: asset.ipId 
      });
    }

    // Prepare IP metadata for Story Protocol
    const ipMetadata = {
      title: decodeURIComponent(asset.fileName),
      description: asset.metadata.description || `${asset.assetType} asset uploaded to Story IP Marketplace`,
      mediaUrl: `https://gateway.pinata.cloud/ipfs/${asset.cid}`,
      mediaType: asset.mimeType,
      creators: [
        {
          name: "Asset Creator",
          address: creatorAddress,
          contributionPercent: 100
        }
      ],
      attributes: [
        {
          trait_type: 'Category',
          value: asset.metadata.category
        },
        {
          trait_type: 'Asset Type',
          value: asset.assetType
        },
        {
          trait_type: 'File Size',
          value: asset.size.toString()
        },
        {
          trait_type: 'MIME Type',
          value: asset.mimeType
        }
      ]
    };

    // Prepare NFT metadata
    const nftMetadata = {
      name: decodeURIComponent(asset.fileName),
      description: `NFT representing ownership of ${decodeURIComponent(asset.fileName)}`,
      image: `https://gateway.pinata.cloud/ipfs/${asset.cid}`,
      external_url: `https://gateway.pinata.cloud/ipfs/${asset.cid}`,
      attributes: ipMetadata.attributes
    };

    // Upload metadata to IPFS
    
    try {
      console.log('🔄 Uploading IP metadata to IPFS...');
      console.log('IP Metadata:', JSON.stringify(ipMetadata, null, 2));
      
      // Check if Pinata credentials are configured
      if (!process.env.PINATA_API_KEY || !process.env.PINATA_API_SECRET) {
        console.error('PINATA_API_KEY or PINATA_API_SECRET environment variables not set');
        return res.status(500).json({ error: 'IPFS configuration missing' });
      }

      // Upload IP metadata
      const ipMetadataResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: ipMetadata,
          pinataMetadata: {
            name: `ip-metadata-${asset.id}`,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_API_SECRET,
          },
        }
      );

      console.log('✅ IP metadata uploaded:', ipMetadataResponse.data.IpfsHash);

      // Upload NFT metadata
      console.log('🔄 Uploading NFT metadata to IPFS...');
      const nftMetadataResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: nftMetadata,
          pinataMetadata: {
            name: `nft-metadata-${asset.id}`,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': process.env.PINATA_API_KEY,
            'pinata_secret_api_key': process.env.PINATA_API_SECRET,
          },
        }
      );

      console.log('✅ NFT metadata uploaded:', nftMetadataResponse.data.IpfsHash);

      const ipMetadataHash = ipMetadataResponse.data.IpfsHash;
      const nftMetadataHash = nftMetadataResponse.data.IpfsHash;

      // Generate proper hashes
      const ipHashHex = crypto.createHash('sha256').update(JSON.stringify(ipMetadata)).digest('hex');
      const nftHashHex = crypto.createHash('sha256').update(JSON.stringify(nftMetadata)).digest('hex');

      console.log('📋 Generated hashes - IP:', ipHashHex, 'NFT:', nftHashHex);

      // Return data needed for frontend IP registration
      res.json({
        success: true,
        registrationData: {
          assetId: asset.id,
          ipMetadataURI: `https://ipfs.io/ipfs/${ipMetadataHash}`,
          ipMetadataHash: `0x${ipHashHex}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${nftMetadataHash}`,
          nftMetadataHash: `0x${nftHashHex}`
        }
      });

    } catch (ipfsError: any) {
      console.error('IPFS upload failed:', ipfsError.response?.data || ipfsError.message);
      res.status(500).json({ 
        error: 'Failed to upload metadata to IPFS',
        details: ipfsError.response?.data?.error || ipfsError.message
      });
    }

  } catch (error) {
    console.error("IP registration preparation failed:", error);
    res.status(500).json({ error: "Failed to prepare registration data" });
  }
});

// Update asset with IP registration info (called from frontend after user signs transaction)
app.post("/api/assets/:assetId/update-ip", async (req, res) => {
  try {
    const { assetId } = req.params;
    const { ipId, tokenId, txHash, licenseTermsId } = req.body;

    if (!ipId) {
      return res.status(400).json({ error: "IP ID is required" });
    }

    // Update asset with IP information
    const updates: any = {
      ipId,
      txHash,
      mintedAt: new Date().toISOString()
    };

    if (tokenId) updates.tokenId = tokenId;
    if (licenseTermsId) updates.licenseTermsIds = [licenseTermsId];

    await firebaseDB.updateAsset(assetId, updates);

    console.log(`✅ Updated asset ${assetId} with IP ID: ${ipId}`);
    
    res.json({
      success: true,
      message: "Asset updated with IP registration info"
    });

  } catch (error) {
    console.error("Asset IP update failed:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

app.get("/api/assets/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { type } = req.query;
    const assetType = type as AssetType | undefined;
    const assets = await firebaseDB.getUserAssets(address, assetType);
    
    // Enrich assets with verification data
    const enrichedAssets = await Promise.all(
      assets.map(async (asset) => {
        try {
          // Get verification status from Yakoa service
          const verification = await yakoaService.checkVerificationStatus(asset.id);
          return {
            ...asset,
            verification: verification || null
          };
        } catch (error) {
          console.warn(`Failed to get verification for asset ${asset.id}:`, error);
          return {
            ...asset,
            verification: null
          };
        }
      })
    );
    
    res.json({ success: true, data: enrichedAssets });
  } catch (error) {
    console.error("User assets retrieval failed:", error);
    res.status(500).json({ error: "Failed to retrieve user assets" });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q) {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    const assetType = type as AssetType | undefined;
    const results = await firebaseDB.searchAssets(q as string, assetType);
    res.json({ success: true, data: results });
  } catch (error) {
    console.error("Asset search failed:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

app.post("/api/assets/:assetId/update", async (req, res) => {
  try {
    const { assetId } = req.params;
    const updateData = req.body;
    
    const success = await firebaseDB.updateAsset(assetId, updateData);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Failed to update asset" });
    }
  } catch (error) {
    console.error("Asset update failed:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

app.post("/api/upload", upload.array("images"), async (req, res) => {
  try {
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({ error: "No files provided" });
    }

    const creatorAddress = req.body.creatorAddress;
    if (!creatorAddress) {
      return res.status(400).json({ error: "Creator address is required" });
    }

    const userRef = `users/${creatorAddress}`;
    let user = await firebaseDB.get(userRef);

    if (!user) {
      user = {
        address: creatorAddress,
        createdAt: new Date().toISOString(),
      };
      await firebaseDB.set(userRef, user);
    }

    const uploadResults = await Promise.all(
      req.files.map(async (file) => {
        try {
          const readableStream = Readable.from(file.buffer);
          const safeFileName = encodeURIComponent(file.originalname);

          const options = {
            pinataMetadata: {
              name: safeFileName,
            },
          };

          const result = await pinata.pinFileToIPFS(readableStream, options);
          const cid = result.IpfsHash;

          const existingImage = await firebaseDB.findImageByCID(
            cid,
            creatorAddress
          );
          if (existingImage) {
            return {
              duplicated: true,
              fileName: safeFileName,
              originalName: file.originalname,
              cid,
            };
          }

          const metadata = {
            fileName: safeFileName,
            mimeType: file.mimetype,
            size: file.size,
            timestamp: new Date().toISOString(),
          };

          const imageId = Date.now().toString();
          const imageData = {
            cid,
            fileName: safeFileName,
            mimeType: file.mimetype,
            size: file.size,
            creatorAddress: creatorAddress,
            metadata,
            createdAt: new Date().toISOString(),
          };

          await firebaseDB.set(`images/${imageId}`, imageData);

          return {
            duplicated: false,
            cid,
            fileName: safeFileName,
            size: file.size,
            ipfsUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
          };
        } catch (error) {
          console.error("File upload failed:", error);
          return {
            error: true,
            fileName: file.originalname,
            message: "Upload failed",
          };
        }
      })
    );

    res.json({
      success: true,
      data: uploadResults,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.post("/api/update-nft-info", async (req, res) => {
  try {
    const { cid, tokenId, walletAddress, ipId, licenseTermsIds } = req.body;

    const image = await firebaseDB.findImageByCID(cid, walletAddress);

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (tokenId) {
      updateData.tokenId = tokenId;
      updateData.mintedAt = new Date().toISOString();
    }

    if (ipId) {
      updateData.ipId = ipId;
    }

    if (licenseTermsIds && Array.isArray(licenseTermsIds)) {
      updateData.licenseTermsIds = licenseTermsIds;
    }

    const updated = await firebaseDB.updateImageData(image.id, updateData);

    if (!updated) {
      return res
        .status(500)
        .json({ error: "Failed to update NFT information" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("NFT info update failed:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
});

app.get("/api/images/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const userImages = await firebaseDB.getUserImages(address);
    res.json(userImages);
  } catch (error) {
    console.error("Image retrieval failed:", error);
    res.status(500).json({ error: "Image retrieval failed" });
  }
});

app.post("/api/fine-tune-dataset", async (req, res) => {
  try {
    const {
      walletAddress,
      modelName,
      description,
      selectedCids,
      selectedIpIds,
      selectedLicenseTermsIds,
    } = req.body;

    if (
      !walletAddress ||
      !modelName ||
      !selectedCids ||
      !selectedCids.length ||
      !selectedIpIds ||
      !selectedIpIds.length ||
      !selectedLicenseTermsIds ||
      !selectedLicenseTermsIds.length
    ) {
      return res.status(400).json({ error: "Required information is missing." });
    }

    const fineTuneId = Date.now().toString();
    const fineTuneData = {
      walletAddress,
      modelName,
      description: description || "",
      selectedCids,
      selectedIpIds,
      selectedLicenseTermsIds,
      status: "pending", // pending, processing, completed, failed
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await firebaseDB.set(
      `fine-tune/${walletAddress}/${modelName}`,
      fineTuneData
    );

    res.json({
      success: true,
      message: "Fine-tuning request has been received",
      data: {
        fineTuneId,
        modelName,
        status: "pending",
      },
    });
  } catch (error) {
    console.error("Fine-tuning request failed:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the fine-tuning request" });
  }
});

app.get("/api/fine-tune-status/:walletAddress/:modelName", async (req, res) => {
  try {
    const { walletAddress, modelName } = req.params;

    const fineTuneData = await firebaseDB.get(
      `fine-tune/${walletAddress}/${modelName}`
    );

    if (!fineTuneData) {
      return res
        .status(404)
        .json({ error: "The fine-tuning request could not be found." });
    }

    res.json({
      success: true,
      data: fineTuneData,
    });
  } catch (error) {
    console.error("Fine-tuning status check failed:", error);
    res.status(500).json({ error: "An error occurred while checking status" });
  }
});

app.get("/api/models/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;
    console.log("Model query request - wallet address:", walletAddress);

    const userModelsRef = `fine-tune/${walletAddress}`;
    console.log("Firebase reference path:", userModelsRef);

    const userModels = await firebaseDB.get(userModelsRef);
    console.log("Firebase query result:", JSON.stringify(userModels, null, 2));

    if (!userModels) {
      console.log("Model data not found in Firebase");
      return res.json({ success: true, data: [] });
    }

    const modelsList: ModelData[] = Object.entries(
      userModels as Record<string, any>
    ).map(([modelName, modelData]) => {
      console.log(
        `Model conversion - ${modelName}:`,
        JSON.stringify(modelData, null, 2)
      );
      const modelInfo = modelData as Record<string, any>;

      return {
        modelName,
        walletAddress,
        status: modelInfo.status || "unknown",
        selectedCids: modelInfo.selectedCids || [],
        selectedIpIds: modelInfo.selectedIpIds || [],
        selectedLicenseTermsIds: modelInfo.selectedLicenseTermsIds || [],
        createdAt: modelInfo.createdAt || new Date().toISOString(),
        updatedAt: modelInfo.updatedAt || new Date().toISOString(),
        description: modelInfo.description || "",
        modelIpfsHash: modelInfo.modelIpfsHash || modelInfo.modelCid || null,
        ...modelInfo,
      } as ModelData;
    });

    console.log("Final response data:", JSON.stringify(modelsList, null, 2));

    modelsList.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      data: modelsList,
    });
  } catch (error) {
    console.error("Model query failed:", error);
    res.status(500).json({ error: "An error occurred while querying the model list" });
  }
});

app.get("/api/models", async (req, res) => {
  try {
    const allModelsRef = `fine-tune`;
    const allModels = await firebaseDB.get(allModelsRef);

    console.log(
      "All model data retrieved from Firebase:",
      JSON.stringify(allModels, null, 2)
    );

    if (!allModels) {
      return res.json({ success: true, data: [] });
    }

    const modelsList: ModelData[] = [];

    Object.entries(allModels as Record<string, any>).forEach(
      ([walletAddress, userModels]) => {
        if (userModels && typeof userModels === "object") {
          Object.entries(userModels as Record<string, any>).forEach(
            ([modelName, modelData]) => {
              const modelInfo = modelData as Record<string, any>;

              console.log(
                `Model info (${walletAddress}/${modelName}):`,
                JSON.stringify(modelInfo, null, 2)
              );

              const modelIpfsHash =
                modelInfo.modelIpfsHash || modelInfo.modelCid || null;
              const selectedCids = modelInfo.selectedCids || [];
              const selectedIpIds = modelInfo.selectedIpIds || [];
              const selectedLicenseTermsIds =
                modelInfo.selectedLicenseTermsIds || [];

              console.log(`Extracted key fields (${modelName}):`, {
                modelIpfsHash,
                selectedCids,
                selectedIpIds,
                selectedLicenseTermsIds,
              });

              const convertedModel = {
                modelName,
                walletAddress,
                status: modelInfo.status || "unknown",
                selectedCids: selectedCids,
                selectedIpIds: selectedIpIds,
                selectedLicenseTermsIds: selectedLicenseTermsIds,
                createdAt: modelInfo.createdAt || new Date().toISOString(),
                updatedAt: modelInfo.updatedAt || new Date().toISOString(),
                description: modelInfo.description || "",
                modelIpfsHash: modelIpfsHash,
                ...modelInfo,
              } as ModelData;

              modelsList.push(convertedModel);
            }
          );
        }
      }
    );

    console.log("Final response data:", JSON.stringify(modelsList, null, 2));

    modelsList.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      data: modelsList,
    });
  } catch (error) {
    console.error("Model query failed:", error);
    res.status(500).json({ error: "An error occurred while querying the model list" });
  }
});

app.post("/api/generate-image", async (req, res) => {
  try {
    const {
      modelName,
      walletAddress,
      prompt,
      modelOwnerAddress,
      numOfImages = 1,
    } = req.body;

    if (!modelName || !walletAddress || !prompt) {
      return res.status(400).json({
        error: "Model name, wallet address, and prompt are required.",
      });
    }

    const modelOwner = modelOwnerAddress || walletAddress;
    const modelDataPath = `fine-tune/${modelOwner}/${modelName}`;
    const modelData = await firebaseDB.get(modelDataPath);

    if (!modelData) {
      return res.status(404).json({ error: "Model not found" });
    }

    if (modelData.status !== "completed") {
      return res.status(400).json({ error: "Model training is not completed" });
    }

    const assetPath = await digitalAssetDownloader.downloadCreativeAsset(
      modelData.modelCid
    );

    const aiProcessor = new CreativeAIProcessor(assetPath);

    const generatedImages: GeneratedImage[] = [];

    for (let i = 0; i < numOfImages; i++) {
      const result = await aiProcessor.createImageFromPrompt(prompt);

      const imageStream = Buffer.from(result.imageData, "base64");
      const options = {
        pinataMetadata: {
          name: `${modelName}_generated_${Date.now()}_${i}`,
        },
      };

      const pinataResult = await pinata.pinFileToIPFS(imageStream, options);
      const imageCid = pinataResult.IpfsHash;

      generatedImages.push({
        cid: imageCid,
        prompt,
        url: `https://gateway.pinata.cloud/ipfs/${imageCid}`,
        modelName,
        modelOwner,
        createdAt: new Date().toISOString(),
      });
    }

    const usageId = Date.now().toString();
    const usageData = {
      modelName,
      modelOwner,
      userAddress: walletAddress,
      prompt,
      numOfImages,
      images: generatedImages,
      timestamp: new Date().toISOString(),
    };

    await firebaseDB.set(`model-usage/${usageId}`, usageData);

    res.json({
      success: true,
      message: "Images generated successfully",
      data: {
        images: generatedImages,
        usageId,
      },
    });
  } catch (error) {
    console.error("Image generation failed:", error);
    res.status(500).json({ error: "Failed to generate images" });
  }
});

app.get("/api/generated-images/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    const usageRef = "model-usage";
    const allUsages = await firebaseDB.get(usageRef);

    if (!allUsages) {
      return res.json({ success: true, data: [] });
    }

    const userImages: GeneratedImage[] = [];

    Object.entries(allUsages).forEach(([usageId, usageData]: [string, any]) => {
      if (usageData.userAddress === walletAddress) {

        const mockImage: GeneratedImage = {
          cid: `mock_${usageId}`,
          prompt: usageData.prompt,
          url: `https://gateway.pinata.cloud/ipfs/mock_${usageId}`,
          modelName: usageData.modelName,
          modelOwner: usageData.modelOwner,
          createdAt: usageData.timestamp,
        };

        userImages.push(mockImage);
      }
    });

    userImages.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      data: userImages,
    });
  } catch (error) {
    console.error("Generated image query failed:", error);
    res
      .status(500)
      .json({ error: "An error occurred while querying the generated image list" });
  }
});

app.get("/api/debug/firebase/:path", async (req, res) => {
  try {
    const path = req.params.path.replace(/\./g, "/");
    console.log(`Firebase debug - path: ${path}`);

    const data = await firebaseDB.get(path);
    console.log(`Firebase debug - data:`, JSON.stringify(data, null, 2));

    return res.json({
      success: true,
      path,
      exists: data !== null,
      data,
    });
  } catch (error) {
    console.error("Firebase data query failed:", error);
    res.status(500).json({ error: "An error occurred while querying data" });
  }
});

app.post("/api/license-token", async (req, res) => {
  const { walletAddress, licenseTokenIds } = req.body;

  if (!walletAddress || !licenseTokenIds || !Array.isArray(licenseTokenIds)) {
    return res
      .status(400)
      .json({ error: "walletAddress or licenseTokenIds missing" });
  }

  const userTokenRef = `licenseTokens/${walletAddress}`;
  const existingData = (await firebaseDB.get(userTokenRef)) || { tokenIds: [] };

  const updatedTokens = Array.from(
    new Set([
      ...existingData.tokenIds,
      ...licenseTokenIds.map((id: any) => id.toString()),
    ])
  );

  await firebaseDB.set(userTokenRef, { tokenIds: updatedTokens });
  return res.json({ success: true, tokenIds: updatedTokens });
});

app.get("/api/license-token/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  const tokenData = await firebaseDB.get(`licenseTokens/${walletAddress}`);

  return res.json({
    success: true,
    hasToken: tokenData?.tokenIds?.length > 0,
    tokenIds: tokenData?.tokenIds || [],
  });
});

app.post("/api/license-token/use", async (req, res) => {
  const { walletAddress, tokenId } = req.body;

  if (!walletAddress || !tokenId) {
    return res.status(400).json({ error: "walletAddress or tokenId missing" });
  }

  const userTokenRef = `licenseTokens/${walletAddress}`;
  const existingData = await firebaseDB.get(userTokenRef);
  if (!existingData || !Array.isArray(existingData.tokenIds)) {
    return res.status(404).json({ error: "No tokens found for this user." });
  }

  const updatedTokens = existingData.tokenIds.filter(
    (id: string) => id !== tokenId.toString()
  );
  await firebaseDB.set(userTokenRef, { tokenIds: updatedTokens });

  return res.json({ success: true, removed: tokenId });
});

app.post("/api/update-model-info", async (req, res) => {
  try {
    const { walletAddress, modelName, ipId, licenseTermsId } = req.body;

    if (!walletAddress || !modelName) {
      return res
        .status(400)
        .json({ error: "walletAddress or modelName is missing." });
    }

    const modelRef = `fine-tune/${walletAddress}/${modelName}`;
    const modelData = await firebaseDB.get(modelRef);

    if (!modelData) {
      return res.status(404).json({ error: "Model information not found." });
    }

    const updatedData = {
      ...(ipId && { ipId }),
      ...(licenseTermsId && { licenseTermsId }),
      updatedAt: new Date().toISOString(),
    };

    await firebaseDB.update(modelRef, updatedData);

    res.json({ success: true, updatedData });
  } catch (error) {
    console.error("Model information update failed:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating model information." });
  }
});

app.get("/api/search/assets", async (req, res) => {
  res.status(503).json({ error: "Search service temporarily unavailable" });
});

app.get("/api/search/suggestions", async (req, res) => {
  res.json([]);
});

app.get("/api/search/trending", async (req, res) => {
  res.json([]);
});

app.post("/api/search/analytics", async (req, res) => {
  res.json({ success: true });
});

app.get("/api/search/health", async (req, res) => {
  res.json({ 
    status: 'disabled',
    elasticsearch: false,
    message: 'Search temporarily disabled for development'
  });
});

app.get("/api/yakoa/verification/:assetId", async (req, res) => {
  try {
    const { assetId } = req.params;
    
    const verificationResult = await yakoaService.checkVerificationStatus(assetId);
    
    if (!verificationResult) {
      return res.status(404).json({ error: "Verification not found" });
    }

    res.json(verificationResult);
  } catch (error) {
    console.error("Verification status check failed:", error);
    res.status(500).json({ error: "Failed to check verification status" });
  }
});

app.post("/api/yakoa/verification/batch", async (req, res) => {
  try {
    const { assetIds } = req.body;
    
    if (!assetIds || !Array.isArray(assetIds)) {
      return res.status(400).json({ error: "Asset IDs array is required" });
    }

    const verificationSummary = await yakoaService.getVerificationSummary(assetIds);
    res.json(verificationSummary);
  } catch (error) {
    console.error("Batch verification check failed:", error);
    res.status(500).json({ error: "Failed to check verification status" });
  }
});

app.post("/api/yakoa/verification/:assetId/false-positive", async (req, res) => {
  try {
    const { assetId } = req.params;
    const { reason, brandName, adminKey } = req.body;
    
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!reason) {
      return res.status(400).json({ error: "Reason is required" });
    }

    const success = await yakoaService.markAsFalsePositive(assetId, reason, brandName);
    
    if (success) {
      res.json({ success: true, message: "Asset marked as authorized" });
    } else {
      res.status(500).json({ error: "Failed to mark as authorized" });
    }
  } catch (error) {
    console.error("False positive marking failed:", error);
    res.status(500).json({ error: "Failed to mark as authorized" });
  }
});

app.post("/api/yakoa/verification/:assetId/trust", async (req, res) => {
  try {
    const { assetId } = req.params;
    const { trustReason, reason, adminKey } = req.body;
    
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!trustReason || !['trusted_platform', 'no_licenses'].includes(trustReason)) {
      return res.status(400).json({ error: "Valid trust reason is required" });
    }

    const success = await yakoaService.updateTrustReason(assetId, trustReason, reason);
    
    if (success) {
      res.json({ success: true, message: "Trust reason updated" });
    } else {
      res.status(500).json({ error: "Failed to update trust reason" });
    }
  } catch (error) {
    console.error("Trust reason update failed:", error);
    res.status(500).json({ error: "Failed to update trust reason" });
  }
});

app.post("/api/yakoa/verification/:assetId/retry", async (req, res) => {
  try {
    const { assetId } = req.params;
    const { adminKey } = req.body;
    
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const assetData = await firebaseDB.get(`assets/${assetId}`);
    if (!assetData) {
      return res.status(404).json({ error: "Asset not found" });
    }

    const verificationResult = await yakoaService.registerAssetForVerification({
      assetId: assetData.id,
      creatorAddress: assetData.creatorAddress,
      fileName: assetData.fileName,
      ipfsUrl: `https://gateway.pinata.cloud/ipfs/${assetData.cid}`,
      thumbnailUrl: assetData.metadata?.processingData?.thumbnailCid 
        ? `https://gateway.pinata.cloud/ipfs/${assetData.metadata.processingData.thumbnailCid}` 
        : undefined,
      assetType: assetData.assetType,
      metadata: assetData.metadata,
    });

    res.json(verificationResult);
  } catch (error) {
    console.error("Verification retry failed:", error);
    res.status(500).json({ error: "Failed to retry verification" });
  }
});

app.post("/api/yakoa/webhook", async (req, res) => {
  try {
    const webhookData = req.body;
    console.log("📡 Received Yakoa webhook:", webhookData);
    
    res.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook processing failed:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

app.post("/api/licenses/purchase", async (req, res) => {
  try {
    const { 
      assetId, 
      licenseType, 
      buyerAddress, 
      creatorAddress, 
      orderId, 
      paymentAmount, 
      paymentToken, 
      sourceChain, 
      destinationChain,
      customPrice 
    } = req.body;

    if (!assetId || !licenseType || !buyerAddress || !creatorAddress || !orderId) {
      return res.status(400).json({ error: "Missing required license purchase data" });
    }

    const licenseId = Date.now().toString();
    const licenseData = {
      licenseId,
      assetId,
      licenseType,
      buyerAddress,
      creatorAddress,
      orderId,
      paymentAmount: paymentAmount || 0,
      paymentToken: paymentToken || 'USDC',
      sourceChain: sourceChain || 'unknown',
      destinationChain: destinationChain || 1315, // Story chain
      customPrice: customPrice || null,
      status: 'pending', // pending, confirmed, failed
      purchasedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        crossChain: sourceChain !== destinationChain,
        deBridgeOrder: orderId,
      }
    };

    await firebaseDB.set(`licenses/${licenseId}`, licenseData);

    const userLicensesRef = `user-licenses/${buyerAddress}`;
    const existingLicenses = await firebaseDB.get(userLicensesRef) || { licenses: [] };
    existingLicenses.licenses.push(licenseId);
    await firebaseDB.set(userLicensesRef, existingLicenses);

    const assetLicensesRef = `asset-licenses/${assetId}`;
    const existingAssetLicenses = await firebaseDB.get(assetLicensesRef) || { sales: [] };
    existingAssetLicenses.sales.push(licenseId);
    await firebaseDB.set(assetLicensesRef, existingAssetLicenses);

    res.json({ 
      success: true, 
      licenseId,
      message: "License purchase recorded successfully" 
    });

  } catch (error) {
    console.error("License purchase recording failed:", error);
    res.status(500).json({ error: "Failed to record license purchase" });
  }
});

app.put("/api/licenses/:licenseId/status", async (req, res) => {
  try {
    const { licenseId } = req.params;
    const { status, transactionHash, paymentData } = req.body;

    if (!status || !['pending', 'confirmed', 'failed'].includes(status)) {
      return res.status(400).json({ error: "Invalid license status" });
    }

    const licenseData = await firebaseDB.get(`licenses/${licenseId}`);
    if (!licenseData) {
      return res.status(404).json({ error: "License not found" });
    }

    const updateData = {
      status,
      updatedAt: new Date().toISOString(),
      ...(transactionHash && { transactionHash }),
      ...(paymentData && { paymentData }),
    };

    if (status === 'confirmed') {
      updateData.confirmedAt = new Date().toISOString();
    }

    await firebaseDB.update(`licenses/${licenseId}`, updateData);

    res.json({ success: true, message: "License status updated" });

  } catch (error) {
    console.error("License status update failed:", error);
    res.status(500).json({ error: "Failed to update license status" });
  }
});

app.get("/api/licenses/user/:address", async (req, res) => {
  try {
    const { address } = req.params;
    const { status, assetType, limit = 50, offset = 0 } = req.query;

    const userLicenses = await firebaseDB.get(`user-licenses/${address}`);
    if (!userLicenses || !userLicenses.licenses) {
      return res.json({ success: true, data: [], total: 0 });
    }

    const licenses = [];
    for (const licenseId of userLicenses.licenses) {
      const licenseData = await firebaseDB.get(`licenses/${licenseId}`);
      if (licenseData) {
        const assetData = await firebaseDB.get(`assets/${licenseData.assetId}`);
        
        const enrichedLicense = {
          ...licenseData,
          asset: assetData ? {
            fileName: assetData.fileName,
            assetType: assetData.assetType,
            metadata: assetData.metadata,
            cid: assetData.cid,
          } : null
        };

        if (status && licenseData.status !== status) continue;
        if (assetType && assetData && assetData.assetType !== assetType) continue;

        licenses.push(enrichedLicense);
      }
    }

    licenses.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

    const paginatedLicenses = licenses.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: paginatedLicenses,
      total: licenses.length,
      hasMore: licenses.length > Number(offset) + Number(limit)
    });

  } catch (error) {
    console.error("User licenses retrieval failed:", error);
    res.status(500).json({ error: "Failed to retrieve user licenses" });
  }
});

app.get("/api/licenses/asset/:assetId", async (req, res) => {
  try {
    const { assetId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const assetLicenses = await firebaseDB.get(`asset-licenses/${assetId}`);
    if (!assetLicenses || !assetLicenses.sales) {
      return res.json({ success: true, data: [], total: 0 });
    }

    const licenses = [];
    for (const licenseId of assetLicenses.sales) {
      const licenseData = await firebaseDB.get(`licenses/${licenseId}`);
      if (licenseData) {
        const publicLicense = {
          licenseId: licenseData.licenseId,
          licenseType: licenseData.licenseType,
          paymentAmount: licenseData.paymentAmount,
          paymentToken: licenseData.paymentToken,
          status: licenseData.status,
          purchasedAt: licenseData.purchasedAt,
          buyerAddress: `${licenseData.buyerAddress.substring(0, 6)}...${licenseData.buyerAddress.substring(licenseData.buyerAddress.length - 4)}`,
          metadata: licenseData.metadata
        };
        licenses.push(publicLicense);
      }
    }

    licenses.sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime());

    const paginatedLicenses = licenses.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      success: true,
      data: paginatedLicenses,
      total: licenses.length,
      hasMore: licenses.length > Number(offset) + Number(limit)
    });

  } catch (error) {
    console.error("Asset licenses retrieval failed:", error);
    res.status(500).json({ error: "Failed to retrieve asset licenses" });
  }
});

app.get("/api/licenses/verify/:assetId/:userAddress", async (req, res) => {
  try {
    const { assetId, userAddress } = req.params;

    const userLicenses = await firebaseDB.get(`user-licenses/${userAddress}`);
    if (!userLicenses || !userLicenses.licenses) {
      return res.json({ success: true, hasLicense: false, licenses: [] });
    }

    const assetLicenses = [];
    for (const licenseId of userLicenses.licenses) {
      const licenseData = await firebaseDB.get(`licenses/${licenseId}`);
      if (licenseData && licenseData.assetId === assetId && licenseData.status === 'confirmed') {
        assetLicenses.push({
          licenseId: licenseData.licenseId,
          licenseType: licenseData.licenseType,
          purchasedAt: licenseData.purchasedAt,
          paymentAmount: licenseData.paymentAmount,
          paymentToken: licenseData.paymentToken,
        });
      }
    }

    res.json({
      success: true,
      hasLicense: assetLicenses.length > 0,
      licenses: assetLicenses,
      highestLicense: assetLicenses.length > 0 ? assetLicenses.reduce((highest: any, current: any) => {
        const licenseHierarchy: { [key: string]: number } = { 'BASIC': 1, 'COMMERCIAL': 2, 'EXCLUSIVE': 3, 'CUSTOM': 2 };
        return (licenseHierarchy[current.licenseType] || 0) > (licenseHierarchy[highest.licenseType] || 0) ? current : highest;
      }) : null
    });

  } catch (error) {
    console.error("License verification failed:", error);
    res.status(500).json({ error: "Failed to verify license ownership" });
  }
});

app.get("/api/licenses/analytics/:creatorAddress", async (req, res) => {
  try {
    const { creatorAddress } = req.params;
    const { timeframe = '30d' } = req.query;

    const assets = await firebaseDB.getUserAssets(creatorAddress);
    let totalRevenue = 0;
    let totalSales = 0;
    const licenseTypes: { [key: string]: number } = { BASIC: 0, COMMERCIAL: 0, EXCLUSIVE: 0, CUSTOM: 0 };
    const monthlyData: { [key: string]: { sales: number; revenue: number } } = {};

    for (const asset of assets) {
      const assetLicenses = await firebaseDB.get(`asset-licenses/${asset.id}`);
      if (assetLicenses && assetLicenses.sales) {
        for (const licenseId of assetLicenses.sales) {
          const licenseData = await firebaseDB.get(`licenses/${licenseId}`);
          if (licenseData && licenseData.status === 'confirmed') {
            totalRevenue += licenseData.paymentAmount || 0;
            totalSales += 1;
            if (licenseData.licenseType && licenseTypes[licenseData.licenseType] !== undefined) {
              licenseTypes[licenseData.licenseType] += 1;
            }

            const month = new Date(licenseData.purchasedAt).toISOString().substring(0, 7);
            if (!monthlyData[month]) {
              monthlyData[month] = { sales: 0, revenue: 0 };
            }
            monthlyData[month].sales += 1;
            monthlyData[month].revenue += licenseData.paymentAmount || 0;
          }
        }
      }
    }

    res.json({
      success: true,
      analytics: {
        totalRevenue,
        totalSales,
        averageSalePrice: totalSales > 0 ? totalRevenue / totalSales : 0,
        licenseTypeBreakdown: licenseTypes,
        monthlyData: Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
          month,
          ...data
        })).sort((a: any, b: any) => a.month.localeCompare(b.month)),
        totalAssets: assets.length,
      }
    });

  } catch (error) {
    console.error("License analytics failed:", error);
    res.status(500).json({ error: "Failed to get license analytics" });
  }
});


const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log('⚠️  Elasticsearch temporarily disabled for development');
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🔍 Search API available at http://localhost:${PORT}/api/search`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/search/health`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer();
