'use client'

import React from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ChartCard } from './ChartCard'
import { ChartTooltip } from './ChartTooltip'
import { ChartSkeleton } from './ChartSkeleton'
import { ChartNoData } from './ChartNoData'
import { ChartError } from './ChartError'
import { cn } from '@/lib/utils'

interface MetricData {
  value: number
  previousValue?: number
  change?: number
  changePercentage?: number
  trend?: 'up' | 'down' | 'stable'
  sparklineData?: Array<{ value: number }>
}

interface MetricChartProps {
  title: string
  value: number
  previousValue?: number
  change?: number
  changePercentage?: number
  trend?: 'up' | 'down' | 'stable'
  sparklineData?: Array<{ value: number }>
  formatValue?: (value: number) => string
  loading?: boolean
  error?: string
  height?: number
  className?: string
  color?: string
  icon?: React.ReactNode
  description?: string
  showSparkline?: boolean
  sparklineColor?: string
}

export function MetricChart({
  title,
  value,
  previousValue,
  change,
  changePercentage,
  trend: propTrend,
  sparklineData,
  formatValue = (v) => v.toString(),
  loading = false,
  error,
  height = 120,
  className,
  color = '#3b82f6',
  icon,
  description,
  showSparkline = true,
  sparklineColor
}: MetricChartProps) {
  const { theme } = useTheme()

  // Calcular tendência se não for fornecida
  let trend = propTrend
  if (!trend && previousValue !== undefined) {
    if (value > previousValue) trend = 'up'
    else if (value < previousValue) trend = 'down'
    else trend = 'stable'
  }

  // Calcular mudança se não for fornecida
  let displayChange = change
  let displayChangePercentage = changePercentage
  if (previousValue !== undefined && !displayChange) {
    displayChange = value - previousValue
    displayChangePercentage = ((value - previousValue) / previousValue) * 100
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      default:
        return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-8 w-32 bg-muted rounded animate-pulse" />
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("text-sm text-red-600", className)}>
        Erro ao carregar métrica
      </div>
    )
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        </div>
        {displayChange !== undefined && (
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>
              {displayChange > 0 ? '+' : ''}{formatValue(displayChange)}
              {displayChangePercentage && (
                <span className="ml-1">
                  ({displayChangePercentage > 0 ? '+' : ''}
                  {displayChangePercentage.toFixed(1)}%)
                </span>
              )}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold">{formatValue(value)}</span>
          {description && (
            <span className="ml-2 text-sm text-muted-foreground">{description}</span>
          )}
        </div>

        {showSparkline && sparklineData && sparklineData.length > 0 && (
          <div style={{ width: 120, height: 40 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`gradient-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sparklineColor || color} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={sparklineColor || color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={sparklineColor || color}
                  strokeWidth={2}
                  fill={`url(#gradient-${title})`}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {previousValue !== undefined && (
        <p className="text-xs text-muted-foreground">
          Período anterior: {formatValue(previousValue)}
        </p>
      )}
    </div>
  )
}