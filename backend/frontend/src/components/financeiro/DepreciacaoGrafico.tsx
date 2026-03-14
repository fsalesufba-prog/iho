'use client'

import React from 'react'
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTheme } from '@/components/theme/useTheme'

interface DepreciacaoGraficoProps {
  data: any[]
}

export function DepreciacaoGrafico({ data }: DepreciacaoGraficoProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Agrupar depreciações por ano
  const agruparPorAno = () => {
    const anos: Record<string, { ano: string; aquisicao: number; depreciada: number; contabil: number }> = {}

    data.forEach(item => {
      const ano = new Date(item.dataAquisicao).getFullYear().toString()
      if (!anos[ano]) {
        anos[ano] = {
          ano,
          aquisicao: 0,
          depreciada: 0,
          contabil: 0
        }
      }
      anos[ano].aquisicao += item.valorAquisicao
      anos[ano].depreciada += item.depreciacaoAcumulada
      anos[ano].contabil += item.valorContabil
    })

    return Object.values(anos).sort((a, b) => a.ano.localeCompare(b.ano))
  }

  const dadosAgrupados = agruparPorAno()

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
          <p className="font-medium mb-2">Ano {label}</p>
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
        <CardTitle>Evolução da Depreciação por Ano de Aquisição</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={dadosAgrupados}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? '#374151' : '#e5e7eb'}
            />
            <XAxis
              dataKey="ano"
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

            <Bar
              dataKey="aquisicao"
              name="Valor de Aquisição"
              fill="#3b82f6"
              barSize={20}
            />
            <Bar
              dataKey="depreciada"
              name="Depreciação Acumulada"
              fill="#f59e0b"
              barSize={20}
            />
            <Line
              type="monotone"
              dataKey="contabil"
              name="Valor Contábil"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legenda explicativa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span className="text-sm">Valor de Aquisição: custo original dos equipamentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <span className="text-sm">Depreciação Acumulada: total já depreciado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-sm">Valor Contábil: valor atual dos equipamentos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}