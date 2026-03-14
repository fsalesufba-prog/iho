'use client'

import React, { useState, useEffect } from 'react'
import {
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { EquipamentoList } from './EquipamentoList'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    total: number
    disponivel: number
    emUso: number
    manutencao: number
    inativo: number
  }
  indicadores: {
    disponibilidade: number
    mtbf: number
    mttr: number
    oee: number
  }
  custos: {
    total: number
    manutencao: number
    combustivel: number
    depreciacao: number
  }
  alertas: {
    criticos: number
    manutencao: number
    combustivel: number
  }
}

export function EquipamentoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const { toast } = useToast()

  useEffect(() => {
    carregarDashboard()
  }, [periodo])

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/equipamentos/dashboard', {
        params: { periodo }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard',
        variant: 'error'
      })
    } finally {
      setLoading(false)
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
          <Truck className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Equipamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os equipamentos do sistema
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Equipamentos</p>
                <p className="text-2xl font-bold">{data.resumo.total}</p>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">{data.resumo.disponivel}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Manutenção</p>
                <p className="text-2xl font-bold text-yellow-600">{data.resumo.manutencao}</p>
              </div>
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-red-600">{data.alertas.criticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Disponibilidade</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{data.indicadores.disponibilidade}%</span>
                  <span className="text-sm text-green-600">↑ 2%</span>
                </div>
                <Progress value={data.indicadores.disponibilidade} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">OEE</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{data.indicadores.oee}%</span>
                  <span className="text-sm text-red-600">↓ 1%</span>
                </div>
                <Progress value={data.indicadores.oee} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">MTBF</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{data.indicadores.mtbf}h</span>
                  <span className="text-sm text-green-600">↑ 5%</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">MTTR</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-bold">{data.indicadores.mttr}h</span>
                  <span className="text-sm text-red-600">↑ 3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Custo Total</span>
                  <span className="font-bold">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(data.custos.total)}
                  </span>
                </div>
                <Progress value={100} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Manutenção</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(data.custos.manutencao)}
                  </span>
                </div>
                <Progress 
                  value={(data.custos.manutencao / data.custos.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-yellow-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Combustível</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(data.custos.combustivel)}
                  </span>
                </div>
                <Progress 
                  value={(data.custos.combustivel / data.custos.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Depreciação</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(data.custos.depreciacao)}
                  </span>
                </div>
                <Progress 
                  value={(data.custos.depreciacao / data.custos.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-purple-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Equipamentos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Disponível</p>
                <p className="text-xl font-semibold text-green-600">{data.resumo.disponivel}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Uso</p>
                <p className="text-xl font-semibold text-blue-600">{data.resumo.emUso}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Em Manutenção</p>
                <p className="text-xl font-semibold text-yellow-600">{data.resumo.manutencao}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Wrench className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Inativo</p>
                <p className="text-xl font-semibold text-gray-600">{data.resumo.inativo}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="equipamentos">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="equipamentos" className="mt-4">
          <EquipamentoList />
        </TabsContent>


        <TabsContent value="custos" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Custos por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {/* Gráfico de custos por tipo */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Gráfico de custos
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 Equipamentos por Custo</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {/* Gráfico de top equipamentos */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Top 10 equipamentos
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}