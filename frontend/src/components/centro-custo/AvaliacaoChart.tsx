'use client'

import React from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area
} from 'recharts'

interface ChartProps {
  data: any[]
  type: 'radar' | 'line' | 'bar' | 'pie' | 'heatmap' | 'composed'
  categories?: string[]
}

const COLORS = [
  '#10b981', // verde
  '#3b82f6', // azul
  '#f59e0b', // amarelo
  '#ef4444', // vermelho
  '#8b5cf6', // roxo
  '#ec4899', // rosa
  '#6366f1', // indigo
  '#14b8a6', // teal
]

export function AvaliacaoChart({ data, type }: ChartProps) {
  const renderChart = (): JSX.Element => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      )
    }

    switch (type) {
      case 'radar':
        return (
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="nome" />
            <PolarRadiusAxis angle={30} domain={[0, 5]} />
            <Radar
              name="Nota"
              dataKey="media"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Tooltip />
          </RadarChart>
        )

      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="media"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        )

      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="media" fill="#3b82f6" />
          </BarChart>
        )

      case 'pie': {
        const pieData = data.reduce((acc: any[], curr) => {
          const status = curr.status
          const existing = acc.find(item => item.name === status)
          if (existing) {
            existing.value++
          } else {
            acc.push({ name: status, value: 1 })
          }
          return acc
        }, [])

        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        )
      }

      case 'composed':
        return (
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" domain={[0, 5]} />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="media"
              fill="#3b82f6"
              stroke="#3b82f6"
              fillOpacity={0.3}
            />
            <Bar
              yAxisId="right"
              dataKey="avaliacoes"
              barSize={20}
              fill="#10b981"
            />
          </ComposedChart>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Tipo de gráfico não suportado</p>
          </div>
        )
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  )
}