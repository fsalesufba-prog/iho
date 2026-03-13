
import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Clock,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface Indicador {
  nome: string
  valor: number
  unidade: string
  interpretacao: string
  status: 'bom' | 'atencao' | 'critico'
  tendencia: 'up' | 'down' | 'stable'
  meta?: number
}

interface IndicadoresFinanceirosProps {
  data?: Indicador[]
}

const mockIndicadores: Indicador[] = [
  {
    nome: 'Liquidez Corrente',
    valor: 2.5,
    unidade: '',
    interpretacao: 'Empresa tem R$ 2,50 para cada R$ 1,00 de dívida de curto prazo',
    status: 'bom',
    tendencia: 'up',
    meta: 2.0
  },
  {
    nome: 'Liquidez Seca',
    valor: 1.8,
    unidade: '',
    interpretacao: 'Excluindo estoques, empresa tem R$ 1,80 para cada R$ 1,00 de dívida',
    status: 'bom',
    tendencia: 'stable',
    meta: 1.5
  },
  {
    nome: 'Endividamento Geral',
    valor: 45,
    unidade: '%',
    interpretacao: '45% dos ativos são financiados por capital de terceiros',
    status: 'atencao',
    tendencia: 'up',
    meta: 40
  },
  {
    nome: 'ROI - Retorno sobre Investimento',
    valor: 18.5,
    unidade: '%',
    interpretacao: 'A cada R$ 100 investidos, retorno de R$ 18,50',
    status: 'bom',
    tendencia: 'up',
    meta: 15
  },
  {
    nome: 'ROE - Retorno sobre Patrimônio',
    valor: 22.3,
    unidade: '%',
    interpretacao: 'Retorno de 22,3% sobre o capital próprio',
    status: 'bom',
    tendencia: 'up',
    meta: 20
  },
  {
    nome: 'Margem EBITDA',
    valor: 28.7,
    unidade: '%',
    interpretacao: 'Margem operacional de 28,7%',
    status: 'bom',
    tendencia: 'up',
    meta: 25
  },
  {
    nome: 'Giro do Ativo',
    valor: 1.2,
    unidade: 'x',
    interpretacao: 'Cada R$ 1,00 em ativos gera R$ 1,20 em vendas',
    status: 'atencao',
    tendencia: 'down',
    meta: 1.5
  },
  {
    nome: 'Prazo Médio de Recebimento',
    valor: 45,
    unidade: 'dias',
    interpretacao: 'Clientes pagam em média em 45 dias',
    status: 'critico',
    tendencia: 'up',
    meta: 30
  },
]

export function IndicadoresFinanceiros({ data = mockIndicadores }: IndicadoresFinanceirosProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'bom':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'atencao':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'critico':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Liquidez */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Liquidez</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.slice(0, 2).map((indicador) => (
                <div key={indicador.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{indicador.nome}</span>
                      <Badge className={getStatusColor(indicador.status)}>
                        {indicador.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTendenciaIcon(indicador.tendencia)}
                      <span className="text-lg font-bold">
                        {indicador.valor}{indicador.unidade}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {indicador.interpretacao}
                  </p>
                  {indicador.meta && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Meta: {indicador.meta}{indicador.unidade}</span>
                        <span>{(indicador.valor / indicador.meta * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={(indicador.valor / indicador.meta) * 100}
                        className="h-1 mt-1"
                        indicatorClassName={
                          indicador.status === 'bom' ? 'bg-green-500' :
                          indicador.status === 'atencao' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Endividamento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Endividamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.slice(2, 3).map((indicador) => (
                <div key={indicador.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{indicador.nome}</span>
                      <Badge className={getStatusColor(indicador.status)}>
                        {indicador.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTendenciaIcon(indicador.tendencia)}
                      <span className="text-lg font-bold">
                        {indicador.valor}{indicador.unidade}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {indicador.interpretacao}
                  </p>
                  {indicador.meta && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Meta: {indicador.meta}{indicador.unidade}</span>
                        <span>{(indicador.valor / indicador.meta * 100).toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={(indicador.valor / indicador.meta) * 100}
                        className="h-1 mt-1"
                        indicatorClassName="bg-yellow-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rentabilidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rentabilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.slice(3, 6).map((indicador) => (
                <div key={indicador.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{indicador.nome}</span>
                    <div className="flex items-center gap-1">
                      {getTendenciaIcon(indicador.tendencia)}
                      <span className="text-lg font-bold">
                        {indicador.valor}{indicador.unidade}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {indicador.interpretacao}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eficiência e Prazos */}
      <Card>
        <CardHeader>
          <CardTitle>Eficiência e Prazos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.slice(6).map((indicador) => (
              <div key={indicador.nome} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{indicador.nome}</span>
                  <Badge className={getStatusColor(indicador.status)}>
                    {indicador.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {indicador.valor}{indicador.unidade}
                  </span>
                  <div className="flex items-center gap-1">
                    {getTendenciaIcon(indicador.tendencia)}
                    <span className="text-xs text-muted-foreground">
                      {indicador.tendencia === 'up' ? 'aumentando' : 
                       indicador.tendencia === 'down' ? 'diminuindo' : 'estável'}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {indicador.interpretacao}
                </p>
                {indicador.meta && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Meta: {indicador.meta}{indicador.unidade}</span>
                      <span>{(indicador.valor / indicador.meta * 100).toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={(indicador.valor / indicador.meta) * 100}
                      className="h-1 mt-1"
                      indicatorClassName={
                        indicador.status === 'bom' ? 'bg-green-500' :
                        indicador.status === 'atencao' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold text-green-600">18.5%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROE</p>
                <p className="text-2xl font-bold text-green-600">22.3%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem Líquida</p>
                <p className="text-2xl font-bold text-blue-600">18.3%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Percent className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Liquidez Corrente</p>
                <p className="text-2xl font-bold text-green-600">2.5</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}