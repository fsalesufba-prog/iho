'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  Award
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { CentroCustoList } from './CentroCustoList'
import { AvaliacaoList } from './AvaliacaoList'
import { AvaliacaoChart } from './AvaliacaoChart'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    totalCentros: number
    totalAvaliados: number
    mediaGeral: number
    centrosCriticos: number
    valorTotal: number
    ultimaAvaliacao: string
  }
  categorias: Array<{
    nome: string
    peso: number
    media: number
    tendencia: 'up' | 'down' | 'stable'
  }>
  topCentros: Array<{
    id: string
    nome: string
    nota: number
    avaliacoes: number
    status: 'critico' | 'baixo' | 'medio' | 'bom' | 'otimo'
  }>
  evolucao: Array<{
    mes: string
    media: number
  }>
}

export function CentroCustoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const [obraId, setObraId] = useState<string>('todas')
  const [obras, setObras] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('resumo')

  const { toast } = useToast()

  useEffect(() => {
    carregarObras()
    carregarDashboard()
  }, [periodo, obraId])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', { params: { limit: 100 } })
      setObras(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/centros-custo/dashboard', {
        params: {
          periodo,
          obraId: obraId !== 'todas' ? obraId : undefined
        }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'baixo': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'medio': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'bom': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'otimo': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critico': return <AlertTriangle className="h-4 w-4" />
      case 'baixo': return <TrendingDown className="h-4 w-4" />
      case 'otimo': return <TrendingUp className="h-4 w-4" />
      default: return <Star className="h-4 w-4" />
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Centros de Custo</h1>
            <p className="text-muted-foreground">
              Gestão e avaliação de centros de custo
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={obraId} onValueChange={setObraId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as obras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as obras</SelectItem>
              {obras.map((obra) => (
                <SelectItem key={obra.id} value={obra.id.toString()}>
                  {obra.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={carregarDashboard}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Centros</p>
                <p className="text-2xl font-bold">{data.resumo.totalCentros}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Geral</p>
                <p className="text-2xl font-bold">{data.resumo.mediaGeral.toFixed(1)}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Centros Críticos</p>
                <p className="text-2xl font-bold text-red-600">{data.resumo.centrosCriticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(data.resumo.valorTotal)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Avaliação por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.categorias.map((cat) => (
                <div key={cat.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <span className="font-medium">{cat.nome}</span>
                      <Badge variant="secondary" className="ml-2">
                        Peso: {cat.peso}%
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{cat.media.toFixed(1)}</span>
                      {cat.tendencia === 'up' && (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      )}
                      {cat.tendencia === 'down' && (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  <Progress 
                    value={(cat.media / 5) * 100}
                    className="h-2"
                    indicatorClassName={
                      cat.media >= 4 ? 'bg-green-500' :
                      cat.media >= 3 ? 'bg-yellow-500' :
                      cat.media >= 2 ? 'bg-orange-500' :
                      'bg-red-500'
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Centros Avaliados</p>
              <p className="text-2xl font-semibold">
                {data.resumo.totalAvaliados} / {data.resumo.totalCentros}
              </p>
              <Progress 
                value={(data.resumo.totalAvaliados / data.resumo.totalCentros) * 100}
                className="h-2 mt-2"
              />
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Última Avaliação</p>
              <p className="font-medium">
                {new Date(data.resumo.ultimaAvaliacao).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Top 3 Centros</p>
              <div className="space-y-2">
                {data.topCentros.slice(0, 3).map((centro) => (
                  <div key={centro.id} className="flex items-center justify-between">
                    <span className="text-sm truncate max-w-[150px]">{centro.nome}</span>
                    <Badge className={getStatusColor(centro.status)}>
                      {centro.nota.toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumo" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="centros">Centros de Custo</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Evolução da Média */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <AvaliacaoChart 
                    data={data.evolucao}
                    type="line"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Distribuição por Status */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <AvaliacaoChart 
                    data={data.topCentros}
                    type="pie"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Centros */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top 5 Centros de Custo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topCentros.slice(0, 5).map((centro) => (
                    <div key={centro.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{centro.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {centro.avaliacoes} avaliações
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Progress 
                          value={(centro.nota / 5) * 100}
                          className="w-32 h-2"
                        />
                        <Badge className={getStatusColor(centro.status)}>
                          {centro.nota.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="centros" className="mt-4">
          <CentroCustoList 
            obraId={obraId !== 'todas' ? parseInt(obraId) : undefined}
          />
        </TabsContent>

        <TabsContent value="avaliacoes" className="mt-4">
          <AvaliacaoList 
            obraId={obraId !== 'todas' ? parseInt(obraId) : undefined}
          />
        </TabsContent>

        <TabsContent value="graficos" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Notas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <AvaliacaoChart 
                    data={data.categorias}
                    type="radar"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparativo por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <AvaliacaoChart 
                    data={data.evolucao}
                    type="bar"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Heatmap de Avaliações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <AvaliacaoChart 
                    data={data.topCentros}
                    type="heatmap"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}