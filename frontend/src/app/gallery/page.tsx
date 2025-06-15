"use client";

import React from "react";
import Gallery from "./Gallery";
import TomoWalletGuard from "../../components/guards/TomoWalletGuard";
import { useAccount } from 'wagmi';

export default function GalleryPage() {
  return (
    <TomoWalletGuard>
      <GalleryContent />
    </TomoWalletGuard>
  );
}

const GalleryContent = () => {
  // Safe hook usage within TomoWalletGuard (wallet is guaranteed to be connected)
  const { address } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <Gallery walletAddress={address || null} />
    </div>
  );
}
