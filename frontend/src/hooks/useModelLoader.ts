import { useState, useEffect, useCallback } from "react";
import axios from "axios";

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
  modelCid?: string;
  error?: string;
  modelIpfsHash?: string;
  ipId?: string;
  licenseTermsId?: string;
}

interface ApiResponse {
  success: boolean;
  data: ModelData[];
}

export const useModelLoader = (walletAddress: string | null) => {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    if (!walletAddress) {
      setModels([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(
        `http://localhost:3001/api/models/${walletAddress}`
      );

      setModels(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      setError("An error occurred while loading models.");
      console.error("Model loading failed:", error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchModels();
  }, [walletAddress, fetchModels]);

  const refetchModels = useCallback(() => fetchModels(), [fetchModels]);

  return { models, loading, error, refetchModels };
};

export const useAllModelsLoader = () => {
  const [models, setModels] = useState<ModelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllModels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<ApiResponse>(
        `http://localhost:3001/api/models`
      );

      console.log(
        "All model data:",
        JSON.stringify(response.data.data, null, 2)
      );
      console.log("First model details:", response.data.data[1]);

      setModels(response.data.data);
    } catch (error) {
      setError("An error occurred while loading models.");
      console.error("Model loading failed:", error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllModels();
  }, [fetchAllModels]);

  const refetchAllModels = useCallback(
    () => fetchAllModels(),
    [fetchAllModels]
  );

  return { models, loading, error, refetchAllModels };
};
