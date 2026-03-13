import React from 'react'

import { BlogHeader } from './BlogHeader'
import { BlogSidebar } from './BlogSidebar'

interface BlogLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  title?: string
  subtitle?: string
}

export function BlogLayout({ 
  children, 
  showSidebar = true,
  title,
  subtitle 
}: BlogLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <BlogHeader title={title} subtitle={subtitle} />
      
      <div className="container mx-auto px-4 pb-12">
        <div className={`grid ${showSidebar ? 'lg:grid-cols-3' : ''} gap-8`}>
          <main className={showSidebar ? 'lg:col-span-2' : 'lg:col-span-3'}>
            {children}
          </main>
          
          {showSidebar && (
            <aside className="lg:col-span-1">
              <BlogSidebar />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}