'use client'

// Extend window object for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Copy,
  FileText,
  DollarSign,
  Users,
  Sparkles
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Asset {
  id: string
  fileName: string
  ipfsHash: string
  assetType: string
  metadata?: any
}

interface IPRegistrationModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset | null
  onSuccess?: (ipId: string, txHash: string) => void
}

const LICENSE_TYPES = [
  {
    id: 'non_commercial',
    name: 'Non-Commercial Social Remixing',
    description: 'Free to use for non-commercial purposes with attribution',
    icon: Users,
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'commercial_use',
    name: 'Commercial Use',
    description: 'Allow commercial use with revenue sharing',
    icon: DollarSign,
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'custom',
    name: 'Custom License',
    description: 'Define your own licensing terms',
    icon: FileText,
    color: 'bg-purple-100 text-purple-800'
  }
]

export default function IPRegistrationModal({ 
  isOpen, 
  onClose, 
  asset, 
  onSuccess 
}: IPRegistrationModalProps) {

  const [step, setStep] = useState<'form' | 'license' | 'registering' | 'success' | 'error'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [ipId, setIpId] = useState<string | null>(null)
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    category: '',
    commercialUse: false,
    attribution: true,
    derivativeWorks: true,
    royaltyPercentage: 10
  })

  const [selectedLicense, setSelectedLicense] = useState<string>('non_commercial')

  const resetModal = useCallback(() => {
    setStep('form')
    setIsLoading(false)
    setError(null)
    setTxHash(null)
    setIpId(null)
    setFormData({
      title: '',
      description: '',
      tags: '',
      category: '',
      commercialUse: false,
      attribution: true,
      derivativeWorks: true,
      royaltyPercentage: 10
    })
    setSelectedLicense('non_commercial')
  }, [])

  const handleClose = useCallback(() => {
    if (!isLoading) {
      resetModal()
      onClose()
    }
  }, [isLoading, resetModal, onClose])

  const registerIPAsset = async () => {
    if (!asset) {
      setError('Asset not selected')
      return
    }

    try {
      setStep('registering')
      setIsLoading(true)
      setError(null)

      console.log('🚀 Starting IP registration for asset:', asset.id)
      console.log('📋 Using backend service for IP registration...')
      
      const backendResponse = await fetch(`http://localhost:3001/api/assets/${asset.id}/register-ip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title || asset.fileName,
          description: formData.description,
          category: formData.category,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          licenseType: selectedLicense
        })
      })

      const backendResult = await backendResponse.json()
      
      if (backendResponse.ok && backendResult.success) {
        console.log('✅ IP Asset registered via backend service:', backendResult.ipId)
        setTxHash(backendResult.txHash)
        setIpId(backendResult.ipId)
        setStep('success')
        toast.success('IP Asset registered successfully!')
        
        if (onSuccess) {
          onSuccess(backendResult.ipId, backendResult.txHash)
        }
        return
      } else {
        throw new Error(backendResult.error || 'Backend registration failed')
      }

    } catch (err: any) {
      console.error('❌ IP registration failed:', err)
      setError(err.message || 'Failed to register IP asset')
      setStep('error')
      toast.error('IP registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  if (!isOpen || !asset) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Shield className="w-5 h-5 text-green-600" />
            Register IP Asset
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Register "{asset.fileName}" as an intellectual property asset on Story Protocol
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="text-gray-700">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={asset.fileName}
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
                <div>
                  <Label htmlFor="category" className="text-gray-700">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900">
                      <SelectItem value="art">Digital Art</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="3d_model">3D Model</SelectItem>
                      <SelectItem value="dataset">Dataset</SelectItem>
                      <SelectItem value="code">Source Code</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your intellectual property..."
                  rows={3}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div>
                <Label htmlFor="tags" className="text-gray-700">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="ai-generated, abstract, colorful, digital-art"
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Asset Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-700 font-medium">File:</span>
                    <p className="font-semibold text-slate-900">{asset.fileName}</p>
                  </div>
                  <div>
                    <span className="text-slate-700 font-medium">Type:</span>
                    <p className="font-semibold text-slate-900">{asset.assetType}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-700 font-medium">IPFS Hash:</span>
                    <p className="font-mono text-xs break-all text-slate-800 bg-white p-2 rounded border">{asset.ipfsHash}</p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                  Cancel
                </Button>
                <Button 
                  onClick={() => setStep('license')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={!formData.title && !asset.fileName}
                >
                  Next: Choose License
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'license' && (
            <motion.div
              key="license"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h4 className="font-semibold text-gray-900">Choose License Type</h4>
              <div className="space-y-3">
                {LICENSE_TYPES.map((license) => {
                  const Icon = license.icon
                  return (
                    <div
                      key={license.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedLicense === license.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedLicense(license.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${license.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900">{license.name}</h5>
                          <p className="text-sm text-gray-700 mt-1">{license.description}</p>
                        </div>
                        {selectedLicense === license.id && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('form')} className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                  Back
                </Button>
                <Button 
                  onClick={registerIPAsset}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Register IP Asset
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'registering' && (
            <motion.div
              key="registering"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <Sparkles className="w-16 h-16 text-green-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Registering IP Asset...
              </h3>
              <p className="text-gray-700 mb-4">
                This may take a few moments. Please don't close this window.
              </p>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-blue-900 mb-2">What's happening:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Creating metadata for your IP asset</li>
                  <li>• Submitting registration to Story Protocol</li>
                  <li>• Attaching license terms</li>
                  <li>• Waiting for blockchain confirmation</li>
                </ul>
              </div>
            </motion.div>
          )}

          {step === 'success' && ipId && txHash && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-8 h-8 text-green-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                IP Asset Registered Successfully!
              </h3>
              <p className="text-gray-700 mb-6">
                Your intellectual property is now protected on Story Protocol
              </p>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg text-left">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-semibold text-green-900">IP Asset ID</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-2 bg-white border border-gray-200 rounded text-sm font-mono break-all text-gray-800">{ipId}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(ipId, 'IP ID')}
                          className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-green-900">Transaction Hash</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="flex-1 p-2 bg-white border border-gray-200 rounded text-sm font-mono break-all text-gray-800">{txHash}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(txHash, 'Transaction Hash')}
                          className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://aeneid.storyscan.io/tx/${txHash}`, '_blank')}
                          className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge className="bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    IP Protected
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800">
                    <FileText className="w-3 h-3 mr-1" />
                    {selectedLicense === 'non_commercial' ? 'Non-Commercial' : 
                     selectedLicense === 'commercial_use' ? 'Commercial Use' : 'Custom License'}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3 justify-center mt-6">
                <Button
                  onClick={() => window.open(`https://explorer.story.foundation/ipa/${ipId}`, '_blank')}
                  variant="outline"
                  className="bg-white text-green-600 border-green-300 hover:bg-green-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Story Explorer
                </Button>
                <Button
                  onClick={() => window.open(`https://aeneid.storyscan.io/tx/${txHash}`, '_blank')}
                  variant="outline"
                  className="bg-white text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Transaction
                </Button>
              </div>

              <DialogFooter className="mt-6">
                <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700 text-white">
                  Done
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Registration Failed
              </h3>
              <p className="text-gray-700 mb-4">
                {error || 'An unexpected error occurred'}
              </p>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50">
                  Cancel
                </Button>
                <Button onClick={() => setStep('form')} className="bg-green-600 hover:bg-green-700 text-white">
                  Try Again
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}