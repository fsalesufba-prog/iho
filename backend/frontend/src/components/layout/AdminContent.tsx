import React from 'react'
import { cn } from '@/lib/utils'

interface AdminContentProps {
  children: React.ReactNode
  className?: string
  padding?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const maxWidths = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[1400px]',
  full: 'max-w-full'
}

export function AdminContent({
  children,
  className,
  padding = true,
  maxWidth = 'full'
}: AdminContentProps) {
  return (
    <div
      className={cn(
        'mx-auto',
        padding && 'px-4 sm:px-6',
        maxWidths[maxWidth],
        className
      )}
    >
      {children}
    </div>
  )
}