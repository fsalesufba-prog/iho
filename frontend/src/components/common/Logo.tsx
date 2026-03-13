import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'default' | 'dark' | 'light' | 'icon'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  href?: string
  className?: string
  onClick?: () => void
}

const sizes = {
  sm: {
    icon: 24,
    text: 'text-lg',
    container: 'h-8'
  },
  md: {
    icon: 32,
    text: 'text-xl',
    container: 'h-10'
  },
  lg: {
    icon: 40,
    text: 'text-2xl',
    container: 'h-12'
  },
  xl: {
    icon: 48,
    text: 'text-3xl',
    container: 'h-14'
  }
}

export function Logo({
  variant = 'default',
  size = 'md',
  showText = true,
  href = '/',
  className,
  onClick
}: LogoProps) {
  const getLogoSrc = () => {
    switch (variant) {
      case 'dark':
        return '/logo-dark.svg'
      case 'light':
        return '/logo-light.svg'
      case 'icon':
        return '/favicon.svg'
      default:
        return '/logo.svg'
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case 'dark':
        return 'text-gray-900'
      case 'light':
        return 'text-white'
      default:
        return 'text-primary'
    }
  }

  const sizeConfig = sizes[size]

  const LogoContent = (
    <div className={cn(
      'flex items-center gap-2',
      sizeConfig.container,
      className
    )}>
    
      {showText && variant !== 'icon' && (
        <span className={cn(
          'font-bold tracking-tight',
          sizeConfig.text,
          getTextColor()
        )}>
          IHO
          <span className="text-xs font-normal ml-1 opacity-70">
            Índice de Saúde Operacional
          </span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="hover:opacity-90 transition-opacity">
        {LogoContent}
      </Link>
    )
  }

  return LogoContent
}

// Variante para o favicon (usado em headers mobile)
Logo.Icon = function LogoIcon({ size = 'md', className }: Omit<LogoProps, 'variant' | 'showText' | 'href'>) {
  const sizeConfig = sizes[size]
  
  return (
    <Image
      src="/favicon.svg"
      alt="IHO"
      width={sizeConfig.icon}
      height={sizeConfig.icon}
      className={cn('object-contain', className)}
      priority
    />
  )
}