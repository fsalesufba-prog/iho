'use client'

import React, { useState, useEffect } from 'react'
import {
  FolderTree,
  Clock,
  TrendingUp,
  TrendingDown,
  Fuel,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  Users,
  Truck
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { FrenteServicoList } from './FrenteServicoList'
import { ApontamentoList } from './ApontamentoList'
import { ApontamentoChart } from './ApontamentoChart'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    totalFrentes: number
    frentesAtivas: number
    totalApontamentos: number
    horasTrabalhadas: number
    consumoCombustivel: number
    custoTotal: number
    produtividadeMedia: number
  }
  comparativo: {
    horas: number
    combustivel: number
    produtividade: number
  }
  topFrentes: Array<{
    id: number
    nome: string
    obra: string
    horas: number
    produtividade: number
    status: string
  }>
  recentes: Array<{
    id: number
    frente: string
    data: string
    horas: number
    operador: string
  }>
}

export function FrenteServicoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const [obraId, setObraId] = useState<string>('todas')
  const [obras, setObras] = useState<any[]>([])
  
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.empresaId) {
      carregarObras()
      carregarDashboard()
    }
  }, [periodo, obraId, user?.empresaId])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { 
          empresaId: user?.empresaId,
          limit: 100 
        }
      })
      setObras(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/frentes-servico/dashboard', {
        params: {
          empresaId: user?.empresaId,
          obraId: obraId !== 'todas' ? obraId : undefined,
          periodo
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}min`
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
          <FolderTree className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Frentes de Serviço</h1>
            <p className="text-muted-foreground">
              Gerencie frentes de serviço e apontamentos
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
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
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

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frentes Ativas</p>
                <p className="text-2xl font-bold">{data.resumo.frentesAtivas}</p>
              </div>
              <FolderTree className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total: {data.resumo.totalFrentes} frentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Horas Trabalhadas</p>
                <p className="text-2xl font-bold">{formatHours(data.resumo.horasTrabalhadas)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              {data.comparativo.horas >= 0 ? (
                <span className="text-green-600">+{data.comparativo.horas}%</span>
              ) : (
                <span className="text-red-600">{data.comparativo.horas}%</span>
              )}
              <span className="text-muted-foreground ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Combustível</p>
                <p className="text-2xl font-bold">{data.resumo.consumoCombustivel.toFixed(1)} L</p>
              </div>
              <Fuel className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              {data.comparativo.combustivel >= 0 ? (
                <span className="text-red-600">+{data.comparativo.combustivel}%</span>
              ) : (
                <span className="text-green-600">{data.comparativo.combustivel}%</span>
              )}
              <span className="text-muted-foreground ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produtividade Média</p>
                <p className="text-2xl font-bold">{data.resumo.produtividadeMedia.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              {data.comparativo.produtividade >= 0 ? (
                <span className="text-green-600">+{data.comparativo.produtividade}%</span>
              ) : (
                <span className="text-red-600">{data.comparativo.produtividade}%</span>
              )}
              <span className="text-muted-foreground ml-1">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Horas Trabalhadas por Frente</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ApontamentoChart 
              data={data.topFrentes.map(f => ({
                name: f.nome,
                horas: f.horas
              }))}
              type="bar"
              dataKey="horas"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produtividade por Frente</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ApontamentoChart 
              data={data.topFrentes.map(f => ({
                name: f.nome,
                produtividade: f.produtividade
              }))}
              type="line"
              dataKey="produtividade"
            />
          </CardContent>
        </Card>
      </div>

      {/* Top Frentes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Frentes por Horas Trabalhadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topFrentes.slice(0, 5).map((frente) => (
              <div key={frente.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-medium">{frente.nome}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {frente.obra}
                      </span>
                    </div>
                    <Badge variant={
                      frente.status === 'ativa' ? 'success' : 'secondary'
                    }>
                      {frente.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(frente.horas / data.topFrentes[0].horas) * 100} 
                      className="h-2 flex-1"
                    />
                    <span className="text-sm font-medium">
                      {formatHours(frente.horas)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="frentes">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="frentes">Frentes de Serviço</TabsTrigger>
          <TabsTrigger value="apontamentos">Apontamentos</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="frentes" className="mt-4">
          <FrenteServicoList 
            obraId={obraId !== 'todas' ? parseInt(obraId) : undefined}
          />
        </TabsContent>

        <TabsContent value="apontamentos" className="mt-4">
          <ApontamentoList 
            obraId={obraId !== 'todas' ? parseInt(obraId) : undefined}
          />
        </TabsContent>

        <TabsContent value="analise" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Consumo de Combustível</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ApontamentoChart 
                  data={data.topFrentes.map(f => ({
                    name: f.nome,
                    consumo: Math.random() * 1000
                  }))}
                  type="bar"
                  dataKey="consumo"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custo por Frente</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ApontamentoChart 
                  data={data.topFrentes.map(f => ({
                    name: f.nome,
                    custo: Math.random() * 50000
                  }))}
                  type="pie"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}