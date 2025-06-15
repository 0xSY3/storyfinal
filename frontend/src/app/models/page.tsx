"use client";

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Brain, 
  Sparkles, 
  Clock, 
  User, 
  ExternalLink, 
  Play, 
  ShoppingCart, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Eye,
  Calendar,
  Shield,
  Zap,
  Crown,
  Star,
  Rocket,
  AlertCircle,
  Plus
} from "lucide-react"
import { useAccount } from "wagmi"
import TomoWalletGuard from "../../components/guards/TomoWalletGuard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useModelLoader, useAllModelsLoader } from "../../hooks/useModelLoader"
import ImageGenerationModal from "../../components/ImageGenerationModal"
import useImageGeneration from "../../hooks/useImageGeneration"
import { Address, keccak256 } from "viem"
import { useStoryClient } from "../../hooks/useStoryClient"
import { LicenseTerms } from "@story-protocol/core-sdk"
import { zeroAddress } from "viem"
import axios from "axios"

interface Model {
  modelName: string
  walletAddress: string
  status: string
  description?: string
  createdAt: string
  selectedIpIds?: string[]
  ipId?: string
  licenseTermsId?: string
  error?: string
  Cid?: string
}

const modelUsageLicenseTerms: LicenseTerms = {
  transferable: true,
  royaltyPolicy: "0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E",
  defaultMintingFee: BigInt(1),
  expiration: BigInt(0),
  commercialUse: true,
  commercialAttribution: true,
  commercializerChecker: zeroAddress,
  commercializerCheckerData: zeroAddress,
  commercialRevShare: 0,
  commercialRevCeiling: BigInt(0),
  derivativesAllowed: false,
  derivativesAttribution: false,
  derivativesApproval: false,
  derivativesReciprocal: false,
  derivativeRevCeiling: BigInt(0),
  currency: "0x1514000000000000000000000000000000000000",
  uri: "",
}

export default function ModelsPage() {
  return (
    <TomoWalletGuard>
      <ModelsContent />
    </TomoWalletGuard>
  );
}

function ModelsContent() {
  const [licenseStatusMap, setLicenseStatusMap] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<"my" | "all">("my")
  const [selectedModel, setSelectedModel] = useState<{ name: string; owner: string } | null>(null)
  const [generationModalOpen, setGenerationModalOpen] = useState(false)
  const [notification, setNotification] = useState<{
    show: boolean
    message: string
    type: "success" | "error"
  }>({ show: false, message: "", type: "success" })
  const [rerender, setRerender] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    model: Model | null
  }>({ open: false, model: null })

  const { client } = useStoryClient()
  const { address: walletAddress } = useAccount()
  const { generateImage } = useImageGeneration()
  
  const {
    models: myModels,
    loading: myLoading,
    error: myError,
    refetchModels,
  } = useModelLoader(walletAddress ?? null)
  
  const {
    models: allModels,
    loading: allLoading,
    error: allError,
  } = useAllModelsLoader()

  useEffect(() => {
    const fetchTokenStatuses = async () => {
      if (!walletAddress || !allModels.length) return

      const updatedStatus: Record<string, boolean> = {}

      for (const model of allModels) {
        try {
          const res = await axios.get(
            `http://localhost:3001/api/license-token/${walletAddress}`
          )
          updatedStatus[model.modelName] = res.data?.hasToken
        } catch (error) {
          console.error("Failed to fetch license status:", error)
          updatedStatus[model.modelName] = false
        }
      }

      setLicenseStatusMap(updatedStatus)
    }

    fetchTokenStatuses()
  }, [walletAddress, allModels, rerender])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { 
          label: "Ready", 
          icon: CheckCircle, 
          variant: "success" as const,
          color: "text-green-400"
        }
      case "processing":
        return { 
          label: "Training", 
          icon: Loader2, 
          variant: "warning" as const,
          color: "text-yellow-400"
        }
      case "pending":
        return { 
          label: "Queued", 
          icon: Clock, 
          variant: "info" as const,
          color: "text-blue-400"
        }
      case "failed":
        return { 
          label: "Failed", 
          icon: XCircle, 
          variant: "destructive" as const,
          color: "text-red-400"
        }
      default:
        return { 
          label: status, 
          icon: AlertCircle, 
          variant: "outline" as const,
          color: "text-gray-400"
        }
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const shortenAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const handleOpenGenerationModal = (modelName: string, modelOwner: string) => {
    setSelectedModel({ name: modelName, owner: modelOwner })
    setGenerationModalOpen(true)
  }

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 5000)
  }

  const RegisterModelIP = async (model: Model) => {
    if (!client || !walletAddress) {
      showNotification("Please connect your wallet", "error")
      return
    }

    try {
      const metadataURI = `ipfs://${model.Cid}`

      const response = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
        ipMetadata: {
          ipMetadataURI: metadataURI,
          ipMetadataHash: keccak256(
            new TextEncoder().encode(`metadata-${model.Cid}`)
          ),
          nftMetadataURI: metadataURI,
          nftMetadataHash: keccak256(
            new TextEncoder().encode(`nft-${model.Cid}`)
          ),
        },
        txOptions: {
          waitForTransaction: true,
          confirmations: 1,
        },
      })

      const response1 = await client.ipAsset.registerPilTermsAndAttach({
        ipId: response.ipId,
        licenseTermsData: [{ terms: modelUsageLicenseTerms }],
        txOptions: { waitForTransaction: true },
      })

      await axios.post("http://localhost:3001/api/update-model-info", {
        walletAddress,
        modelName: model.modelName,
        ipId: response.ipId,
        licenseTermsId: response1.licenseTermsIds?.map((id) => id.toString()),
      })

      await refetchModels()
      showNotification(`Model successfully registered! IP ID: ${response.ipId}`, "success")
      setRerender((prev) => !prev)
    } catch (error) {
      showNotification(
        `Registration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        "error"
      )
    }
  }

  const handleBuyModelLicense = async (model: Model) => {
    if (!client || !walletAddress) {
      showNotification("Please connect your wallet", "error")
      return
    }

    try {
      const response = await client.license.mintLicenseTokens({
        licensorIpId: model.ipId as `0x${string}`,
        licenseTermsId: model.licenseTermsId!,
        receiver: walletAddress,
        amount: 1,
        maxMintingFee: BigInt(1),
        maxRevenueShare: 100,
        txOptions: { waitForTransaction: true },
      })

      const tokenIds = response.licenseTokenIds?.map((id) => id.toString()) || []
      
      await axios.post("http://localhost:3001/api/license-token", {
        walletAddress,
        licenseTokenIds: tokenIds,
      })

      showNotification("License purchased successfully!", "success")
      setRerender((prev) => !prev)
      setConfirmDialog({ open: false, model: null })
    } catch (error) {
      showNotification("License purchase failed", "error")
    }
  }

  const ModelCard = ({ model, showCreator = false }: { model: Model; showCreator?: boolean }) => {
    const statusConfig = getStatusConfig(model.status)
    const StatusIcon = statusConfig.icon
    const hasToken = licenseStatusMap[model.modelName] === true
    const isOwner = walletAddress === model.walletAddress
    const canUse = isOwner || hasToken
    const isProcessing = model.status === "processing"

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="glass-effect h-full group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border-slate-200/50 hover:border-emerald-500/30">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                  {model.modelName}
                </CardTitle>
                <CardDescription className="text-slate-600 mt-2">
                  {model.description || "No description provided"}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />}
                <Badge variant={statusConfig.variant} className="font-semibold">
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Creator Info */}
            {showCreator && (
              <div className="flex items-center space-x-3 p-3 glass-effect rounded-xl">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-green-600 text-white text-xs">
                    {model.walletAddress.slice(2, 4).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">Creator</p>
                  <p className="text-xs text-slate-600 font-mono">
                    {shortenAddress(model.walletAddress)}
                  </p>
                </div>
                {!isOwner && <Crown className="w-4 h-4 text-yellow-400" />}
              </div>
            )}

            {/* IP IDs */}
            {model.selectedIpIds && model.selectedIpIds.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-slate-800">Protected IPs</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {model.selectedIpIds.map((ipId, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs bg-green-500/10 border-green-500/30 text-green-600 hover:bg-green-500/20"
                      onClick={() => {
                        window.open(
                          `https://explorer.story.foundation/ipa/${ipId}`,
                          "_blank"
                        )
                      }}
                    >
                      <Shield className="w-3 h-3 mr-1" />
                      {ipId.substring(0, 6)}...{ipId.substring(ipId.length - 4)}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(model.createdAt)}</span>
              </div>
              {hasToken && !isOwner && (
                <div className="flex items-center space-x-1 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>Licensed</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {model.status === "failed" && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">Training failed</span>
                </div>
                {model.error && (
                  <p className="text-xs text-red-500 mt-1">{model.error}</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {model.status !== "completed" ? (
                <Button 
                  disabled 
                  className="w-full"
                  variant="outline"
                >
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isProcessing ? "Training in Progress..." : "Not Ready"}
                </Button>
              ) : canUse && model.ipId ? (
                <Button
                  onClick={() => handleOpenGenerationModal(model.modelName, model.walletAddress)}
                  className="w-full bg-green-600 hover:bg-green-700 glow"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Generate Images
                </Button>
              ) : model.ipId && !isOwner ? (
                <Button
                  onClick={() => setConfirmDialog({ open: true, model })}
                  variant="premium"
                  className="w-full"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase License
                </Button>
              ) : !model.ipId && isOwner ? (
                <Button
                  onClick={() => RegisterModelIP(model)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Register IP
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const LoadingCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="glass-effect h-64">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-slate-200 rounded-lg" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-slate-100 rounded" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                </div>
                <div className="h-10 bg-slate-200 rounded-lg mt-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )

  const EmptyState = ({ type }: { type: "my" | "all" }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 mx-auto mb-6 glass-effect rounded-full flex items-center justify-center">
        <Brain className="w-12 h-12 text-emerald-600" />
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2">
        {type === "my" ? "No Models Yet" : "No Models Available"}
      </h3>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        {type === "my" 
          ? "Start by uploading images and training your first AI model"
          : "There are no public models available at the moment"
        }
      </p>
      {type === "my" && (
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Your First Model
        </Button>
      )}
    </motion.div>
  )

  const currentModels = activeTab === "my" ? myModels : allModels
  const currentLoading = activeTab === "my" ? myLoading : allLoading
  const currentError = activeTab === "my" ? myError : allError

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-16 h-16 glass-effect rounded-2xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gradient">AI Models</h1>
            <p className="text-slate-600">Create and manage your AI-powered content with CreativeIP</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="glass-effect rounded-2xl p-2 flex space-x-2">
          {[
            { key: "my" as const, label: "My Models", icon: User },
            { key: "all" as const, label: "Marketplace", icon: Eye },
          ].map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "ghost"}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex items-center space-x-2 px-6 py-2 rounded-xl transition-all duration-300",
                activeTab === key
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {currentLoading ? (
          <LoadingCards />
        ) : currentError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h3>
            <p className="text-red-600">{currentError}</p>
          </motion.div>
        ) : currentModels.length === 0 ? (
          <EmptyState type={activeTab} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentModels.map((model, index) => (
              <motion.div
                key={`${model.modelName}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ModelCard model={model} showCreator={activeTab === "all"} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Modals and Notifications */}
      <AnimatePresence>
        {selectedModel && walletAddress && (
          <ImageGenerationModal
            open={generationModalOpen}
            onClose={() => setGenerationModalOpen(false)}
            modelName={selectedModel.name}
            modelOwner={selectedModel.owner}
            walletAddress={walletAddress}
            onSuccess={() => showNotification("Images generated successfully!", "success")}
          />
        )}

        {/* Purchase Confirmation */}
        {confirmDialog.open && confirmDialog.model && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setConfirmDialog({ open: false, model: null })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Purchase License</h3>
                <p className="text-slate-600">
                  Purchase a license for <strong className="text-slate-800">{confirmDialog.model.modelName}</strong> 
                  to start generating images with this AI model.
                </p>
                <div className="flex space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDialog({ open: false, model: null })}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleBuyModelLicense(confirmDialog.model!)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Notification */}
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className={cn(
              "glass-effect rounded-xl p-4 max-w-sm shadow-2xl border",
              notification.type === "success" 
                ? "border-green-500/30 bg-green-100" 
                : "border-red-500/30 bg-red-100"
            )}>
              <div className="flex items-center space-x-3">
                {notification.type === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <p className={cn(
                  "font-medium",
                  notification.type === "success" ? "text-green-700" : "text-red-700"
                )}>
                  {notification.message}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}