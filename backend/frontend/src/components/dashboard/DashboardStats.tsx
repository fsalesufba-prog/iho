'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { DashboardKPI } from './DashboardKPI'
import { DashboardMetric } from './DashboardMetric'
import { DashboardTrend } from './DashboardTrend'
import { Skeleton } from '@/components/ui/Skeleton'

interface StatItem {
  id: string
  title: string
  value: number | string
  previousValue?: number | string
  change?: number
  changePercentage?: number
  trend?: 'up' | 'down' | 'stable'
  icon?: React.ReactNode
  color?: string
  format?: 'number' | 'currency' | 'percentage' | 'time'
  description?: string
}

interface DashboardStatsProps {
  stats: StatItem[]
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  loading?: boolean
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6'
}

export function DashboardStats({
  stats,
  columns = 4,
  loading = false,
  variant = 'default',
  className
}: DashboardStatsProps) {
  if (loading) {
    return (
      <div className={cn('grid gap-4', gridCols[columns], className)}>
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('grid gap-4', gridCols[columns], className)}>
        {stats.map((stat) => (
          <DashboardMetric
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            format={stat.format}
          />
        ))}
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('grid gap-4', gridCols[columns], className)}>
        {stats.map((stat) => (
          <DashboardKPI
            key={stat.id}
            title={stat.title}
            value={stat.value}
            previousValue={stat.previousValue}
            change={stat.change}
            changePercentage={stat.changePercentage}
            trend={stat.trend}
            icon={stat.icon}
            color={stat.color}
            format={stat.format}
            description={stat.description}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="rounded-lg border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </p>
            {stat.icon && (
              <div className={cn('text-muted-foreground', stat.color)}>
                {stat.icon}
              </div>
            )}
          </div>

          <div className="mt-2 flex items-baseline">
            <p className="text-2xl font-bold">
              {formatValue(stat.value, stat.format)}
            </p>
            
            {stat.change !== undefined && (
              <DashboardTrend
                value={stat.change}
                percentage={stat.changePercentage}
                className="ml-2"
              />
            )}
          </div>

          {stat.description && (
            <p className="mt-1 text-xs text-muted-foreground">
              {stat.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

function formatValue(value: string | number, format?: string): string {
  if (typeof value === 'string') return value

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value)
    
    case 'percentage':
      return `${value}%`
    
    case 'time':
      // Formatar minutos para horas:minutos
      const hours = Math.floor(value / 60)
      const minutes = value % 60
      return `${hours}h ${minutes}min`
    
    default:
      return value.toLocaleString('pt-BR')
  }
}