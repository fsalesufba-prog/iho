'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { DashboardHeader } from './DashboardHeader'
import { DashboardSidebar } from './DashboardSidebar'
<<<<<<< HEAD
import { DashboardToolbar } from './DashboardToolbar'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { useMediaQuery } from '@/components/hooks/useMediaQuery'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showSidebar?: boolean
  showHeader?: boolean
  showToolbar?: boolean
  sidebarCollapsed?: boolean
  onSidebarCollapse?: (collapsed: boolean) => void
  toolbarItems?: React.ReactNode
  className?: string
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  showSidebar = true,
  showHeader = true,
<<<<<<< HEAD
  showToolbar = true,
  sidebarCollapsed: externalCollapsed,
  onSidebarCollapse,
  toolbarItems,
=======
  sidebarCollapsed: externalCollapsed,
  onSidebarCollapse,
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  className
}: DashboardLayoutProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed

  const handleSidebarCollapse = () => {
    const newCollapsed = !collapsed
    if (onSidebarCollapse) {
      onSidebarCollapse(newCollapsed)
    } else {
      setInternalCollapsed(newCollapsed)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <DashboardHeader 
          title={title}
          subtitle={subtitle}
          onMenuClick={isMobile ? handleSidebarCollapse : undefined}
        />
      )}

      <div className="flex">
        {showSidebar && (
          <DashboardSidebar
            collapsed={collapsed}
            onCollapse={handleSidebarCollapse}
            mobile={isMobile}
          />
        )}

        <main className={cn(
          'flex-1 transition-all duration-300',
          showSidebar && !isMobile && (collapsed ? 'ml-20' : 'ml-64'),
          className
        )}>
<<<<<<< HEAD
          {showToolbar && toolbarItems && (
            <DashboardToolbar>
              {toolbarItems}
            </DashboardToolbar>
          )}

=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

// Layout sem sidebar
DashboardLayout.Compact = function CompactLayout({
  children,
  ...props
}: Omit<DashboardLayoutProps, 'showSidebar'>) {
  return (
    <DashboardLayout
      showSidebar={false}
      {...props}
    >
      {children}
    </DashboardLayout>
  )
}

// Layout com largura máxima
DashboardLayout.Constrained = function ConstrainedLayout({
  children,
  maxWidth = '1400px',
  ...props
}: DashboardLayoutProps & { maxWidth?: string }) {
  return (
    <DashboardLayout {...props}>
      <div style={{ maxWidth, margin: '0 auto' }}>
        {children}
      </div>
    </DashboardLayout>
  )
}