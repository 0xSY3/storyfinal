import { useState } from "react";
import axios from "axios";

interface GenerateImageParams {
  modelName: string;
  modelOwnerAddress: string;
  walletAddress: string | null;
  prompt: string;
  numOfImages?: number;
}

interface GeneratedImage {
  cid: string;
  prompt: string;
  url: string;
  modelName: string;
  modelOwner: string;
  createdAt: string;
}

interface GenerationResponse {
  success: boolean;
  message: string;
  data: {
    images: GeneratedImage[];
    usageId: string;
  };
}

export const useImageGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = async ({
    modelName,
    modelOwnerAddress,
    walletAddress,
    prompt,
    numOfImages = 1,
  }: GenerateImageParams): Promise<GeneratedImage[]> => {
    if (!walletAddress) {
      throw new Error("Wallet connection required");
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.post<GenerationResponse>(
        "http://localhost:3001/api/generate-image",
        {
          modelName,
          modelOwnerAddress,
          walletAddress,
          prompt,
          numOfImages,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Image generation failed");
      }

      return response.data.data.images;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An error occurred during image generation";

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    generateImage,
    loading,
    error,
  };
};

export default useImageGeneration;
