import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface PrevisaoMetricasProps {
  tipo: 'uso' | 'manutencao' | 'custos'
  horizonte: string
}

export function PrevisaoMetricas({ tipo, horizonte }: PrevisaoMetricasProps) {
  // Dados mockados baseados no tipo
  const getMetricas = () => {
    switch (tipo) {
      case 'uso':
        return {
          precisao: 92,
          confiabilidade: 88,
          tendencia: 'up',
          variacao: 12.5,
          pico: 'Mar/2024',
          vale: 'Fev/2024'
        }
      case 'manutencao':
        return {
          precisao: 85,
          confiabilidade: 82,
          tendencia: 'up',
          variacao: 8.3,
          pico: 'Abr/2024',
          vale: 'Jan/2024'
        }
      case 'custos':
        return {
          precisao: 90,
          confiabilidade: 86,
          tendencia: 'up',
          variacao: 6.8,
          pico: 'Mai/2024',
          vale: 'Mar/2024'
        }
    }
  }

  const metricas = getMetricas()

  const getTendenciaIcon = () => {
    switch (metricas.tendencia) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Precisão do Modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{metricas.precisao}%</div>
          <Progress value={metricas.precisao} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Confiabilidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{metricas.confiabilidade}%</div>
          <Progress value={metricas.confiabilidade} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tendência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {getTendenciaIcon()}
            <span className="text-2xl font-bold">
              {metricas.variacao > 0 ? '+' : ''}{metricas.variacao}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            em relação ao período anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pico/Vale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Pico:</span>
              <span className="text-sm font-medium">{metricas.pico}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Vale:</span>
              <span className="text-sm font-medium">{metricas.vale}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}