"use client"

import React from 'react'
import RealDashboard from "@/components/dashboard/real-dashboard"
import TomoWalletGuard from "@/components/guards/TomoWalletGuard"
import { useAccount } from 'wagmi'

export default function DashboardPage() {
  return (
    <TomoWalletGuard>
      <DashboardContent />
    </TomoWalletGuard>
  )
}

const DashboardContent = () => {
  // Safe hook usage within TomoWalletGuard (wallet is guaranteed to be connected)
  const { address } = useAccount()

  return <RealDashboard walletAddress={address || null} />
}
