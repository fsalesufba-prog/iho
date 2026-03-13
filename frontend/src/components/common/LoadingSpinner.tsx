import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  label?: string
  showLabel?: boolean
}

const sizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

export function LoadingSpinner({
  size = 'md',
  className,
  label = 'Carregando...',
  showLabel = false
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <Loader2
        className={cn(
          'animate-spin text-primary',
          sizes[size],
          className
        )}
      />
      {showLabel && (
        <span className="ml-2 text-sm text-muted-foreground">{label}</span>
      )}
    </div>
  )
}

// Spinner com overlay
LoadingSpinner.Overlay = function LoadingOverlay({
  label = 'Carregando...'
}: {
  label?: string
}) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto" />
        {label && (
          <p className="mt-4 text-sm text-muted-foreground">{label}</p>
        )}
      </div>
    </div>
  )
}

// Spinner inline
LoadingSpinner.Inline = function InlineSpinner({
  size = 'sm',
  className
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(
        'animate-spin text-primary inline',
        sizes[size],
        className
      )}
    />
  )
}

// Spinner com texto
LoadingSpinner.WithText = function SpinnerWithText({
  text = 'Carregando...',
  size = 'md',
  className
}: LoadingSpinnerProps & { text?: string }) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  )
}