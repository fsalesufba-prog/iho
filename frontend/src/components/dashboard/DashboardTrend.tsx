import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardTrendProps {
  value?: number
  percentage?: number
  trend?: 'up' | 'down' | 'stable'
  showIcon?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: {
    icon: 'h-3 w-3',
    text: 'text-xs'
  },
  md: {
    icon: 'h-4 w-4',
    text: 'text-sm'
  },
  lg: {
    icon: 'h-5 w-5',
    text: 'text-base'
  }
}

export function DashboardTrend({
  value,
  percentage,
  trend: propTrend,
  showIcon = true,
  className,
  size = 'md'
}: DashboardTrendProps) {
  // Determinar tendência baseada no valor se não for fornecida
  let trend = propTrend
  if (!trend && value !== undefined) {
    if (value > 0) trend = 'up'
    else if (value < 0) trend = 'down'
    else trend = 'stable'
  }

  const getIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className={sizes[size].icon} />
      case 'down':
        return <TrendingDown className={sizes[size].icon} />
      default:
        return <Minus className={sizes[size].icon} />
    }
  }

  const getColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-400'
    }
  }

  const getText = () => {
    if (value !== undefined) {
      const formattedValue = value > 0 ? `+${value}` : value
      if (percentage !== undefined) {
        return `${formattedValue} (${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%)`
      }
      return formattedValue
    }
    if (percentage !== undefined) {
      return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`
    }
    return null
  }

  const text = getText()
  if (!text && !showIcon) return null

  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-medium',
      getColor(),
      sizes[size].text,
      className
    )}>
      {showIcon && getIcon()}
      {text && <span>{text}</span>}
    </span>
  )
}