import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Image generation API call
export async function generateImage({
  modelName,
  modelOwnerAddress,
  walletAddress,
  prompt,
  numOfImages = 1,
}: {
  modelName: string;
  modelOwnerAddress: string;
  walletAddress: string;
  prompt: string;
  numOfImages?: number;
}) {
  try {
    const response = await axios.post(`${API_URL}/api/generate-image`, {
      modelName,
      modelOwnerAddress,
      walletAddress,
      prompt,
      numOfImages,
    });

    return response.data;
  } catch (error: any) {
    console.error("Image generation API call failed:", error);
    throw new Error(
      error.response?.data?.error || "Image generation failed"
    );
  }
}

// View generated image list
export async function getGeneratedImages(walletAddress: string) {
  try {
    const response = await axios.get(
      `${API_URL}/api/generated-images/${walletAddress}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to retrieve generated image list:", error);
    throw error;
  }
}
