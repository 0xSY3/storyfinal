'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Shield, Loader2 } from 'lucide-react'
import IPRegistrationModal from './IPRegistrationModal'

interface Asset {
  id: string
  fileName: string
  ipfsHash: string
  assetType: string
  metadata?: any
}

interface IPRegistrationButtonProps {
  asset: Asset
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onSuccess?: (ipId: string, txHash: string) => void
}

export default function IPRegistrationButton({
  asset,
  variant = 'default',
  size = 'default',
  className = '',
  onSuccess
}: IPRegistrationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSuccess = (ipId: string, txHash: string) => {
    setIsModalOpen(false)
    if (onSuccess) {
      onSuccess(ipId, txHash)
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} bg-green-600 hover:bg-green-700 text-white`}
        onClick={() => setIsModalOpen(true)}
      >
        <Shield className="w-4 h-4 mr-2" />
        Register IP
      </Button>

      <IPRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        asset={asset}
        onSuccess={handleSuccess}
      />
    </>
  )
}