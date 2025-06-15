"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Upload, 
  Search, 
  Eye, 
  Star,
  Download,
  Shield,
  Database,
  TrendingUp,
  Clock,
  FileImage,
  Users,
  Activity,
  Zap,
  Heart,
  BookOpen,
  Settings,
  DollarSign,
  Award,
  Bookmark,
  Calendar,
  BarChart3,
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  ExternalLink,
  Copy,
  Palette,
  Camera,
  Video,
  Music,
  FileText,
  Box,
  Code,
  Sparkles,
  Globe,
  Link as LinkIcon,
  Wallet
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useSearchAssets, useTrendingAssets } from "../../hooks/useSearchAssets"
import { useGalleryLoader } from "../../hooks/useGalleryLoader"
import { useBatchVerification } from "../../hooks/useYakoaVerification"
import UniversalAssetPreview from "../AssetPreviews/UniversalAssetPreview"
import VerificationBadge from "../Verification/VerificationBadge"
import Link from "next/link"

interface RealDashboardProps {
  walletAddress: string | null
}

const assetTypeIcons = {
  image: Camera,
  video: Video,
  audio: Music,
  document: FileText,
  model_3d: Box,
  dataset: Database,
  code: Code,
}

export default function RealDashboard({ walletAddress }: RealDashboardProps) {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  
  // Get real data
  const { data: allAssets, isLoading: allAssetsLoading } = useSearchAssets({
    page: 1,
    size: 100
  })
  
  const { data: userAssets, isLoading: userAssetsLoading } = useSearchAssets({
    filters: walletAddress ? { creator: walletAddress } : {},
    page: 1,
    size: 50
  }, { enabled: !!walletAddress })
  
  const { data: trendingAssets, isLoading: trendingLoading } = useTrendingAssets('7d')
  const { data: userGeneratedImages, isLoading: generatedLoading } = useGalleryLoader(walletAddress)

  // Get verification data for user assets
  const userAssetIds = userAssets?.hits?.map((asset: any) => asset.id) || []
  const { data: verificationData } = useBatchVerification(userAssetIds, {
    enabled: userAssetIds.length > 0
  })

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay('morning')
    else if (hour < 18) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')
  }, [])

  const getGreeting = () => {
    const greetings = {
      morning: "Good morning",
      afternoon: "Good afternoon", 
      evening: "Good evening"
    }
    return greetings[timeOfDay]
  }

  // Calculate real stats
  const totalAssets = allAssets?.total || 0
  const userAssetCount = userAssets?.total || 0
  const recentAssets = userAssets?.hits?.slice(0, 8) || []
  const latestTrending = trendingAssets?.slice(0, 8) || []
  const verifiedAssets = userAssetIds.filter(id => verificationData?.[id]?.verificationStatus === 'verified').length
  const pendingAssets = userAssetIds.filter(id => verificationData?.[id]?.verificationStatus === 'pending').length
  const generatedCount = userGeneratedImages?.length || 0

  // Real activity stats with live data
  const activityStats = [
    {
      title: "Your Assets",
      value: userAssetCount,
      description: "Assets uploaded",
      icon: Database,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      loading: userAssetsLoading,
      href: "/gallery"
    },
    {
      title: "Verified", 
      value: verifiedAssets,
      description: "IP protected",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      loading: !verificationData && userAssetIds.length > 0,
      href: "/gallery"
    },
    {
      title: "AI Generated",
      value: generatedCount,
      description: "Created with AI",
      icon: Zap,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      loading: generatedLoading,
      href: "/models"
    },
    {
      title: "Platform Total",
      value: totalAssets,
      description: "All platform assets",
      icon: Globe,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50", 
      loading: allAssetsLoading,
      href: "/gallery"
    }
  ]

  // Enhanced quick actions with distinct professional colors
  const quickActions = [
    {
      title: "Upload Asset",
      description: "Share your creative work and register IP",
      icon: Upload,
      href: "/upload",
      gradient: "bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
      bgPattern: "from-emerald-100/20 to-emerald-200/20",
      iconBg: "bg-emerald-100/30",
      stats: `${userAssetCount} uploaded`,
      accent: "emerald"
    },
    {
      title: "Explore Assets",
      description: `Discover ${totalAssets.toLocaleString()} IP assets`, 
      icon: Search,
      href: "/gallery",
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      bgPattern: "from-blue-100/20 to-blue-200/20",
      iconBg: "bg-blue-100/30",
      stats: `${totalAssets} total assets`,
      accent: "blue"
    },
    {
      title: "Generate Art",
      description: "Create with AI models",
      icon: Star,
      href: "/models", 
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      bgPattern: "from-purple-100/20 to-purple-200/20",
      iconBg: "bg-purple-100/30",
      stats: `${generatedCount} generated`,
      accent: "purple"
    },
    {
      title: "Your Collection",
      description: "Manage your portfolio",
      icon: Eye,
      href: "/gallery",
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700",
      bgPattern: "from-indigo-100/20 to-indigo-200/20",
      iconBg: "bg-indigo-100/30",
      stats: `${verifiedAssets} verified`,
      accent: "indigo"
    },
    {
      title: "IP Licensing",
      description: "License and monetize assets",
      icon: BookOpen,
      href: "/licenses",
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      bgPattern: "from-orange-100/20 to-orange-200/20",
      iconBg: "bg-orange-100/30",
      stats: "Earn royalties",
      accent: "orange"
    },
    {
      title: "Cross-Chain Pay",
      description: "Pay with deBridge protocol",
      icon: LinkIcon,
      href: "/gallery",
      gradient: "bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700",
      bgPattern: "from-teal-100/20 to-teal-200/20",
      iconBg: "bg-teal-100/30",
      stats: "Multi-chain",
      accent: "teal"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="container mx-auto p-4 space-y-6">
        {/* Enhanced Header with gradient background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-lg p-6 border border-emerald-200 shadow-xl"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-green-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-teal-200/30 to-emerald-200/30 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-3xl"
              >
                👋
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 via-green-700 to-teal-700 bg-clip-text text-transparent">
                  {getGreeting()}!
                </h1>
                <p className="text-gray-600 mt-1">
                  {walletAddress 
                    ? "Welcome back to your IP workspace" 
                    : "Connect your wallet to unlock the full experience"
                  }
                </p>
              </div>
            </div>
            
            {walletAddress && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 font-mono">
                    {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(walletAddress)}
                    className="p-1 h-auto hover:bg-white/80"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                {verifiedAssets > 0 && (
                  <Badge className="bg-green-100 text-green-800 border border-green-200">
                    <Shield className="w-3 h-3 mr-1" />
                    {verifiedAssets} Verified
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Link href="/upload">
              <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <Upload className="w-4 h-4 mr-2" />
                Upload Asset
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" className="bg-white/80 backdrop-blur-sm border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 transform hover:scale-105 transition-all duration-300">
                <Search className="w-4 h-4 mr-2" />
                Explore
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Activity Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {activityStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={index} href={stat.href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border border-emerald-200/50 bg-white/90 backdrop-blur-sm hover:bg-white">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-50 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-3 rounded-xl shadow-sm", stat.bgColor)}>
                        <Icon className={cn("w-6 h-6", stat.color)} />
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="text-xs text-gray-400"
                      >
                        <TrendingUp className="w-4 h-4" />
                      </motion.div>
                    </div>
                    <div>
                      <motion.p 
                        className="text-2xl font-bold text-gray-900 mb-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        {stat.loading ? (
                          <span className="animate-pulse bg-gray-200 rounded w-12 h-6 block"></span>
                        ) : (
                          stat.value.toLocaleString()
                        )}
                      </motion.p>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{stat.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed">{stat.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Quick Actions with visible text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-2"
        >
          <Card className="border border-emerald-200/50 bg-white/90 backdrop-blur-sm h-full shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Activity className="w-5 h-5 text-emerald-600" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-gray-600">
                Jump into your most common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Link key={index} href={action.href}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        className="group cursor-pointer h-full"
                      >
                        <div className={cn(
                          "relative overflow-hidden rounded-xl p-5 transition-all duration-300 text-white h-full min-h-[140px] flex flex-col justify-between shadow-lg hover:shadow-xl",
                          action.gradient
                        )}>
                          {/* Background pattern */}
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                          <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-6 -translate-x-6"></div>
                          
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-3">
                              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm flex-shrink-0">
                                <Icon className="w-5 h-5 text-white" />
                              </div>
                              <Badge className="bg-white/20 text-white text-xs border-white/30">
                                {action.stats}
                              </Badge>
                            </div>
                            
                            <div>
                              <h3 className="font-bold text-white mb-2 text-lg leading-tight">
                                {action.title}
                              </h3>
                              <p className="text-sm text-white/90 leading-relaxed">
                                {action.description}
                              </p>
                            </div>
                          </div>
                          
                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300"></div>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Real Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-1"
        >
          <Card className="border border-emerald-200/50 bg-white/90 backdrop-blur-sm h-full flex flex-col shadow-lg">
            <CardHeader className="pb-4 flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <Clock className="w-5 h-5 text-emerald-600" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-gray-600">
                {walletAddress ? "Your latest uploads" : "Platform highlights"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pb-6">
              <div className="flex-1 min-h-0">
                {walletAddress && recentAssets.length > 0 ? (
                  <div className="space-y-3 h-full">
                    <div className="space-y-3 overflow-y-auto max-h-[400px]">
                      {recentAssets.slice(0, 8).map((asset: any) => {
                        const verification = verificationData?.[asset.id]
                        return (
                          <div
                            key={asset.id}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <UniversalAssetPreview asset={asset} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {decodeURIComponent(asset.fileName || 'Untitled')}
                                </p>
                                {verification && (
                                  <VerificationBadge verification={verification} size="small" />
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                                  {asset.assetType}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(asset.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <Link href="/gallery">
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700">
                          <Eye className="w-4 h-4 mr-2" />
                          View All Assets
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : walletAddress && userAssetsLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="flex items-center space-x-3 p-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : walletAddress && recentAssets.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center py-8">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-4">No assets uploaded yet</p>
                      <Link href="/upload">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Upload Your First Asset
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="h-full">
                    {trendingLoading ? (
                      <div className="space-y-3">
                        {[1,2,3,4].map((i) => (
                          <div key={i} className="flex items-center space-x-3 p-2">
                            <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse" />
                              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : latestTrending.length > 0 ? (
                      <div className="space-y-3 h-full">
                        <div className="space-y-3 overflow-y-auto max-h-[400px]">
                          {latestTrending.slice(0, 6).map((asset: any, index: number) => (
                            <div
                              key={asset.id || index}
                              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <UniversalAssetPreview asset={asset} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {decodeURIComponent(asset.fileName || asset.title || 'Trending Asset')}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className="text-xs bg-orange-100 text-orange-800">
                                    🔥 #{index + 1}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-gray-100">
                          <Link href="/gallery">
                            <Button variant="outline" className="w-full border-gray-300 text-gray-700">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Explore Trending
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center py-8">
                          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-4">No trending assets</p>
                          <Link href="/gallery">
                            <Button size="sm" variant="outline" className="border-gray-300 text-gray-700">
                              Explore Platform
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Real Trending Section - Only show if there are trending assets */}
      {latestTrending.length > 0 && !trendingLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border border-emerald-200/50 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Trending This Week
              </CardTitle>
              <CardDescription className="text-gray-600">
                Most popular IP assets on the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {latestTrending.slice(0, 8).map((asset: any, index: number) => (
                  <Link key={asset.id || index} href="/gallery">
                    <div className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-2">
                        <UniversalAssetPreview asset={asset} />
                        <div className="absolute top-1 left-1">
                          <Badge className="bg-orange-500 text-white text-xs px-1 py-0">
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 truncate group-hover:text-emerald-600 transition-colors leading-tight">
                        {decodeURIComponent(asset.fileName || asset.title || 'Trending Asset')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {asset.assetType || 'Asset'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {latestTrending.length > 8 && (
                <div className="flex justify-center mt-6">
                  <Link href="/gallery">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Globe className="w-4 h-4 mr-2" />
                      View All Trending
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
      </div>
    </div>
  )
}