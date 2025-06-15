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
  Settings
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useSearchAssets, useTrendingAssets } from "../../hooks/useSearchAssets"
import { useGalleryLoader } from "../../hooks/useGalleryLoader"
import UniversalAssetPreview from "../AssetPreviews/UniversalAssetPreview"
import Link from "next/link"

interface PersonalDashboardProps {
  walletAddress: string | null
}

export default function PersonalDashboard({ walletAddress }: PersonalDashboardProps) {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning')
  
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
  const recentAssets = userAssets?.hits?.slice(0, 3) || []
  const latestTrending = trendingAssets?.slice(0, 4) || []

  // Activity stats
  const activityStats = [
    {
      title: "Your Assets",
      value: userAssetCount.toString(),
      description: "IP assets you've uploaded",
      icon: Database,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/gallery"
    },
    {
      title: "Generated Images", 
      value: (userGeneratedImages?.length || 0).toString(),
      description: "AI-generated artwork",
      icon: Zap,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/models"
    },
    {
      title: "Platform Assets",
      value: totalAssets.toLocaleString(),
      description: "Total assets in repository",
      icon: FileImage,
      color: "text-green-600", 
      bgColor: "bg-green-50",
      href: "/gallery"
    },
    {
      title: "Trending Now",
      value: latestTrending.length.toString(),
      description: "Popular assets this week",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50", 
      href: "/gallery"
    }
  ]

  const quickActions = [
    {
      title: "Upload Asset",
      description: "Share your creative work",
      icon: Upload,
      href: "/upload",
      color: "bg-blue-600"
    },
    {
      title: "Explore Assets",
      description: "Discover IP in the repository", 
      icon: Search,
      href: "/gallery",
      color: "bg-green-600"
    },
    {
      title: "Generate Art",
      description: "Create with AI models",
      icon: Star,
      href: "/models", 
      color: "bg-purple-600"
    },
    {
      title: "Your Collection",
      description: "Manage your assets",
      icon: Eye,
      href: "/gallery",
      color: "bg-orange-600"
    }
  ]

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Personal Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient">
            {getGreeting()}! 👋
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            {walletAddress 
              ? "Welcome back to your IP asset workspace" 
              : "Connect your wallet to get started with IP management"
            }
          </p>
          {walletAddress && (
            <p className="text-sm text-gray-500 mt-1 font-mono">
              {`${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href="/upload">
            <Button className="glow">
              <Upload className="w-5 h-5 mr-2" />
              Upload Asset
            </Button>
          </Link>
          <Link href="/gallery">
            <Button variant="outline">
              <Search className="w-5 h-5 mr-2" />
              Explore
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Activity Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {activityStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={index} href={stat.href}>
              <Card className="glass-effect hover:scale-105 transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.description}
                      </p>
                    </div>
                    <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                      <Icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Jump into your most common tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Link key={index} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group cursor-pointer"
                      >
                        <div className="glass-effect rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="flex items-start space-x-4">
                            <div className={cn("p-3 rounded-xl", action.color)}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-400 transition-colors">
                                {action.title}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                {walletAddress ? "Your latest uploads" : "Platform highlights"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {walletAddress && recentAssets.length > 0 ? (
                <>
                  {recentAssets.map((asset: any) => (
                    <div
                      key={asset.id}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <UniversalAssetPreview asset={asset} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {decodeURIComponent(asset.fileName || 'Untitled')}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {asset.assetType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(asset.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href="/gallery">
                    <Button variant="ghost" className="w-full mt-4">
                      View All Your Assets
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {latestTrending.map((asset: any, index: number) => (
                    <div
                      key={asset.id || index}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <UniversalAssetPreview asset={asset} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {decodeURIComponent(asset.fileName || asset.title || 'Trending Asset')}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            Trending
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Popular
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link href="/gallery">
                    <Button variant="ghost" className="w-full mt-4">
                      Explore All Assets
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Trending Assets Section */}
      {latestTrending.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Trending Assets
              </CardTitle>
              <CardDescription>
                Popular IP assets on the platform this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {latestTrending.map((asset: any, index: number) => (
                  <Link key={asset.id || index} href="/gallery">
                    <div className="group cursor-pointer glass-effect rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                        <UniversalAssetPreview asset={asset} />
                      </div>
                      <h4 className="font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
                        {decodeURIComponent(asset.fileName || asset.title || 'Trending Asset')}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {asset.assetType || 'Asset'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="flex justify-center mt-6">
                <Link href="/gallery">
                  <Button variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View All Trending
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Getting Started Section - Show if no wallet or no assets */}
      {(!walletAddress || userAssetCount === 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-effect border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {!walletAddress ? "Getting Started" : "Start Building Your Collection"}
              </CardTitle>
              <CardDescription>
                {!walletAddress 
                  ? "Connect your wallet to begin managing your IP assets"
                  : "Upload your first asset to get started with IP protection"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Connect Wallet</h4>
                  <p className="text-sm text-muted-foreground">
                    Link your digital wallet to manage IP assets
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium mb-2">Upload Content</h4>
                  <p className="text-sm text-muted-foreground">
                    Share your creative work and register IP rights
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium mb-2">Start Earning</h4>
                  <p className="text-sm text-muted-foreground">
                    License your assets and earn from your creativity
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}