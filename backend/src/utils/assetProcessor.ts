import { AssetType, AssetMetadata, ASSET_TYPE_CONFIGS } from '../types/assetTypes';
import { Readable } from 'stream';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export class AssetProcessor {
  private tempDir: string;

  constructor() {
    this.tempDir = process.env.TEMP_DIR || '/tmp/asset-processing';
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  private generateTempPath(originalName: string, suffix: string = ''): string {
    const hash = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(originalName);
    return path.join(this.tempDir, `${hash}${suffix}${ext}`);
  }

  async processAsset(
    file: Express.Multer.File,
    assetType: AssetType
  ): Promise<{
    metadata: Partial<AssetMetadata>;
    thumbnailBuffer?: Buffer;
    previewBuffer?: Buffer;
    extractedData?: any;
  }> {
    const tempPath = this.generateTempPath(file.originalname);
    
    try {
      // Write file to temp location
      await fs.writeFile(tempPath, file.buffer);

      switch (assetType) {
        case AssetType.IMAGE:
          return await this.processImage(file, tempPath);
        case AssetType.AUDIO:
          return await this.processAudio(file, tempPath) as any;
        case AssetType.VIDEO:
          return await this.processVideo(file, tempPath) as any;
        case AssetType.DOCUMENT:
          return await this.processDocument(file, tempPath);
        case AssetType.MODEL_3D:
          return await this.process3DModel(file, tempPath);
        case AssetType.DATASET:
          return await this.processDataset(file, tempPath);
        case AssetType.CODE:
          return await this.processCode(file, tempPath);
        default:
          return { metadata: {} };
      }
    } finally {
      // Cleanup temp file
      try {
        await fs.unlink(tempPath);
      } catch (error) {
        console.warn('Failed to cleanup temp file:', tempPath);
      }
    }
  }

  private async processImage(file: Express.Multer.File, tempPath: string) {
    try {
      const image = sharp(file.buffer);
      const metadata = await image.metadata();
      
      // Generate thumbnail
      const thumbnailBuffer = await image
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Extract color palette (simplified)
      const { dominant } = await image.stats();
      
      return {
        metadata: {
          dimensions: {
            width: metadata.width,
            height: metadata.height
          },
          processingData: {
            colorPalette: [`rgb(${dominant.r},${dominant.g},${dominant.b})`],
            technicalSpecs: {
              format: metadata.format,
              colorSpace: metadata.space,
              channels: metadata.channels,
              hasAlpha: metadata.hasAlpha
            }
          }
        },
        thumbnailBuffer,
        previewBuffer: thumbnailBuffer
      };
    } catch (error) {
      console.error('Image processing failed:', error);
      return { metadata: {} };
    }
  }

  private async processAudio(file: Express.Multer.File, tempPath: string) {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(tempPath, (err, metadata) => {
        if (err) {
          console.error('Audio processing failed:', err);
          resolve({ metadata: {} });
          return;
        }

        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        if (!audioStream) {
          resolve({ metadata: {} });
          return;
        }

        resolve({
          metadata: {
            dimensions: {
              duration: parseFloat(audioStream.duration || '0')
            },
            processingData: {
              technicalSpecs: {
                codec: audioStream.codec_name,
                bitRate: audioStream.bit_rate,
                sampleRate: audioStream.sample_rate,
                channels: audioStream.channels
              }
            }
          }
        });
      });
    });
  }

  private async processVideo(file: Express.Multer.File, tempPath: string) {
    return new Promise((resolve) => {
      ffmpeg.ffprobe(tempPath, async (err, metadata) => {
        if (err) {
          console.error('Video processing failed:', err);
          resolve({ metadata: {} });
          return;
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        if (!videoStream) {
          resolve({ metadata: {} });
          return;
        }

        try {
          // Generate thumbnail at 1 second mark
          const thumbnailPath = this.generateTempPath(file.originalname, '_thumb');
          
          await new Promise<void>((thumbResolve, thumbReject) => {
            ffmpeg(tempPath)
              .screenshots({
                timestamps: ['1'],
                filename: path.basename(thumbnailPath),
                folder: path.dirname(thumbnailPath),
                size: '300x300'
              })
              .on('end', () => thumbResolve())
              .on('error', thumbReject);
          });

          const thumbnailBuffer = await fs.readFile(thumbnailPath);
          await fs.unlink(thumbnailPath);

          resolve({
            metadata: {
              dimensions: {
                width: videoStream.width,
                height: videoStream.height,
                duration: parseFloat(videoStream.duration || '0')
              },
              processingData: {
                technicalSpecs: {
                  codec: videoStream.codec_name,
                  bitRate: videoStream.bit_rate,
                  frameRate: videoStream.r_frame_rate,
                  pixelFormat: videoStream.pix_fmt
                }
              }
            },
            thumbnailBuffer
          });
        } catch (thumbError) {
          console.error('Video thumbnail generation failed:', thumbError);
          resolve({
            metadata: {
              dimensions: {
                width: videoStream.width,
                height: videoStream.height,
                duration: parseFloat(videoStream.duration || '0')
              }
            }
          });
        }
      });
    });
  }

  private async processDocument(file: Express.Multer.File, tempPath: string) {
    try {
      let extractedText = '';
      
      if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown') {
        extractedText = file.buffer.toString('utf-8');
      } else if (file.mimetype === 'application/pdf') {
        // For PDF processing, you'd typically use pdf-parse or similar
        // For now, we'll just extract basic info
        extractedText = 'PDF content extraction requires additional setup';
      }

      return {
        metadata: {
          processingData: {
            extractedText: extractedText.substring(0, 1000), // First 1000 chars for preview
            technicalSpecs: {
              encoding: 'utf-8',
              wordCount: extractedText.split(/\s+/).length,
              charCount: extractedText.length
            }
          }
        }
      };
    } catch (error) {
      console.error('Document processing failed:', error);
      return { metadata: {} };
    }
  }

  private async process3DModel(file: Express.Multer.File, tempPath: string) {
    // 3D model processing would require specialized libraries
    // For now, return basic metadata
    return {
      metadata: {
        processingData: {
          technicalSpecs: {
            format: path.extname(file.originalname).toLowerCase(),
            fileSize: file.size
          }
        }
      }
    };
  }

  private async processDataset(file: Express.Multer.File, tempPath: string) {
    try {
      let sampleData: any = null;
      let rowCount = 0;
      let columnCount = 0;

      if (file.mimetype === 'text/csv') {
        const content = file.buffer.toString('utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        rowCount = lines.length - 1; // Excluding header
        if (lines.length > 0) {
          columnCount = lines[0].split(',').length;
          sampleData = lines.slice(0, 6); // Header + 5 sample rows
        }
      } else if (file.mimetype === 'application/json') {
        const content = JSON.parse(file.buffer.toString('utf-8'));
        if (Array.isArray(content)) {
          rowCount = content.length;
          columnCount = content.length > 0 ? Object.keys(content[0]).length : 0;
          sampleData = content.slice(0, 5);
        }
      }

      return {
        metadata: {
          processingData: {
            technicalSpecs: {
              rowCount,
              columnCount,
              format: file.mimetype,
              sampleData
            }
          }
        }
      };
    } catch (error) {
      console.error('Dataset processing failed:', error);
      return { metadata: {} };
    }
  }

  private async processCode(file: Express.Multer.File, tempPath: string) {
    try {
      const content = file.buffer.toString('utf-8');
      const lines = content.split('\n');
      const extension = path.extname(file.originalname).toLowerCase();
      
      // Basic code analysis
      const lineCount = lines.length;
      const charCount = content.length;
      const nonEmptyLines = lines.filter(line => line.trim()).length;
      
      // Language detection based on extension
      const languageMap: Record<string, string> = {
        '.js': 'javascript',
        '.ts': 'typescript',
        '.py': 'python',
        '.sol': 'solidity',
        '.rs': 'rust',
        '.go': 'go',
        '.java': 'java',
        '.cpp': 'cpp',
        '.c': 'c',
        '.php': 'php',
        '.rb': 'ruby'
      };

      return {
        metadata: {
          processingData: {
            extractedText: content.substring(0, 1000), // First 1000 chars for preview
            technicalSpecs: {
              language: languageMap[extension] || 'unknown',
              lineCount,
              charCount,
              nonEmptyLines,
              extension
            }
          }
        }
      };
    } catch (error) {
      console.error('Code processing failed:', error);
      return { metadata: {} };
    }
  }
}