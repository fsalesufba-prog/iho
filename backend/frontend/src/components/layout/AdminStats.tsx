import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Stat {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    positive: boolean
  }
  color?: string
}

interface AdminStatsProps {
  stats: Stat[]
  columns?: 2 | 3 | 4
  className?: string
}

const gridCols = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
}

export function AdminStats({ stats, columns = 4, className }: AdminStatsProps) {
  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              {stat.icon && <div className="text-muted-foreground">{stat.icon}</div>}
            </div>
            
            <div className="mt-2 flex items-baseline">
              <p className="text-2xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </p>
              
              {stat.trend && (
                <span className={cn(
                  'ml-2 flex items-center text-sm',
                  stat.trend.positive ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.trend.positive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {stat.trend.value}%
                </span>
              )}
            </div>
            
            {stat.description && (
              <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}