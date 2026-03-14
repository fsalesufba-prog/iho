import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: string
}

const sizes = {
  sm: 'h-1 w-1',
  md: 'h-2 w-2',
  lg: 'h-3 w-3'
}

export function LoadingDots({
  size = 'md',
  className,
  color = 'bg-primary'
}: LoadingDotsProps) {
  const dotSize = sizes[size]

  return (
    <div className={cn('flex space-x-1', className)}>
      <div className={cn(dotSize, color, 'rounded-full animate-bounce')} style={{ animationDelay: '0ms' }} />
      <div className={cn(dotSize, color, 'rounded-full animate-bounce')} style={{ animationDelay: '150ms' }} />
      <div className={cn(dotSize, color, 'rounded-full animate-bounce')} style={{ animationDelay: '300ms' }} />
    </div>
  )
}

// Dots com texto
LoadingDots.WithText = function DotsWithText({
  text = 'Carregando',
  ...props
}: LoadingDotsProps & { text?: string }) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">{text}</span>
      <LoadingDots {...props} />
    </div>
  )
}

// Dots em linha
LoadingDots.Inline = function InlineDots(props: LoadingDotsProps) {
  return <LoadingDots {...props} className="inline-flex" />
}