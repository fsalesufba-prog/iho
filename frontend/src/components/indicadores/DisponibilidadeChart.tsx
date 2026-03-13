'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useTheme } from '@/components/theme/useTheme'

interface DisponibilidadeChartProps {
  data: Array<{ data: string; valor: number }>
}

export function DisponibilidadeChart({ data }: DisponibilidadeChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-2">
          <p className="text-sm">{label}</p>
          <p className="text-sm font-bold text-blue-600">
            {payload[0].value.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorDisponibilidade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
        <XAxis 
          dataKey="data" 
          stroke={isDark ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 10 }}
        />
        <YAxis 
          domain={[0, 100]}
          stroke={isDark ? '#9ca3af' : '#6b7280'}
          tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 10 }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="valor"
          stroke="#3b82f6"
          fillOpacity={1}
          fill="url(#colorDisponibilidade)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}