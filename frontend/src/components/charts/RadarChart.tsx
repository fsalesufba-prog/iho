'use client'

import React from 'react'
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartTooltip } from './ChartTooltip'
import { ChartLegend } from './ChartLegend'
import { ChartSkeleton } from './ChartSkeleton'
import { ChartNoData } from './ChartNoData'
import { ChartError } from './ChartError'
import { useTheme } from '@/components/theme/useTheme'

interface DataPoint {
  subject: string
  [key: string]: any
}

interface Series {
  dataKey: string
  name: string
  color?: string
  fillOpacity?: number
  strokeWidth?: number
}

interface RadarChartProps {
  data: DataPoint[]
  series: Series[]
  title?: string
  subtitle?: string
  loading?: boolean
  error?: string
  height?: number | string
  showGrid?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  showAxis?: boolean
  showLabels?: boolean
  domain?: [number, number]
  className?: string
  colors?: string[]
  fillOpacity?: number
}

const DEFAULT_COLORS = [
  '#3b82f6', // azul
  '#10b981', // verde
  '#f59e0b', // amarelo
  '#ef4444', // vermelho
  '#8b5cf6', // roxo
]

export function RadarChartComponent({
  data,
  series,
  title,
  subtitle,
  loading = false,
  error,
  height = 400,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  showAxis = true,
  showLabels = true,
  domain = [0, 5],
  className = '',
  colors = DEFAULT_COLORS,
  fillOpacity = 0.3
}: RadarChartProps) {
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
        <RechartsRadarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          {showGrid && (
            <PolarGrid
              stroke={isDark ? '#4b5563' : '#e5e7eb'}
            />
          )}

          {showAxis && (
            <>
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fill: isDark ? '#d1d5db' : '#4b5563',
                  fontSize: 12
                }}
                stroke={isDark ? '#4b5563' : '#e5e7eb'}
              />
              <PolarRadiusAxis
                angle={30}
                domain={domain}
                tick={{
                  fill: isDark ? '#d1d5db' : '#4b5563',
                  fontSize: 10
                }}
                stroke={isDark ? '#4b5563' : '#e5e7eb'}
              />
            </>
          )}

          {showTooltip && (
            <Tooltip
              content={<ChartTooltip />}
            />
          )}

          {showLegend && (
            <Legend
              content={<ChartLegend />}
              verticalAlign="top"
              height={36}
            />
          )}

          {series.map((s, index) => (
            <Radar
              key={s.dataKey}
              name={s.name}
              dataKey={s.dataKey}
              stroke={s.color || colors[index % colors.length]}
              fill={s.color || colors[index % colors.length]}
              fillOpacity={s.fillOpacity || fillOpacity}
              strokeWidth={s.strokeWidth || 2}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}