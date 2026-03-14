'use client'

import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface AvaliacaoSummaryProps {
  data: {
    mediaGeral: number
    totalAvaliacoes: number
    ultimaAvaliacao: string
    categorias: Array<{
      nome: string
      peso: number
      media: number
      tendencia: 'up' | 'down' | 'stable'
    }>
    historico: Array<{
      periodo: string
      media: number
    }>
  }
}

export function AvaliacaoSummary({ data }: AvaliacaoSummaryProps) {
  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600'
    if (nota >= 3.5) return 'text-blue-600'
    if (nota >= 2.5) return 'text-yellow-600'
    if (nota >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressColor = (nota: number) => {
    if (nota >= 4.5) return 'bg-green-500'
    if (nota >= 3.5) return 'bg-blue-500'
    if (nota >= 2.5) return 'bg-yellow-500'
    if (nota >= 1.5) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Card de Média Geral */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Média Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className={`text-4xl font-bold ${getNotaColor(data.mediaGeral)}`}>
                {data.mediaGeral.toFixed(2)}
              </span>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
            <Badge variant="secondary">
              {data.totalAvaliacoes} {data.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Última avaliação: {new Date(data.ultimaAvaliacao).toLocaleDateString('pt-BR')}
          </p>
        </CardContent>
      </Card>

      {/* Avaliação por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliação por Categoria</CardTitle>
          <CardDescription>
            Notas médias ponderadas por categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.categorias.map((cat) => (
            <div key={cat.nome}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{cat.nome}</span>
                  <Badge variant="secondary" className="text-xs">
                    Peso: {cat.peso}%
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`font-bold ${getNotaColor(cat.media)}`}>
                    {cat.media.toFixed(2)}
                  </span>
                  {getTendenciaIcon(cat.tendencia)}
                </div>
              </div>
              <Progress 
                value={(cat.media / 5) * 100}
                className="h-2"
                indicatorClassName={getProgressColor(cat.media)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Evolução Recente */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução Recente</CardTitle>
          <CardDescription>
            Média das últimas 5 avaliações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.historico.slice(-5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {item.periodo}
                </span>
                <div className="flex items-center space-x-4">
                  <Progress 
                    value={(item.media / 5) * 100}
                    className="w-32 h-2"
                  />
                  <span className={`text-sm font-medium ${getNotaColor(item.media)}`}>
                    {item.media.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}