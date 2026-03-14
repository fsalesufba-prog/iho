'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'

export default function ComercialLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}