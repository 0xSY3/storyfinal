import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface GeneratedImage {
  cid: string;
  prompt: string;
  url: string;
  modelName: string;
  modelOwner: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  data: GeneratedImage[];
}

export const useGalleryLoader = (walletAddress: string | null) => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    if (!walletAddress) {
      setImages([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(
        `http://localhost:3001/api/generated-images/${walletAddress}`
      );

      if (response.data.success) {
        setImages(response.data.data);
      } else {
        throw new Error("Failed to load gallery images");
      }
    } catch (err) {
      setError("An error occurred while loading gallery images");
      console.error("Gallery loading failed:", err);

      if (process.env.NODE_ENV === "development") {
        const mockImages: GeneratedImage[] = [
          {
            cid: "mock1",
            prompt: "Cartoon style image of a cat wearing a hat",
            url: "https://picsum.photos/seed/mock1/500/500",
            modelName: "Cat Model",
            modelOwner: walletAddress || "",
            createdAt: new Date().toISOString(),
          },
          {
            cid: "mock2",
            prompt: "Yacht on the sea, sunset landscape",
            url: "https://picsum.photos/seed/mock2/500/500",
            modelName: "Landscape Model",
            modelOwner: walletAddress || "",
            createdAt: new Date().toISOString(),
          },
          {
            cid: "mock3",
            prompt: "Futuristic city landscape with neon lights",
            url: "https://picsum.photos/seed/mock3/500/500",
            modelName: "City Model",
            modelOwner: walletAddress || "",
            createdAt: new Date().toISOString(),
          },
          {
            cid: "mock4",
            prompt: "Table with cookies and milk",
            url: "https://picsum.photos/seed/mock4/500/500",
            modelName: "Food Model",
            modelOwner: walletAddress || "",
            createdAt: new Date().toISOString(),
          },
        ];

        setImages(mockImages);
      }
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchImages();
  }, [walletAddress, fetchImages]);

  const refetchImages = useCallback(() => {
    return fetchImages();
  }, [fetchImages]);

  return { images, loading, error, refetchImages };
};

export default useGalleryLoader;
