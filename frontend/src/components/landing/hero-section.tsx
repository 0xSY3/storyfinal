"use client"

import React, { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Sparkles, Shield, Zap, Globe, Play, Stars, Palette, FileImage, Users, TrendingUp, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Aurora from "../effects/Aurora"

interface HeroSectionProps {
  onGetStarted: () => void
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 100])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Interactive Background */}
      <div className="absolute inset-0">
        {/* WebGL Aurora Effect */}
        <div className="absolute inset-0 opacity-80 z-10">
          <Aurora
            colorStops={["#10b981", "#3b82f6", "#8b5cf6"]}
            amplitude={2.0}
            blend={0.8}
            speed={0.6}
            className="w-full h-full"
          />
        </div>
        
        {/* Animated mesh gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-blue-500/5 to-purple-500/5" />
        
        {/* Floating particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full"
            animate={{
              x: [Math.random() * 1200, Math.random() * 1200],
              y: [Math.random() * 800, Math.random() * 800],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}

        {/* Mouse-following spotlight */}
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-radial from-emerald-500/15 via-blue-500/8 to-transparent blur-3xl pointer-events-none"
          animate={{
            x: mousePosition.x - 192,
            y: mousePosition.y - 192,
          }}
          transition={{ type: "spring", damping: 25, stiffness: 150 }}
        />

        {/* Geometric shapes */}
        <motion.div style={{ y: y1 }} className="absolute top-1/4 left-1/4">
          <div className="w-32 h-32 border border-emerald-500/20 rounded-3xl rotate-45 backdrop-blur-sm" />
        </motion.div>
        <motion.div style={{ y: y2 }} className="absolute bottom-1/3 right-1/4">
          <div className="w-24 h-24 border border-purple-500/20 rounded-full backdrop-blur-sm" />
        </motion.div>
        
        {/* Additional depth layers */}
        <motion.div 
          style={{ y: useTransform(scrollY, [0, 300], [0, 50]) }}
          className="absolute top-1/2 right-1/3"
        >
          <div className="w-16 h-16 border border-blue-500/15 rounded-2xl rotate-12 backdrop-blur-sm" />
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Content */}
        <div className="text-center mb-16">
          {/* Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white border-0 px-6 py-2 text-sm font-medium">
              <Award className="w-4 h-4 mr-2" />
              Hackathon Project - Creative Frontend Track
            </Badge>
          </motion.div>

          {/* Main Heading with Gradient Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-6xl md:text-8xl font-bold leading-none mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Create
              </span>
              <br />
              <span className="text-white">Protect</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Monetize
              </span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="w-32 h-1 bg-gradient-to-r from-emerald-500 to-purple-600 mx-auto rounded-full"
            />
          </motion.div>

          {/* Enhanced Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            The ultimate <span className="text-emerald-400 font-semibold">AI-powered marketplace</span> for digital creators. 
            Register your IP instantly, protect your work with blockchain technology, 
            and earn from your creativity through <span className="text-purple-400 font-semibold">automated licensing</span>.
          </motion.p>

          {/* Enhanced CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white border-0 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Creating
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-slate-600 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 bg-slate-900/50 backdrop-blur-sm px-8 py-4 text-lg font-semibold transition-all duration-300"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>
        </div>

        {/* Enhanced Feature Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid md:grid-cols-3 gap-8 mb-20"
        >
          {[
            {
              icon: Palette,
              title: "AI Art Generation",
              description: "Create stunning artwork with advanced AI models. Train on your style, generate infinite variations.",
              gradient: "from-pink-500 to-rose-500",
              stats: "10K+ Generated"
            },
            {
              icon: Shield,
              title: "Instant IP Protection",
              description: "One-click blockchain registration. Immutable proof of ownership with Story Protocol integration.",
              gradient: "from-emerald-500 to-teal-500",
              stats: "100% Secure"
            },
            {
              icon: TrendingUp,
              title: "Smart Licensing",
              description: "Automated royalty distribution. Cross-chain payments via deBridge. Global marketplace reach.",
              gradient: "from-blue-500 to-indigo-500",
              stats: "$2M+ Earned"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <Card className="bg-slate-900/50 border-slate-700 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 h-full">
                <CardContent className="p-8 text-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-400 mb-4 leading-relaxed">{feature.description}</p>
                  
                  <Badge className="bg-slate-800 text-emerald-400 border-emerald-500/30">
                    {feature.stats}
                  </Badge>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Live Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="bg-slate-900/30 backdrop-blur-xl border border-slate-700 rounded-3xl p-8 mb-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Platform Analytics</h3>
            <p className="text-slate-400">Real-time marketplace statistics</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: FileImage, label: "Artworks Protected", value: "12,847", change: "+234%" },
              { icon: Users, label: "Active Creators", value: "3,421", change: "+89%" },
              { icon: Globe, label: "Global Licenses", value: "8,192", change: "+156%" },
              { icon: TrendingUp, label: "Revenue Generated", value: "$2.4M", change: "+312%" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.6 + index * 0.1 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300"
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 + index * 0.1 }}
                  className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent mb-1"
                >
                  {stat.value}
                </motion.div>
                
                <div className="text-sm text-slate-400 mb-1">{stat.label}</div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">
                  {stat.change}
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="text-center"
        >
          <p className="text-slate-400 mb-4">
            Join thousands of creators protecting and monetizing their digital assets
          </p>
          <div className="flex justify-center items-center gap-2 text-sm text-slate-500">
            <Stars className="w-4 h-4 text-yellow-400" />
            <span>Featured in Creative Frontend Track</span>
            <span>•</span>
            <span>Built with Story Protocol</span>
            <span>•</span>
            <span>Powered by AI</span>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-emerald-500/50 rounded-full flex justify-center backdrop-blur-sm">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-gradient-to-b from-emerald-400 to-blue-500 rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  )
}