'use client'

import React from 'react'
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine
} from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartTooltip } from './ChartTooltip'
import { ChartLegend } from './ChartLegend'
import { ChartSkeleton } from './ChartSkeleton'
import { ChartNoData } from './ChartNoData'
import { ChartError } from './ChartError'
import { useTheme } from '@/components/theme/useTheme'

interface DataPoint {
  [key: string]: any
}

interface Series {
  dataKey: string
  name: string
  color?: string
  stackId?: string
  type?: 'monotone' | 'linear' | 'step' | 'stepBefore' | 'stepAfter'
  fillOpacity?: number
}

interface AreaChartProps {
  data: DataPoint[]
  series: Series[]
  title?: string
  subtitle?: string
  loading?: boolean
  error?: string
  height?: number | string
  xAxisDataKey?: string
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  showBrush?: boolean
  showReferenceLines?: boolean
  referenceLines?: Array<{
    y?: number
    label?: string
    color?: string
    strokeDasharray?: string
  }>
  yAxisLabel?: string
  xAxisLabel?: string
  yAxisDomain?: [number, number]
  syncId?: string
  onPointClick?: (data: any, index: number) => void
  className?: string
  colors?: string[]
  stacked?: boolean
  fillOpacity?: number
}

const DEFAULT_COLORS = [
  '#3b82f6', // azul
  '#10b981', // verde
  '#f59e0b', // amarelo
  '#ef4444', // vermelho
  '#8b5cf6', // roxo
  '#ec4899', // rosa
  '#6366f1', // indigo
  '#14b8a6', // teal
]

export function AreaChartComponent({
  data,
  series,
  title,
  subtitle,
  loading = false,
  error,
  height = 400,
  xAxisDataKey = 'name',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showBrush = false,
  showReferenceLines = false,
  referenceLines = [],
  yAxisLabel,
  xAxisLabel,
  yAxisDomain,
  syncId,
<<<<<<< HEAD
  onPointClick,
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  className = '',
  colors = DEFAULT_COLORS,
  stacked = false,
  fillOpacity = 0.6
}: AreaChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (loading) {
    return <ChartSkeleton height={height} />
  }

  if (error) {
    return <ChartError message={error} height={height} />
  }

  if (!data || data.length === 0) {
    return <ChartNoData height={height} />
  }

  return (
    <ChartCard title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          syncId={syncId}
          stackOffset={stacked ? 'expand' : 'none'}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#374151' : '#e5e7eb'}
              vertical={false}
            />
          )}

          <XAxis
            dataKey={xAxisDataKey}
            label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -10 } : undefined}
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
            tickLine={{ stroke: isDark ? '#4b5563' : '#e5e7eb' }}
            axisLine={{ stroke: isDark ? '#4b5563' : '#e5e7eb' }}
          />

          <YAxis
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            domain={yAxisDomain}
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
            tickLine={{ stroke: isDark ? '#4b5563' : '#e5e7eb' }}
            axisLine={{ stroke: isDark ? '#4b5563' : '#e5e7eb' }}
          />

          {showTooltip && (
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                stroke: isDark ? '#6b7280' : '#9ca3af',
                strokeWidth: 1,
                strokeDasharray: '3 3'
              }}
            />
          )}

          {showLegend && (
            <Legend
              content={<ChartLegend />}
              verticalAlign="top"
              height={36}
            />
          )}

          {showReferenceLines && referenceLines.map((line, index) => (
            <ReferenceLine
              key={index}
              y={line.y}
              label={line.label}
              stroke={line.color || (isDark ? '#6b7280' : '#9ca3af')}
              strokeDasharray={line.strokeDasharray || '3 3'}
            />
          ))}

          {series.map((s, index) => (
            <Area
              key={s.dataKey}
              type={s.type || 'monotone'}
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.color || colors[index % colors.length]}
              fill={s.color || colors[index % colors.length]}
              fillOpacity={s.fillOpacity || fillOpacity}
              stackId={stacked ? s.stackId || 'stack' : undefined}
            />
          ))}

          {showBrush && (
            <Brush
              dataKey={xAxisDataKey}
              height={30}
              stroke={isDark ? '#4b5563' : '#e5e7eb'}
              fill={isDark ? '#1f2937' : '#f9fafb'}
              travellerWidth={10}
            />
          )}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}