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
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useSearchAssets, useTrendingAssets } from "../../hooks/useSearchAssets"
import { useGalleryLoader } from "../../hooks/useGalleryLoader"
import { useBatchVerification } from "../../hooks/useYakoaVerification"
import UniversalAssetPreview from "../AssetPreviews/UniversalAssetPreview"
import VerificationBadge from "../Verification/VerificationBadge"
import Link from "next/link"

interface EnhancedDashboardProps {
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

export default function EnhancedDashboard({ walletAddress }: EnhancedDashboardProps) {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  const [notifications] = useState([
    { id: 1, type: 'success', message: 'Welcome to Story IP Protocol!', time: '2 min ago' },
    { id: 2, type: 'info', message: 'New trending assets available', time: '1 hour ago' },
  ])
  
  // Get real data
  const { data: allAssets, isLoading: allAssetsLoading } = useSearchAssets({
    page: 1,
    size: 100
  })
  
  const { data: userAssets, isLoading: userAssetsLoading } = useSearchAssets({
    filters: walletAddress ? { creator: walletAddress } : {},
    page: 1,
    size: 20
  }, { enabled: !!walletAddress })
  
  const { data: trendingAssets } = useTrendingAssets('7d')
  const { data: userGeneratedImages } = useGalleryLoader(walletAddress)

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
  const recentAssets = userAssets?.hits?.slice(0, 5) || []
  const latestTrending = trendingAssets?.slice(0, 6) || []
  const verifiedAssets = userAssetIds.filter(id => verificationData?.[id]?.verificationStatus === 'verified').length
  const pendingAssets = userAssetIds.filter(id => verificationData?.[id]?.verificationStatus === 'pending').length

  // Enhanced activity stats
  const activityStats = [
    {
      title: "Your Assets",
      value: userAssetCount.toString(),
      description: "IP assets uploaded",
      icon: Database,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: userAssetCount > 0 ? "+100%" : "0%",
      href: "/gallery"
    },
    {
      title: "Verified Assets", 
      value: verifiedAssets.toString(),
      description: "Successfully verified",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: verifiedAssets > 0 ? `${Math.round((verifiedAssets/userAssetCount)*100)}%` : "0%",
      href: "/gallery"
    },
    {
      title: "AI Generated",
      value: (userGeneratedImages?.length || 0).toString(),
      description: "AI artwork created",
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+New",
      href: "/models"
    },
    {
      title: "Trending",
      value: latestTrending.length.toString(),
      description: "Hot assets this week",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50", 
      change: "+Live",
      href: "/gallery"
    }
  ]

  // Enhanced quick actions with better visibility
  const quickActions = [
    {
      title: "Upload Asset",
      description: "Share your creative work and register IP",
      icon: Upload,
      href: "/upload",
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-white"
    },
    {
      title: "Explore Assets",
      description: "Discover IP in the repository", 
      icon: Search,
      href: "/gallery",
      color: "bg-gradient-to-r from-green-500 to-green-600",
      textColor: "text-white"
    },
    {
      title: "Generate Art",
      description: "Create with AI models",
      icon: Star,
      href: "/models", 
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      textColor: "text-white"
    },
    {
      title: "Your Collection",
      description: "Manage your assets",
      icon: Eye,
      href: "/gallery",
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      textColor: "text-white"
    },
    {
      title: "IP Licensing",
      description: "Manage asset licenses",
      icon: BookOpen,
      href: "/licenses",
      color: "bg-gradient-to-r from-indigo-500 to-indigo-600",
      textColor: "text-white"
    },
    {
      title: "Cross-Chain Pay",
      description: "License with deBridge",
      icon: LinkIcon,
      href: "/gallery",
      color: "bg-gradient-to-r from-pink-500 to-pink-600",
      textColor: "text-white"
    }
  ]

  // Asset type breakdown
  const assetTypeBreakdown = userAssets?.hits?.reduce((acc: any, asset: any) => {
    acc[asset.assetType] = (acc[asset.assetType] || 0) + 1
    return acc
  }, {}) || {}

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Enhanced Personal Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/20 to-blue-200/20 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-4xl"
              >
                👋
              </motion.div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-2">
                  {getGreeting()}!
                </h1>
                <p className="text-lg text-gray-600">
                  {walletAddress 
                    ? "Welcome back to your IP workspace" 
                    : "Connect your wallet to unlock the full experience"
                  }
                </p>
              </div>
            </div>
            
            {walletAddress && (
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <Wallet className="w-4 h-4" />
                <span className="font-mono bg-gray-100 px-3 py-1 rounded-full">
                  {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(walletAddress)}
                  className="p-1 h-auto"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Link href="/upload">
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                <Upload className="w-5 h-5 mr-2" />
                Upload Asset
              </Button>
            </Link>
            <Link href="/gallery">
              <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                <Search className="w-5 h-5 mr-2" />
                Explore
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Notifications Bar */}
      {notifications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{notifications[0].message}</p>
                    <p className="text-sm text-gray-500">{notifications[0].time}</p>
                  </div>
                </div>
                <Badge variant="secondary">{notifications.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Activity Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {activityStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={index} href={stat.href}>
              <Card className="group hover:scale-105 transition-all duration-300 cursor-pointer border-0 shadow-lg hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                      <Icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-2xl font-bold mb-1">{stat.value}</p>
                    <p className="text-sm font-medium text-gray-900 mb-1">{stat.title}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Enhanced Quick Actions with better visibility */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-6 h-6 text-green-600" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-base">
                Jump into your most common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Link key={index} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group cursor-pointer"
                      >
                        <div className={cn(
                          "rounded-xl p-6 transition-all duration-300 shadow-md hover:shadow-lg",
                          action.color
                        )}>
                          <div className="flex flex-col items-center text-center space-y-3">
                            <div className="p-3 rounded-xl bg-white/20">
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-white mb-1">
                                {action.title}
                              </h3>
                              <p className="text-sm text-white/90">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Activity Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                {walletAddress ? "Your latest uploads" : "Platform highlights"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletAddress && recentAssets.length > 0 ? (
                <>
                  {recentAssets.map((asset: any) => {
                    const verification = verificationData?.[asset.id]
                    return (
                      <div
                        key={asset.id}
                        className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <UniversalAssetPreview asset={asset} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium truncate">
                              {decodeURIComponent(asset.fileName || 'Untitled')}
                            </p>
                            {verification && (
                              <VerificationBadge verification={verification} size="small" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
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
                  <Link href="/gallery">
                    <Button variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View All Assets
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {latestTrending.slice(0, 4).map((asset: any, index: number) => (
                    <div
                      key={asset.id || index}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <UniversalAssetPreview asset={asset} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {decodeURIComponent(asset.fileName || asset.title || 'Trending Asset')}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="text-xs bg-orange-100 text-orange-800">
                            🔥 Trending
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href="/gallery">
                    <Button variant="outline" className="w-full">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Explore Trending
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Asset Analytics Section */}
      {walletAddress && userAssetCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid lg:grid-cols-2 gap-8"
        >
          {/* Asset Type Breakdown */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Asset Breakdown
              </CardTitle>
              <CardDescription>
                Your content by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(assetTypeBreakdown).map(([type, count]: [string, any]) => {
                  const Icon = assetTypeIcons[type as keyof typeof assetTypeIcons] || FileImage
                  const percentage = Math.round((count / userAssetCount) * 100)
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium capitalize">{type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{count}</span>
                          <Badge variant="outline" className="text-xs">
                            {percentage}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Verification Status
              </CardTitle>
              <CardDescription>
                IP protection overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Verified Assets</p>
                      <p className="text-sm text-green-700">Successfully protected</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-900">{verifiedAssets}</p>
                    <p className="text-xs text-green-600">
                      {userAssetCount > 0 ? Math.round((verifiedAssets/userAssetCount)*100) : 0}%
                    </p>
                  </div>
                </div>

                {pendingAssets > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <p className="font-medium text-yellow-900">Pending Verification</p>
                        <p className="text-sm text-yellow-700">Being processed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-yellow-900">{pendingAssets}</p>
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Link href="/gallery">
                    <Button variant="outline" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Manage IP Protection
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Trending Section */}
      {latestTrending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-orange-600" />
                Trending on the Platform
              </CardTitle>
              <CardDescription>
                Most popular IP assets this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {latestTrending.map((asset: any, index: number) => (
                  <Link key={asset.id || index} href="/gallery">
                    <div className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-xl bg-gray-100 aspect-video mb-3">
                        <UniversalAssetPreview asset={asset} />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-orange-500 text-white text-xs">
                            #{index + 1} Trending
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <h4 className="font-medium text-sm truncate group-hover:text-green-600 transition-colors">
                        {decodeURIComponent(asset.fileName || asset.title || 'Trending Asset')}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {asset.assetType || 'Asset'} • Popular
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex justify-center mt-6">
                <Link href="/gallery">
                  <Button variant="outline" className="px-8">
                    <Globe className="w-4 h-4 mr-2" />
                    Explore All Trending Assets
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Getting Started Section */}
      {(!walletAddress || userAssetCount === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Sparkles className="w-6 h-6 text-blue-600" />
                {!walletAddress ? "Get Started with Story IP" : "Build Your IP Portfolio"}
              </CardTitle>
              <CardDescription className="text-base">
                {!walletAddress 
                  ? "Join the decentralized IP revolution"
                  : "Upload your first asset to get started with IP protection"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-xl bg-white/60">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">1. Connect Wallet</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Link your digital wallet to manage IP assets securely
                  </p>
                  {!walletAddress && (
                    <Button variant="outline" size="sm">
                      Connect Now
                    </Button>
                  )}
                </div>
                <div className="text-center p-6 rounded-xl bg-white/60">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">2. Upload Content</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Share your creative work and register IP rights on-chain
                  </p>
                  <Link href="/upload">
                    <Button variant="outline" size="sm">
                      Upload Asset
                    </Button>
                  </Link>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/60">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-lg mb-2">3. Start Earning</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    License your assets globally and earn from your creativity
                  </p>
                  <Link href="/gallery">
                    <Button variant="outline" size="sm">
                      Explore Market
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}