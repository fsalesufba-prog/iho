'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useTheme } from '@/components/theme/useTheme'

interface MtbfChartProps {
  data: Array<{ data: string; valor: number }>
}

export function MtbfChart({ data }: MtbfChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const formatHours = (hours: number) => {
    return `${hours.toFixed(0)}h`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <p className="text-sm">{label}</p>
          <p className="text-sm font-bold text-green-600">
            {formatHours(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="data" 
          stroke={isDark ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 10 }}
        />
        <YAxis 
          stroke={isDark ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 10 }}
          tickFormatter={formatHours}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="valor"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}