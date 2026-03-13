'use client'

import React, { useState, useEffect } from 'react'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  Wrench,
  Truck,
  AlertTriangle,
  CheckCircle,
  Calendar,
  RefreshCw,
  Download,
  BarChart3,
  PieChart,
  LineChart
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
import { IhoGauge } from './IhoGauge'
import { IhoChart } from './IhoChart'
import { DisponibilidadeChart } from './DisponibilidadeChart'
import { MtbfChart } from './MtbfChart'
import { MttrChart } from './MttrChart'
import { OeeCard } from './OeeCard'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface IndicadoresData {
  iho: {
    atual: number
    anterior: number
    variacao: number
    historico: Array<{ data: string; valor: number }>
    porEquipamento: Array<{ nome: string; valor: number }>
    porTipo: Array<{ tipo: string; valor: number }>
  }
  disponibilidade: {
    atual: number
    meta: number
    historico: Array<{ data: string; valor: number }>
  }
  performance: {
    atual: number
    meta: number
    historico: Array<{ data: string; valor: number }>
  }
  qualidade: {
    atual: number
    meta: number
    historico: Array<{ data: string; valor: number }>
  }
  oee: {
    atual: number
    disponibilidade: number
    performance: number
    qualidade: number
    historico: Array<{ data: string; valor: number }>
  }
  mtbf: {
    atual: number
    historico: Array<{ data: string; valor: number }>
  }
  mttr: {
    atual: number
    historico: Array<{ data: string; valor: number }>
  }
  custoHorario: {
    atual: number
    porTipo: Array<{ tipo: string; valor: number }>
  }
  alertas: {
    criticos: number
    atencao: number
    bons: number
  }
}

export function IhoDashboard() {
  const [data, setData] = useState<IndicadoresData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const [tipoEquipamento, setTipoEquipamento] = useState('todos')
  const [obraId, setObraId] = useState<string>('todas')
  const [obras, setObras] = useState<any[]>([])
  const [tiposEquipamento, setTiposEquipamento] = useState<string[]>([])

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.empresaId) {
      carregarObras()
      carregarTiposEquipamento()
      carregarIndicadores()
    }
  }, [periodo, tipoEquipamento, obraId, user?.empresaId])

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

  const carregarTiposEquipamento = async () => {
    try {
      const response = await api.get('/equipamentos/tipos')
      setTiposEquipamento(response.data)
    } catch (error) {
      console.error('Erro ao carregar tipos:', error)
    }
  }

  const carregarIndicadores = async () => {
    try {
      setLoading(true)
      const response = await api.get('/indicadores', {
        params: {
          empresaId: user?.empresaId,
          periodo,
          tipoEquipamento: tipoEquipamento !== 'todos' ? tipoEquipamento : undefined,
          obraId: obraId !== 'todas' ? obraId : undefined
        }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os indicadores',
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

  const formatNumber = (value: number) => {
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  }

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`
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
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Indicadores</h1>
            <p className="text-muted-foreground">
              Acompanhe o desempenho operacional da sua frota
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

          <Select value={tipoEquipamento} onValueChange={setTipoEquipamento}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de equipamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              {tiposEquipamento.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
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

          <Button variant="outline" size="sm" onClick={carregarIndicadores}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Alerta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={data.alertas.criticos > 0 ? 'border-red-500' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{data.alertas.criticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atenção</p>
                <p className="text-2xl font-bold text-yellow-600">{data.alertas.atencao}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bons</p>
                <p className="text-2xl font-bold text-green-600">{data.alertas.bons}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IHO Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>IHO - Índice de Saúde Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <IhoGauge 
              value={data.iho.atual} 
              size="lg"
              thresholds={[40, 60, 80]}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                {data.iho.atual >= 80 ? 'Excelente' :
                 data.iho.atual >= 60 ? 'Bom' :
                 data.iho.atual >= 40 ? 'Regular' :
                 'Crítico'}
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                {data.iho.variacao >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      +{data.iho.variacao.toFixed(1)}% vs período anterior
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      {data.iho.variacao.toFixed(1)}% vs período anterior
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Histórico IHO</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <IhoChart 
              data={data.iho.historico}
              type="line"
              dataKey="valor"
              color="#3b82f6"
            />
          </CardContent>
        </Card>
      </div>

      {/* OEE */}
      <Card>
        <CardHeader>
          <CardTitle>OEE - Overall Equipment Effectiveness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <OeeCard
              label="OEE"
              value={data.oee.atual}
              meta={85}
              color="#3b82f6"
            />
            <OeeCard
              label="Disponibilidade"
              value={data.oee.disponibilidade}
              meta={90}
              color="#10b981"
            />
            <OeeCard
              label="Performance"
              value={data.oee.performance}
              meta={95}
              color="#f59e0b"
            />
            <OeeCard
              label="Qualidade"
              value={data.oee.qualidade}
              meta={99}
              color="#8b5cf6"
            />
          </div>

          <div className="h-64">
            <IhoChart 
              data={data.oee.historico}
              type="line"
              dataKey="valor"
              color="#3b82f6"
            />
          </div>
        </CardContent>
      </Card>

      {/* Disponibilidade, MTBF e MTTR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Disponibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-blue-600">
                {data.disponibilidade.atual.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">
                Meta: {data.disponibilidade.meta}%
              </p>
              <Progress 
                value={(data.disponibilidade.atual / data.disponibilidade.meta) * 100} 
                className="h-2 mt-2"
              />
            </div>
            <div className="h-40">
              <DisponibilidadeChart data={data.disponibilidade.historico} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MTBF</CardTitle>
            <p className="text-sm text-muted-foreground">Tempo médio entre falhas</p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-green-600">
                {formatHours(data.mtbf.atual)}
              </p>
            </div>
            <div className="h-40">
              <MtbfChart data={data.mtbf.historico} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MTTR</CardTitle>
            <p className="text-sm text-muted-foreground">Tempo médio de reparo</p>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-orange-600">
                {formatHours(data.mttr.atual)}
              </p>
            </div>
            <div className="h-40">
              <MttrChart data={data.mttr.historico} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Detalhados */}
      <Tabs defaultValue="porEquipamento">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="porEquipamento">Por Equipamento</TabsTrigger>
          <TabsTrigger value="porTipo">Por Tipo</TabsTrigger>
          <TabsTrigger value="custoHorario">Custo Horário</TabsTrigger>
        </TabsList>

        <TabsContent value="porEquipamento" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>IHO por Equipamento</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <IhoChart 
                data={data.iho.porEquipamento}
                type="bar"
                dataKey="valor"
                nameKey="nome"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="porTipo" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>IHO por Tipo de Equipamento</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <IhoChart 
                data={data.iho.porTipo}
                type="pie"
                dataKey="valor"
                nameKey="tipo"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custoHorario" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Custo Horário por Tipo de Equipamento</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <IhoChart 
                data={data.custoHorario.porTipo}
                type="bar"
                dataKey="valor"
                nameKey="tipo"
                format="currency"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}