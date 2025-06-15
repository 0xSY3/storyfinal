"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  Search, 
  Upload, 
  Settings, 
  BarChart3, 
  ImageIcon, 
  Receipt,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import MetaMaskWalletButton from "../MetaMaskWalletButton"
import TomoWalletButton from "../TomoWalletButton"

interface NavigationItem {
  label: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

interface ModernNavbarProps {}

const navigationItems: NavigationItem[] = [
  { label: "Home", path: "/", icon: Home },
  { label: "Repository", path: "/gallery", icon: ImageIcon },
  { label: "Upload", path: "/upload", icon: Upload },
  { label: "Models", path: "/models", icon: Settings },
  { label: "Dashboard", path: "/dashboard", icon: BarChart3 },
  { label: "Licenses", path: "/licenses", icon: Receipt },
]

export default function ModernNavbar({}: ModernNavbarProps) {
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActivePage = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  if (!mounted) return null

  // Determine which wallet to show based on current page
  const isLicensePage = pathname.startsWith('/licenses')
  const showMetaMask = isLicensePage
  const showTomo = !isLicensePage

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled 
            ? "glass-effect shadow-xl" 
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative h-14 w-40"
              >
                <Image
                  src="/logo.png"
                  alt="CreativeIP Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="glass-effect rounded-2xl p-2 flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const isActive = isActivePage(item.path)
                  const Icon = item.icon
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          "relative flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-green-500/20 text-slate-800 shadow-lg"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-sm">{item.label}</span>
                        {item.badge && (
                          <Badge variant="destructive" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="absolute inset-0 bg-green-500/10 rounded-xl border border-green-500/20"
                          />
                        )}
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Wallet Button - Show appropriate wallet based on page */}
              {showTomo && <TomoWalletButton />}
              {showMetaMask && <MetaMaskWalletButton />}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden glass-effect"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden glass-effect border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const isActive = isActivePage(item.path)
                  const Icon = item.icon
                  
                  return (
                    <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-green-500/20 text-slate-800"
                            : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <Badge variant="destructive" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer to prevent content from going under navbar */}
      <div className="h-20" />
    </>
  )
}