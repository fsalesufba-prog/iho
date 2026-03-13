import React from 'react'
import { ArrowUp, ArrowDown, Minus, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    label: string
    direction?: 'up' | 'down' | 'stable'
  }
  footer?: React.ReactNode
  loading?: boolean
  className?: string
  onClick?: () => void
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  footer,
  loading = false,
  className,
  onClick
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-48" />
        </CardContent>
      </Card>
    )
  }

  const getTrendIcon = () => {
    if (!trend) return null
    switch (trend.direction) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    if (!trend) return ''
    switch (trend.direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {(description || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <div className={cn('flex items-center text-xs', getTrendColor())}>
                {getTrendIcon()}
                <span className="ml-1">
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}

        {footer && (
          <div className="mt-4 pt-4 border-t">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Variações de StatsCard
StatsCard.Simple = function SimpleStatsCard({
  title,
  value,
  icon,
  className
}: Omit<StatsCardProps, 'description' | 'trend' | 'footer' | 'loading'>) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </Card>
  )
}

StatsCard.WithTrend = function TrendStatsCard({
  title,
  value,
  trend,
  icon,
  className
}: Omit<StatsCardProps, 'description' | 'footer' | 'loading'>) {
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      
      <div className="mt-2 flex items-end justify-between">
        <p className="text-2xl font-bold">{value}</p>
        
        {trend && (
          <div className={cn(
            'flex items-center text-sm',
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          )}>
            {trend.direction === 'up' ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {trend && (
        <p className="text-xs text-muted-foreground mt-1">{trend.label}</p>
      )}
    </Card>
  )
}

StatsCard.Compact = function CompactStatsCard({
  title,
  value,
  className
}: Omit<StatsCardProps, 'icon' | 'description' | 'trend' | 'footer' | 'loading'>) {
  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}