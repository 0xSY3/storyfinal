import { db } from '../config/firebase';
import { Asset, AssetType, AssetMetadata } from '../types/assetTypes';

interface ImageData {
  cid: string;
  fileName: string;
  mimeType: string;
  size: number;
  creatorAddress: string;
  metadata: {
    fileName: string;
    mimeType: string;
    size: number;
    timestamp: string;
  };
  createdAt: string;
  tokenId?: string;
  mintedAt?: string;
  ipId?: string;
  licenseTermsIds?: string[];
}

interface ImageEntry {
  id: string;
  data: ImageData;
}

function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefinedValues(item));
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanUndefinedValues(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  
  return obj;
}

export const firebaseDB = {
  async get(path: string) {
    const snapshot = await db.ref(path).once('value');
    return snapshot.val();
  },

  async set(path: string, data: any) {
    const cleanedData = cleanUndefinedValues(data);
    await db.ref(path).set(cleanedData);
    return cleanedData;
  },

  async update(path: string, data: any) {
    const cleanedData = cleanUndefinedValues(data);
    await db.ref(path).update(cleanedData);
    return cleanedData;
  },

  async remove(path: string) {
    await db.ref(path).remove();
  },

  onValue(path: string, callback: (data: any) => void) {
    return db.ref(path).on('value', (snapshot) => {
      callback(snapshot.val());
    });
  },

  async findImageByCID(cid: string, walletAddress: string) {
    try {
      const imagesRef = db.ref('images');
      const snapshot = await imagesRef.once('value');
      const images = snapshot.val();
      
      if (!images) {
        return null;
      }
      
      for (const id in images) {
        const image = images[id];
        if (image.cid === cid && image.creatorAddress === walletAddress) {
          return { ...image, id };
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },

  async updateNFTInfo(imageId: string, nftInfo: { tokenId: string, mintedAt: string, ipId?: string }) {
    try {
      const updateData: any = {
        tokenId: nftInfo.tokenId,
        mintedAt: nftInfo.mintedAt
      };
      
      if (nftInfo.ipId) {
        updateData.ipId = nftInfo.ipId;
      }
      
      await db.ref(`images/${imageId}`).update(updateData);
      return true;
    } catch (error) {
      return false;
    }
  },

  async getUserImages(address: string) {
    try {
      const snapshot = await db.ref('images').once('value');
      const images = snapshot.val();
      
      if (!images) return [];

      return Object.entries(images)
        .filter(([_, image]: [string, any]) => image.creatorAddress === address)
        .map(([id, image]: [string, any]) => ({
          id,
          ...image
        }))
        .sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
      throw error;
    }
  },

  async updateImageData(imageId: string, updateData: any) {
    try {
      await db.ref(`images/${imageId}`).update(updateData);
      return true;
    } catch (error) {
      return false;
    }
  },

  async deleteImage(imageId: string) {
    try {
      await db.ref(`images/${imageId}`).remove();
      
      return true;
    } catch (error) {
      return false;
    }
  },

  async createAsset(asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const assetId = Date.now().toString();
      const assetData = {
        ...asset,
        id: assetId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await db.ref(`assets/${assetId}`).set(assetData);
      return { ...assetData, id: assetId };
    } catch (error) {
      console.error('Asset creation failed:', error);
      throw error;
    }
  },

  async findAssetByCID(cid: string, creatorAddress: string) {
    try {
      const assetsRef = db.ref('assets');
      const snapshot = await assetsRef.once('value');
      const assets = snapshot.val();
      
      if (!assets) {
        return null;
      }
      
      for (const id in assets) {
        const asset = assets[id];
        if (asset.cid === cid && asset.creatorAddress === creatorAddress) {
          return { ...asset, id };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Asset lookup failed:', error);
      return null;
    }
  },

  async updateAsset(assetId: string, updates: Partial<Asset>) {
    try {
      const cleanedUpdates = cleanUndefinedValues({
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      await db.ref(`assets/${assetId}`).update(cleanedUpdates);
      return true;
    } catch (error) {
      console.error('Asset update failed:', error);
      throw error;
    }
  },

  async getAssetById(assetId: string) {
    try {
      const snapshot = await db.ref(`assets/${assetId}`).once('value');
      const asset = snapshot.val();
      
      if (!asset) {
        return null;
      }
      
      return { ...asset, id: assetId };
    } catch (error) {
      console.error('Asset retrieval failed:', error);
      return null;
    }
  },

  async getUserAssets(address: string, assetType?: AssetType) {
    try {
      const snapshot = await db.ref('assets').once('value');
      const assets = snapshot.val();
      
      if (!assets) return [];

      let filteredAssets = Object.entries(assets)
        .filter(([_, asset]: [string, any]) => asset.creatorAddress === address);

      if (assetType) {
        filteredAssets = filteredAssets.filter(([_, asset]: [string, any]) => asset.assetType === assetType);
      }

      return filteredAssets
        .map(([id, asset]: [string, any]) => ({
          id,
          ...asset
        }))
        .sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
      console.error('User assets lookup failed:', error);
      throw error;
    }
  },

  async getAllAssets(assetType?: AssetType, limit?: number) {
    try {
      const snapshot = await db.ref('assets').once('value');
      const assets = snapshot.val();
      
      if (!assets) return [];

      let assetsList = Object.entries(assets)
        .map(([id, asset]: [string, any]) => ({
          id,
          ...asset
        }));

      if (assetType) {
        assetsList = assetsList.filter(asset => asset.assetType === assetType);
      }

      assetsList.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      if (limit) {
        assetsList = assetsList.slice(0, limit);
      }

      return assetsList;
    } catch (error) {
      console.error('Assets lookup failed:', error);
      throw error;
    }
  },


  async deleteAsset(assetId: string) {
    try {
      await db.ref(`assets/${assetId}`).remove();
      return true;
    } catch (error) {
      console.error('Asset deletion failed:', error);
      return false;
    }
  },

  async searchAssets(query: string, assetType?: AssetType) {
    try {
      const snapshot = await db.ref('assets').once('value');
      const assets = snapshot.val();
      
      if (!assets) return [];

      const lowerQuery = query.toLowerCase();
      
      let results = Object.entries(assets)
        .map(([id, asset]: [string, any]) => ({
          id,
          ...asset
        }))
        .filter((asset: any) => {
          const searchText = [
            asset.fileName,
            asset.metadata?.description || '',
            asset.metadata?.category || '',
            asset.metadata?.subcategory || '',
            ...(asset.searchTags || [])
          ].join(' ').toLowerCase();
          
          return searchText.includes(lowerQuery);
        });

      if (assetType) {
        results = results.filter(asset => asset.assetType === assetType);
      }

      return results.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Asset search failed:', error);
      throw error;
    }
  }
}; 