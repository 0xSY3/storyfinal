import { spawn } from 'child_process';
import path from 'path';

/**
 * Custom AI Image Processing Engine for Story Protocol
 * Handles creative content generation using fine-tuned models
 */
export class CreativeAIProcessor {
  private readonly customModelPath: string;

  constructor(modelPath: string) {
    this.customModelPath = modelPath;
  }

  /**
   * Generates creative images from text prompts using custom AI models
   * @param promptText - The creative prompt for image generation
   * @returns Promise containing base64 encoded image data
   */
  async createImageFromPrompt(promptText: string): Promise<{ imageData: string }> {
    return new Promise((resolve, reject) => {
      const aiGeneratorScript = path.join(__dirname, '../../ai-engine/model_generator.py');
      
      const aiProcess = spawn('python3', [
        aiGeneratorScript,
        '--model_path', this.customModelPath,
        '--prompt', promptText
      ]);

      let generatedOutput = '';
      let processingError = '';

      aiProcess.stdout.on('data', (data) => {
        generatedOutput += data.toString();
      });

      aiProcess.stderr.on('data', (data) => {
        processingError += data.toString();
      });

      aiProcess.on('close', (exitCode) => {
        if (exitCode !== 0) {
          console.error('AI generation error:', processingError);
          reject(new Error('Creative content generation failed'));
          return;
        }

        try {
          const generationResult = JSON.parse(generatedOutput);
          resolve(generationResult);
        } catch (parseError) {
          reject(new Error('Failed to process AI generation result'));
        }
      });
    });
  }

  /**
   * Legacy method for backward compatibility
   * @deprecated Use createImageFromPrompt instead
   */
  async generateImage(prompt: string): Promise<{ imageData: string }> {
    return this.createImageFromPrompt(prompt);
  }
} 