'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { DashboardTrend } from './DashboardTrend'

interface DashboardKPIProps {
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
  className?: string
  onClick?: () => void
}

export function DashboardKPI({
  title,
  value,
  previousValue,
  change,
  changePercentage,
  trend,
  icon,
  color,
  format = 'number',
  description,
  className,
  onClick
}: DashboardKPIProps) {
  const formattedValue = formatValue(value, format)
  const formattedPrevious = previousValue ? formatValue(previousValue, format) : undefined

  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          {icon && (
            <div className={cn('text-muted-foreground', color)}>
              {icon}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-baseline">
          <p className={cn('text-3xl font-bold', color)}>
            {formattedValue}
          </p>
          
          {(change !== undefined || trend) && (
            <DashboardTrend
              value={change}
              percentage={changePercentage}
              trend={trend}
              className="ml-2"
            />
          )}
        </div>

        {formattedPrevious && (
          <p className="mt-1 text-xs text-muted-foreground">
            Período anterior: {formattedPrevious}
          </p>
        )}

        {description && (
          <p className="mt-2 text-sm text-muted-foreground border-t pt-2">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function formatValue(value: string | number, format: string): string {
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
      const hours = Math.floor(value / 60)
      const minutes = value % 60
      return `${hours}h ${minutes}min`
    
    default:
      return value.toLocaleString('pt-BR')
  }
}