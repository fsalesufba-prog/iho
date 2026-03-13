'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/landing/Header'
import { Footer } from '@/components/landing/Footer'
import { Container } from '@/components/common/Container'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import { BlogHeader } from '@/components/blog/BlogHeader'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <BlogHeader />
        
        <Container size="lg" className="py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2">
              {children}
            </div>
            
            <aside className="lg:col-span-1">
              <BlogSidebar />
            </aside>
          </motion.div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}