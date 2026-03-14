'use client'

import React from 'react'
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartSkeleton } from './ChartSkeleton'
import { ChartNoData } from './ChartNoData'
import { ChartError } from './ChartError'
import { useTheme } from '@/components/theme/useTheme'

interface ProgressItem {
  name: string
  value: number
  target: number
  color?: string
  unit?: string
}

interface ProgressChartProps {
  data: ProgressItem[]
  title?: string
  subtitle?: string
  loading?: boolean
  error?: string
  height?: number | string
  showLabels?: boolean
  showTargets?: boolean
  className?: string
  thickness?: number
  gap?: number
  formatValue?: (value: number, unit?: string) => string
}

const DEFAULT_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899'
]

export function ProgressChart({
  data,
  title,
  subtitle,
  loading = false,
  error,
  height = 300,
  showLabels = true,
  showTargets = true,
  className = '',
  thickness = 20,
  gap = 10,
  formatValue = (value, unit) => unit ? `${value}${unit}` : value.toString()
}: ProgressChartProps) {
  const { theme } = useTheme()

  if (loading) {
    return <ChartSkeleton height={height} />
  }

  if (error) {
    return <ChartError message={error} height={height} />
  }

  if (!data || data.length === 0) {
    return <ChartNoData height={height} />
  }

  const chartData = data.map((item, index) => ({
    ...item,
    fill: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    percentage: (item.value / item.target) * 100,
    uv: 100 // Para o background
  }))


  return (
    <ChartCard title={title} subtitle={subtitle} className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="20%"
              outerRadius="100%"
              data={chartData}
              startAngle={180}
              endAngle={-180}
              barSize={thickness}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="percentage"
                cornerRadius={thickness / 2}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {chartData.map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm">
                  {formatValue(item.value, item.unit)} / {formatValue(item.target, item.unit)}
                </span>
              </div>

              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.fill
                  }}
                />
                {showTargets && (
                  <div
                    className="absolute top-0 h-full w-0.5 bg-foreground"
                    style={{ left: '100%' }}
                  />
                )}
              </div>

              {showLabels && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.percentage.toFixed(1)}% concluído</span>
                  {item.percentage >= 100 ? (
                    <span className="text-green-600">Meta atingida!</span>
                  ) : (
                    <span>Faltam {formatValue(item.target - item.value, item.unit)}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  )
}