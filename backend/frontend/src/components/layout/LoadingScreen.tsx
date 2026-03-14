import React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingScreen({
  message = 'Carregando...',
  fullScreen = true,
  className
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        fullScreen ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : 'min-h-[200px]',
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}