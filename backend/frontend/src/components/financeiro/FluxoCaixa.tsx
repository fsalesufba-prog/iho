'use client'

import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTheme } from '@/components/theme/useTheme'

interface FluxoCaixaProps {
  data: Array<{
    periodo: string
    entradas: number
    saidas: number
    saldo: number
  }>
  title?: string
  showSaldo?: boolean
  height?: number
}

export function FluxoCaixa({
  data,
  title = 'Fluxo de Caixa',
  showSaldo = true,
  height = 400
}: FluxoCaixaProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
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
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#374151' : '#e5e7eb'}
            />
            <XAxis
              dataKey="periodo"
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
            />
            <YAxis
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              tick={{ fill: isDark ? '#d1d5db' : '#4b5563', fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            <Area
              type="monotone"
              dataKey="entradas"
              name="Entradas"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="saidas"
              name="Saídas"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
            />

            {showSaldo && (
              <ReferenceLine
                y={0}
                stroke={isDark ? '#6b7280' : '#9ca3af'}
                strokeDasharray="3 3"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Versão com linha do saldo
FluxoCaixa.WithSaldo = function FluxoCaixaComSaldo(props: FluxoCaixaProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title || 'Fluxo de Caixa com Saldo'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={props.height || 400}>
          <AreaChart
            data={props.data}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="periodo" stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="entradas"
              name="Entradas"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="saidas"
              name="Saídas"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="saldo"
              name="Saldo"
              stroke="#3b82f6"
              fill="none"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}