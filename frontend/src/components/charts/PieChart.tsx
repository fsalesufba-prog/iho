'use client'

import React, { useState } from 'react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector
} from 'recharts'
import { ChartCard } from './ChartCard'
import { ChartTooltip } from './ChartTooltip'
import { ChartLegend } from './ChartLegend'
import { ChartSkeleton } from './ChartSkeleton'
import { ChartNoData } from './ChartNoData'
import { ChartError } from './ChartError'
import { useTheme } from '@/components/theme/useTheme'

interface DataPoint {
  name: string
  value: number
  color?: string
  [key: string]: any
}

interface PieChartProps {
  data: DataPoint[]
  title?: string
  subtitle?: string
  loading?: boolean
  error?: string
  height?: number | string
  dataKey?: string
  nameKey?: string
  showLegend?: boolean
  showTooltip?: boolean
  showLabels?: boolean
  innerRadius?: number | string
  outerRadius?: number | string
  paddingAngle?: number
  startAngle?: number
  endAngle?: number
  cx?: number | string
  cy?: number | string
  labelLine?: boolean
  onSliceClick?: (data: any, index: number) => void
  className?: string
  colors?: string[]
  donut?: boolean
  activeIndex?: number
  showActiveShape?: boolean
  valueFormatter?: (value: number) => string
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
  '#f97316', // laranja
  '#06b6d4', // ciano
]

const renderActiveShape = (props: any) => {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value
  } = props

  return (
    <g>
      <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#999">
        {`${value} (${(percent * 100).toFixed(2)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        fill={fill}
      />
    </g>
  )
}

export function PieChartComponent({
  data,
  title,
  subtitle,
  loading = false,
  error,
  height = 400,
  dataKey = 'value',
  nameKey = 'name',
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  innerRadius = 0,
  outerRadius = '80%',
  paddingAngle = 0,
  startAngle = 0,
  endAngle = 360,
  cx = '50%',
  cy = '50%',
  labelLine = true,
  onSliceClick,
  className = '',
  colors = DEFAULT_COLORS,
  donut = false,
  activeIndex,
  showActiveShape = false,
  valueFormatter = (value) => value.toString()
}: PieChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(activeIndex)
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

  const handleSliceEnter = (_: any, index: number) => {
    setHoverIndex(index)
  }

  const handleSliceLeave = () => {
    setHoverIndex(undefined)
  }

  const handleSliceClick = (data: any, index: number) => {
    if (onSliceClick) {
      onSliceClick(data, index)
    }
  }

  const effectiveInnerRadius = donut ? '60%' : innerRadius

  return (
    <ChartCard title={title} subtitle={subtitle} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx={cx}
            cy={cy}
            innerRadius={effectiveInnerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
            startAngle={startAngle}
            endAngle={endAngle}
            label={showLabels}
            labelLine={labelLine}
            activeIndex={hoverIndex}
            activeShape={showActiveShape ? renderActiveShape : undefined}
            onMouseEnter={handleSliceEnter}
            onMouseLeave={handleSliceLeave}
            onClick={handleSliceClick}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
                stroke={isDark ? '#1f2937' : '#ffffff'}
                strokeWidth={2}
              />
            ))}
          </Pie>

          {showTooltip && (
            <Tooltip
              content={<ChartTooltip valueFormatter={valueFormatter} />}
            />
          )}

          {showLegend && (
            <Legend
              content={<ChartLegend />}
              layout="vertical"
              align="right"
              verticalAlign="middle"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}