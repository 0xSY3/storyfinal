import axios from "axios";
import fs from "fs/promises";
import path from "path";
import extract from "extract-zip";
import { createWriteStream } from "fs";

/**
 * Digital Asset Downloader for Story Protocol
 * Manages downloading and caching of creative content from decentralized storage
 */
export class DigitalAssetDownloader {
  private readonly assetsStorageDir: string;
  private readonly ipfsGateway: string;
  private readonly storageApiKey: string;
  private readonly storageApiSecret: string;

  constructor() {
    this.assetsStorageDir = path.join(process.cwd(), "creative-assets");
    this.ipfsGateway = "https://gateway.pinata.cloud/ipfs";
    this.storageApiKey = process.env.PINATA_API_KEY || "";
    this.storageApiSecret = process.env.PINATA_API_SECRET || "";
  }

  /**
   * Downloads creative asset packages from IPFS storage
   * @param contentHash - IPFS hash of the creative asset
   * @returns Local path to the downloaded asset
   */
  async downloadCreativeAsset(contentHash: string): Promise<string> {
    const assetLocalPath = path.join(this.assetsStorageDir, contentHash);

    try {
      // Check if asset already exists locally
      try {
        await fs.access(assetLocalPath);
        console.log("Creative asset already cached locally:", contentHash);
        return assetLocalPath;
      } catch {
        // Asset doesn't exist, proceed with download
      }

      await fs.mkdir(assetLocalPath, { recursive: true });

      console.log("Fetching creative asset from IPFS:", contentHash);
      const downloadResponse = await axios({
        method: "get",
        url: `${this.ipfsGateway}/${contentHash}`,
        headers: {
          pinata_api_key: this.storageApiKey,
          pinata_secret_api_key: this.storageApiSecret,
        },
        responseType: "stream",
      });

      const archivePath = path.join(assetLocalPath, "asset-package.zip");
      const fileWriter = createWriteStream(archivePath);

      downloadResponse.data.pipe(fileWriter);

      await new Promise((resolve, reject) => {
        fileWriter.on("finish", resolve);
        fileWriter.on("error", reject);
      });

      console.log("Extracting creative asset files...");
      await extract(archivePath, { dir: assetLocalPath });

      // Clean up archive file
      await fs.unlink(archivePath);

      console.log("Creative asset downloaded and extracted successfully:", contentHash);
      return assetLocalPath;
    } catch (error) {
      console.error("Error downloading creative asset from IPFS:", error);
      throw new Error(`Failed to download creative asset: ${contentHash}`);
    }
  }

  /**
   * Validates that required asset files are present
   * @param assetPath - Local path to the asset directory
   * @returns True if all required files are present
   */
  async validateAssetIntegrity(assetPath: string): Promise<boolean> {
    try {
      const requiredAssetFiles = ["pytorch_lora_weights.safetensors", "config.json"];

      for (const requiredFile of requiredAssetFiles) {
        const filePath = path.join(assetPath, requiredFile);
        await fs.access(filePath);
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Removes old cached assets to free up storage space
   * @param maxCacheAge - Maximum age in milliseconds before cleanup (default: 7 days)
   */
  async cleanupCachedAssets(maxCacheAge: number = 7 * 24 * 60 * 60 * 1000) {
    try {
      const cachedAssets = await fs.readdir(this.assetsStorageDir);

      for (const assetDir of cachedAssets) {
        const assetPath = path.join(this.assetsStorageDir, assetDir);
        const assetStats = await fs.stat(assetPath);

        const cacheAge = Date.now() - assetStats.mtime.getTime();
        if (cacheAge > maxCacheAge) {
          console.log("Removing cached asset:", assetDir);
          await fs.rm(assetPath, { recursive: true });
        }
      }
    } catch (error) {
      console.error("Error cleaning up cached assets:", error);
    }
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use downloadCreativeAsset instead
   */
  async downloadModelFromIPFS(cid: string): Promise<string> {
    return this.downloadCreativeAsset(cid);
  }
}

export const digitalAssetDownloader = new DigitalAssetDownloader();
