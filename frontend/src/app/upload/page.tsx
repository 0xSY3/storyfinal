"use client";

import React from "react";
import Upload from "./Upload";
import TomoWalletGuard from "../../components/guards/TomoWalletGuard";
import { useAccount } from 'wagmi';

const UploadPage = () => {
  return (
    <TomoWalletGuard>
      <TomoUploadContent />
    </TomoWalletGuard>
  );
};

const TomoUploadContent = () => {
  // Safe hook usage within TomoWalletGuard (wallet is guaranteed to be connected)
  const { address } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 pt-24 pb-12">
      <Upload
        walletAddress={address || null}
        isStoryChainConnected={true} // Not needed for backend processing, but keeping for UI
      />
    </div>
  );
};

export default UploadPage;
