'use client'

import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent } from '@/components/ui/Card'
import { useTheme } from '@/components/theme/useTheme'

interface PatrimonioGraficoProps {
  data: Array<{ name: string; value: number }>
  evolucaoData?: Array<{ periodo: string; imobilizado: number; intangivel: number; investimentos: number }>
  type: 'pie' | 'line' | 'bar'
  loading?: boolean
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

export function PatrimonioGrafico({ data, evolucaoData = [], type, loading }: PatrimonioGraficoProps) {
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
          <p className="font-medium mb-2">{label || payload[0].name}</p>
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

  if (loading) {
    return (
      <Card>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando gráfico...</div>
        </CardContent>
      </Card>
    )
  }

  if ((type === 'pie' && (!data || data.length === 0)) || 
      (type === 'line' && (!evolucaoData || evolucaoData.length === 0))) {
    return (
      <Card>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Sem dados para exibir</p>
        </CardContent>
      </Card>
    )
  }

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        )

      case 'line':
        return (
          <LineChart data={evolucaoData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="periodo" stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="imobilizado" name="Imobilizado" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="intangivel" name="Intangível" stroke="#f59e0b" strokeWidth={2} />
            <Line type="monotone" dataKey="investimentos" name="Investimentos" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart data={evolucaoData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis dataKey="periodo" stroke={isDark ? '#9ca3af' : '#6b7280'} />
            <YAxis stroke={isDark ? '#9ca3af' : '#6b7280'} tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="imobilizado" name="Imobilizado" fill="#3b82f6" />
            <Bar dataKey="intangivel" name="Intangível" fill="#f59e0b" />
            <Bar dataKey="investimentos" name="Investimentos" fill="#10b981" />
          </BarChart>
        )

      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}