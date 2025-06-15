"use client"

import React from "react"
import { motion } from "framer-motion"
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileImage,
  BarChart3,
  Upload,
  Eye,
  Download,
  Star
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

const stats = [
  {
    title: "Total Revenue",
    value: "$12,426",
    change: "+20.1%",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  {
    title: "Active Assets",
    value: "2,350",
    change: "+180",
    icon: FileImage,
    color: "text-green-600",
    bgColor: "bg-green-600/10"
  },
  {
    title: "Licenses Sold",
    value: "12,234",
    change: "+19%",
    icon: TrendingUp,
    color: "text-green-700",
    bgColor: "bg-green-700/10"
  },
  {
    title: "Active Users",
    value: "1,429",
    change: "+5.2%",
    icon: Users,
    color: "text-green-800",
    bgColor: "bg-green-800/10"
  }
]

// Recent assets will be loaded from the real API instead of mock data
const recentAssets: any[] = []

const quickActions = [
  {
    title: "Upload New Asset",
    description: "Add new digital content to your portfolio",
    icon: Upload,
    href: "/upload",
    color: "bg-green-600"
  },
  {
    title: "View Analytics",
    description: "Track your performance and earnings",
    icon: BarChart3,
    href: "/analytics",
    color: "bg-green-700"
  },
  {
    title: "Browse Repository",
    description: "Explore and manage IP assets",
    icon: Eye,
    href: "/gallery",
    color: "bg-green-800"
  },
  {
    title: "Generate Content",
    description: "Create AI-powered artwork",
    icon: Star,
    href: "/models",
    color: "bg-green-900"
  }
]

export default function ModernDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-gradient">Creator Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your digital assets and track your earnings
          </p>
        </div>
        <Button className="glow">
          <Plus className="w-5 h-5 mr-2" />
          Create New Asset
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="glass-effect hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className={cn("text-xs", stat.color)}>
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                    <Icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
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
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Streamline your workflow with these shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <motion.div
                      key={index}
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
                            <h3 className="font-semibold text-lg group-hover:text-blue-400 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
              <CardTitle>Recent Assets</CardTitle>
              <CardDescription>
                Your latest uploaded content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={asset.image} alt={asset.title} />
                    <AvatarFallback className="bg-green-600">
                      <FileImage className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{asset.title}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={asset.status === 'Active' ? 'success' : 'warning'}>
                        {asset.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {asset.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{asset.revenue}</p>
                    <p className="text-xs text-muted-foreground">
                      {asset.views.toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full mt-4">
                View All Assets
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>
              Track your earnings over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-green-500/10 rounded-xl border border-white/10">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Analytics chart will be displayed here</p>
                <Button variant="outline" className="mt-4">
                  View Detailed Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}