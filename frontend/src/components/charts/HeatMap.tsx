'use client'

import React from 'react'

import { ChartCard } from './ChartCard'

import { ChartSkeleton } from './ChartSkeleton'
import { ChartNoData } from './ChartNoData'
import { ChartError } from './ChartError'
<<<<<<< HEAD
import { useTheme } from '@/components/theme/useTheme'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

interface DataPoint {
  x: string
  y: string
  value: number
  [key: string]: any
}

interface HeatMapProps {
  data: DataPoint[]
  title?: string
  subtitle?: string
  loading?: boolean
  error?: string
  height?: number | string
  xAxisDataKey?: string
  yAxisDataKey?: string
  valueDataKey?: string
  colors?: string[]
  minColor?: string
  maxColor?: string
  showTooltip?: boolean
  showValues?: boolean
  cellSize?: number
  className?: string
  onCellClick?: (data: DataPoint) => void
}

const DEFAULT_COLORS = ['#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c']

export function HeatMap({
  data,
  title,
  subtitle,
  loading = false,
  error,
  height = 400,
  xAxisDataKey = 'x',
  yAxisDataKey = 'y',
  valueDataKey = 'value',
  colors = DEFAULT_COLORS,
<<<<<<< HEAD
  minColor = '#fee2e2',
  maxColor = '#b91c1c',
  showTooltip = true,
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  showValues = false,
  cellSize = 40,
  className = '',
  onCellClick
}: HeatMapProps) {
<<<<<<< HEAD
  const { theme } = useTheme()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

  if (loading) {
    return <ChartSkeleton height={height} />
  }

  if (error) {
    return <ChartError message={error} height={height} />
  }

  if (!data || data.length === 0) {
    return <ChartNoData height={height} />
  }

  // Agrupar dados por x e y
<<<<<<< HEAD
  const xValues = [...new Set(data.map(d => d[xAxisDataKey]))]
  const yValues = [...new Set(data.map(d => d[yAxisDataKey]))]
=======
  const xValues = Array.from(new Set(data.map(d => d[xAxisDataKey])))
  const yValues = Array.from(new Set(data.map(d => d[yAxisDataKey])))
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

  // Encontrar valor mínimo e máximo para escala de cores
  const values = data.map(d => d[valueDataKey])
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)

  const getColor = (value: number) => {
    if (maxValue === minValue) return colors[Math.floor(colors.length / 2)]
<<<<<<< HEAD
    
=======

>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    const percentage = (value - minValue) / (maxValue - minValue)
    const colorIndex = Math.floor(percentage * (colors.length - 1))
    return colors[colorIndex]
  }

  const formatData = () => {
    return yValues.map(y => {
      const row: any = { [yAxisDataKey]: y }
      xValues.forEach(x => {
        const cell = data.find(d => d[xAxisDataKey] === x && d[yAxisDataKey] === y)
        row[x] = cell ? cell[valueDataKey] : null
      })
      return row
    })
  }

  const formattedData = formatData()

  const handleClick = (data: any) => {
    if (onCellClick) {
<<<<<<< HEAD
      const cellData = {
        [xAxisDataKey]: data.x,
        [yAxisDataKey]: data[yAxisDataKey],
        [valueDataKey]: data.value
=======
      const xValue = data.x
      const yValue = data[yAxisDataKey]
      const value = data.value

      const cellData = {
        [xAxisDataKey]: xValue,
        [yAxisDataKey]: yValue,
        [valueDataKey]: value,
        x: xValue,
        y: yValue,
        value: value
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      }
      onCellClick(cellData)
    }
  }

  return (
    <ChartCard title={title} subtitle={subtitle} className={className}>
      <div style={{ width: '100%', height, overflow: 'auto' }}>
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-2" />
              {xValues.map(x => (
                <th key={x} className="p-2 text-sm font-medium text-muted-foreground">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {formattedData.map((row: any) => (
              <tr key={row[yAxisDataKey]}>
                <td className="p-2 text-sm font-medium text-muted-foreground">
                  {row[yAxisDataKey]}
                </td>
                {xValues.map(x => (
                  <td key={x} className="p-1">
                    {row[x] !== null && (
                      <div
                        className="relative cursor-pointer transition-transform hover:scale-110"
                        style={{
                          width: cellSize,
                          height: cellSize,
                          backgroundColor: getColor(row[x]),
                          borderRadius: '4px'
                        }}
                        onClick={() => handleClick({
                          x,
                          y: row[yAxisDataKey],
                          value: row[x]
                        })}
                      >
                        {showValues && (
                          <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                            {row[x]}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legenda de cores */}
      <div className="flex items-center justify-end mt-4 space-x-2">
        <span className="text-xs text-muted-foreground">Menor</span>
        <div className="flex h-4 w-32 rounded overflow-hidden">
          {colors.map((color, index) => (
            <div
              key={index}
              className="flex-1"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Maior</span>
      </div>
    </ChartCard>
  )
}