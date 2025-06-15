"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Always redirect to landing page for home route
    router.push('/landing')
  }, [router])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Loading Story Protocol...</p>
      </motion.div>
    </div>
  )
}
