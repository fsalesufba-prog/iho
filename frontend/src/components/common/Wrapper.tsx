import React from 'react'
import { cn } from '@/lib/utils'

interface WrapperProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function Wrapper({
  children,
  className,
  as: Component = 'div'
}: WrapperProps) {
  return (
    <Component className={cn('relative', className)}>
      {children}
    </Component>
  )
}

// Wrapper com padding
Wrapper.Padded = function PaddedWrapper({
  children,
  padding = 4,
  className,
  ...props
}: WrapperProps & { padding?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 }) {
  return (
    <Wrapper
      className={cn(
        padding === 0 && 'p-0',
        padding === 1 && 'p-1',
        padding === 2 && 'p-2',
        padding === 3 && 'p-3',
        padding === 4 && 'p-4',
        padding === 5 && 'p-5',
        padding === 6 && 'p-6',
        padding === 8 && 'p-8',
        padding === 10 && 'p-10',
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  )
}

// Wrapper com margem
Wrapper.Margined = function MarginedWrapper({
  children,
  margin = 4,
  className,
  ...props
}: WrapperProps & { margin?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 }) {
  return (
    <Wrapper
      className={cn(
        margin === 0 && 'm-0',
        margin === 1 && 'm-1',
        margin === 2 && 'm-2',
        margin === 3 && 'm-3',
        margin === 4 && 'm-4',
        margin === 5 && 'm-5',
        margin === 6 && 'm-6',
        margin === 8 && 'm-8',
        margin === 10 && 'm-10',
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  )
}

// Wrapper centralizado
Wrapper.Centered = function CenteredWrapper({
  children,
  className,
  ...props
}: WrapperProps) {
  return (
    <Wrapper
      className={cn(
        'flex items-center justify-center',
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  )
}

// Wrapper com borda
Wrapper.Bordered = function BorderedWrapper({
  children,
  variant = 'default',
  rounded = 'md',
  className,
  ...props
}: WrapperProps & {
  variant?: 'default' | 'primary' | 'destructive' | 'success' | 'warning'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full'
}) {
  const variants = {
    default: 'border-border',
    primary: 'border-primary',
    destructive: 'border-destructive',
    success: 'border-green-500',
    warning: 'border-yellow-500'
  }

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  }

  return (
    <Wrapper
      className={cn(
        'border',
        variants[variant],
        roundedClasses[rounded],
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  )
}

// Wrapper com sombra
Wrapper.Shadow = function ShadowWrapper({
  children,
  intensity = 'md',
  className,
  ...props
}: WrapperProps & {
  intensity?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}) {
  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  return (
    <Wrapper
      className={cn(
        shadows[intensity],
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  )
}

// Wrapper com overlay
Wrapper.Overlay = function OverlayWrapper({
  children,
  opacity = 50,
  className,
  ...props
}: WrapperProps & {
  opacity?: 0 | 25 | 50 | 75 | 100
}) {
  const opacities = {
    0: 'bg-opacity-0',
    25: 'bg-opacity-25',
    50: 'bg-opacity-50',
    75: 'bg-opacity-75',
    100: 'bg-opacity-100'
  }

  return (
    <Wrapper
      className={cn(
        'absolute inset-0 bg-black',
        opacities[opacity],
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  )
}

// Wrapper com gradiente
Wrapper.Gradient = function GradientWrapper({
  children,
  from = 'primary',
  to = 'secondary',
  direction = 'r',
  className,
  ...props
}: WrapperProps & {
  from?: string
  to?: string
  direction?: 'r' | 'l' | 't' | 'b' | 'tr' | 'tl' | 'br' | 'bl'
}) {
  const directions = {
    r: 'to-r',
    l: 'to-l',
    t: 'to-t',
    b: 'to-b',
    tr: 'to-tr',
    tl: 'to-tl',
    br: 'to-br',
    bl: 'to-bl'
  }

  return (
    <Wrapper
      className={cn(
        `bg-gradient-${directions[direction]} from-${from} to-${to}`,
        className
      )}
      {...props}
    >
      {children}
    </Wrapper>
  )
}