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

interface GaugeChartProps {
  value: number
  min?: number
  max?: number
  title?: string
  subtitle?: string
  loading?: boolean
  error?: string
  height?: number | string
  colors?: string[]
  segments?: Array<{
    threshold: number
    color: string
    label: string
  }>
  formatValue?: (value: number) => string
  showValue?: boolean
  showMinMax?: boolean
  className?: string
  thickness?: number
  startAngle?: number
  endAngle?: number
}

const DEFAULT_SEGMENTS = [
  { threshold: 0.2, color: '#ef4444', label: 'Crítico' },
  { threshold: 0.4, color: '#f59e0b', label: 'Baixo' },
  { threshold: 0.6, color: '#fbbf24', label: 'Médio' },
  { threshold: 0.8, color: '#60a5fa', label: 'Bom' },
  { threshold: 1, color: '#10b981', label: 'Ótimo' }
]

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  title,
  subtitle,
  loading = false,
  error,
  height = 300,
  colors,
  segments = DEFAULT_SEGMENTS,
  formatValue = (v) => v.toString(),
  showValue = true,
  showMinMax = true,
  className = '',
  thickness = 20,
  startAngle = 180,
  endAngle = 0
}: GaugeChartProps) {
  const { theme } = useTheme()

  const normalizedValue = Math.min(Math.max(value, min), max)
  const percentage = (normalizedValue - min) / (max - min)

  const data = [
    {
      name: 'Gauge',
      value: percentage * 100,
      fill: getSegmentColor(percentage)
    }
  ]

  function getSegmentColor(percentage: number): string {
    for (const segment of segments) {
      if (percentage <= segment.threshold) {
        return segment.color
      }
    }
    return segments[segments.length - 1].color
  }

  function getSegmentLabel(percentage: number): string {
    for (const segment of segments) {
      if (percentage <= segment.threshold) {
        return segment.label
      }
    }
    return segments[segments.length - 1].label
  }

  if (loading) {
    return <ChartSkeleton height={height} />
  }

  if (error) {
    return <ChartError message={error} height={height} />
  }

  return (
    <ChartCard title={title} subtitle={subtitle} className={className}>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="85%"
            outerRadius="100%"
            data={data}
            startAngle={startAngle}
            endAngle={endAngle}
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
              dataKey="value"
              cornerRadius={thickness / 2}
              fill={data[0].fill}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: data[0].fill }}>
              {formatValue(normalizedValue)}
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              {getSegmentLabel(percentage)}
            </span>
          </div>
        )}

        {showMinMax && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground px-4">
            <span>{formatValue(min)}</span>
            <span>{formatValue(max)}</span>
          </div>
        )}
      </div>
    </ChartCard>
  )
}