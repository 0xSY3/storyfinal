import { Request, Response } from 'express';
import { storyProtocolService } from '../utils/storyProtocolService';

interface RegisterIPRequest {
  assetId: string;
  creatorAddress: string;
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

interface PrepareIPRegistrationRequest {
  creatorAddress: string;
}

export const registerIPAsset = async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { creatorAddress, title, description, category, tags }: RegisterIPRequest = req.body;

    if (!assetId || !creatorAddress) {
      return res.status(400).json({ 
        error: 'Asset ID and creator address are required' 
      });
    }

    console.log(`📝 IP Registration request for asset ${assetId} by ${creatorAddress}`);

    // Here you would typically:
    // 1. Fetch asset details from your database
    // 2. Prepare metadata
    // 3. Register with Story Protocol

    // For now, we'll use mock data and the existing service
    const mockAssetData = {
      assetId,
      ipfsHash: 'QmExample...', // This should come from your database
      creatorAddress,
      metadata: {
        title: title || `Asset ${assetId}`,
        description: description || 'Digital asset registered on Story Protocol',
        category: category || 'digital-content',
        tags: tags || []
      }
    };

    const result = await storyProtocolService.registerIPAsset(mockAssetData);

    if (result.success) {
      console.log(`✅ IP Asset registered: ${result.ipId}`);
      res.json({
        success: true,
        ipId: result.ipId,
        tokenId: result.tokenId,
        txHash: result.txHash
      });
    } else {
      console.error(`❌ IP registration failed: ${result.error}`);
      res.status(500).json({
        success: false,
        error: result.error || 'Registration failed'
      });
    }

  } catch (error: any) {
    console.error('IP registration API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
};

export const prepareIPRegistration = async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { creatorAddress }: PrepareIPRegistrationRequest = req.body;

    if (!assetId || !creatorAddress) {
      return res.status(400).json({ 
        error: 'Asset ID and creator address are required' 
      });
    }

    console.log(`📋 Preparing IP registration for asset ${assetId}`);

    // Here you would typically:
    // 1. Fetch asset from database
    // 2. Check if already registered
    // 3. Prepare metadata URIs and hashes

    // Mock response for now
    const mockAssetData = {
      title: `Asset ${assetId}`,
      description: 'Digital asset for IP registration',
      ipfsHash: 'QmExample...',
      assetType: 'image'
    };

    // Create metadata for IP registration
    const ipMetadata = {
      title: mockAssetData.title,
      description: mockAssetData.description,
      ipType: 'Original Work',
      assetType: mockAssetData.assetType,
      creator: creatorAddress,
      createdAt: new Date().toISOString(),
      ipfsHash: mockAssetData.ipfsHash
    };

    const nftMetadata = {
      name: mockAssetData.title,
      description: mockAssetData.description,
      image: `ipfs://${mockAssetData.ipfsHash}`,
      attributes: [
        { trait_type: 'Asset Type', value: mockAssetData.assetType },
        { trait_type: 'Creator', value: creatorAddress },
        { trait_type: 'Registration Date', value: new Date().toISOString().split('T')[0] }
      ]
    };

    // Convert to strings and create hashes
    const ipMetadataString = JSON.stringify(ipMetadata);
    const nftMetadataString = JSON.stringify(nftMetadata);

    const ipMetadataHash = `0x${Buffer.from(ipMetadataString).toString('hex').slice(0, 64).padEnd(64, '0')}`;
    const nftMetadataHash = `0x${Buffer.from(nftMetadataString).toString('hex').slice(0, 64).padEnd(64, '0')}`;

    const ipMetadataURI = `data:application/json;base64,${Buffer.from(ipMetadataString).toString('base64')}`;
    const nftMetadataURI = `data:application/json;base64,${Buffer.from(nftMetadataString).toString('base64')}`;

    res.json({
      success: true,
      alreadyRegistered: false, // You would check this from your database
      registrationData: {
        ipMetadataURI,
        ipMetadataHash,
        nftMetadataURI,
        nftMetadataHash
      }
    });

  } catch (error: any) {
    console.error('IP registration preparation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to prepare registration data'
    });
  }
};

export const updateAssetWithIPInfo = async (req: Request, res: Response) => {
  try {
    const { assetId } = req.params;
    const { ipId, tokenId, txHash } = req.body;

    if (!assetId || !ipId || !txHash) {
      return res.status(400).json({ 
        error: 'Asset ID, IP ID, and transaction hash are required' 
      });
    }

    console.log(`📝 Updating asset ${assetId} with IP info: ${ipId}`);

    // Here you would update your database with the IP registration info
    // For now, just return success
    
    res.json({
      success: true,
      message: 'Asset updated with IP registration info'
    });

  } catch (error: any) {
    console.error('Asset update error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update asset'
    });
  }
};