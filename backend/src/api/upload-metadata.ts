import { Request, Response } from 'express';
import axios from 'axios';

interface MetadataUploadRequest {
  metadata: any;
  name?: string;
}

export const uploadMetadataToIPFS = async (req: Request, res: Response) => {
  try {
    const { metadata, name }: MetadataUploadRequest = req.body;

    if (!metadata) {
      return res.status(400).json({ error: 'Metadata is required' });
    }

    // Upload to Pinata
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      {
        pinataContent: metadata,
        pinataMetadata: {
          name: name || `metadata-${Date.now()}`,
          keyvalues: {
            type: 'story-protocol-metadata',
            timestamp: new Date().toISOString()
          }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.PINATA_JWT}`,
        },
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const ipfsUri = `https://ipfs.io/ipfs/${ipfsHash}`;

    res.json({
      success: true,
      ipfsHash,
      ipfsUri,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`
    });

  } catch (error: any) {
    console.error('Metadata upload error:', error);
    res.status(500).json({ 
      error: 'Failed to upload metadata to IPFS',
      details: error.response?.data || error.message 
    });
  }
};