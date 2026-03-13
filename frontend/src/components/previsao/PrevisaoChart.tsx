'use client'

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'
import { useTheme } from '@/components/theme/useTheme'

interface PrevisaoChartProps {
  dados: Array<{ periodo: string; valor: number; previsto?: number }>
  tipo: 'linha' | 'area' | 'barra' | 'comparativo'
  titulo?: string
  unidade?: 'number' | 'currency' | 'hours' | 'percentage'
  altura?: number
}

export function PrevisaoChart({
  dados,
  tipo,
  titulo,
  unidade = 'number',
  altura = 400
}: PrevisaoChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const formatValue = (value: number) => {
    switch (unidade) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value)
      case 'hours':
        return `${value}h`
      case 'percentage':
        return `${value}%`
      default:
        return value.toLocaleString('pt-BR')
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium" style={{ color: entry.color }}>
                {formatValue(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    switch (tipo) {
      case 'linha':
        return (
          <LineChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="periodo" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
            />
            <YAxis 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="valor" 
              name="Histórico"
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        )

      case 'area':
        return (
          <AreaChart data={dados}>
            <defs>
              <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="periodo" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
            />
            <YAxis 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="valor" 
              name="Histórico"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorValor)" 
            />
          </AreaChart>
        )

      case 'barra':
        return (
          <BarChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="periodo" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
            />
            <YAxis 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="valor" name="Histórico" fill="#3b82f6" />
          </BarChart>
        )

      case 'comparativo':
        return (
          <ComposedChart data={dados}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="periodo" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
            />
            <YAxis 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="valor" name="Histórico" fill="#9ca3af" barSize={20} />
            <Line 
              type="monotone" 
              dataKey="previsto" 
              name="Previsto"
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 6, fill: '#3b82f6' }}
            />
          </ComposedChart>
        )

      default:
        return null
    }
  }

  return (
    <div className="w-full h-full">
      {titulo && <h3 className="text-lg font-semibold mb-4">{titulo}</h3>}
      <ResponsiveContainer width="100%" height={altura}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}