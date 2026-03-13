'use client'

import React, { useState, useEffect } from 'react'
import {
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
  PieChart
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
import { ManutencaoList } from './ManutencaoList'
import { ManutencaoCalendar } from './ManutencaoCalendar'
import { MaintenanceChart } from './MaintenanceChart'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    pendentes: number
    emAndamento: number
    concluidas: number
    atrasadas: number
    custoTotal: number
    custoMes: number
  }
  indicadores: {
    mtbf: number
    mttr: number
    disponibilidade: number
    confiabilidade: number
  }
  porTipo: {
    preventiva: number
    corretiva: number
    preditiva: number
  }
  urgentes: Array<any>
}

export function ManutencaoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const [equipamentoId, setEquipamentoId] = useState<string>('todos')
  const [equipamentos, setEquipamentos] = useState<any[]>([])

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    carregarEquipamentos()
    carregarDashboard()
  }, [periodo, equipamentoId])

  const carregarEquipamentos = async () => {
    try {
      const response = await api.get('/equipamentos', {
        params: { empresaId: user?.empresaId, limit: 100 }
      })
      setEquipamentos(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error)
    }
  }

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/manutencao/dashboard', {
        params: {
          empresaId: user?.empresaId,
          periodo,
          equipamentoId: equipamentoId !== 'todos' ? equipamentoId : undefined
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
    return `${hours.toFixed(1)}h`
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totalManutencoes = data.resumo.pendentes + data.resumo.emAndamento + data.resumo.concluidas

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Wrench className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Manutenção</h1>
            <p className="text-muted-foreground">
              Gerencie todas as manutenções do sistema
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={equipamentoId} onValueChange={setEquipamentoId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os equipamentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os equipamentos</SelectItem>
              {equipamentos.map((eq) => (
                <SelectItem key={eq.id} value={eq.id.toString()}>
                  {eq.nome} - {eq.tag}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{data.resumo.pendentes}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">{data.resumo.emAndamento}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{data.resumo.atrasadas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-green-600">{data.resumo.concluidas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Indicadores de Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">MTBF</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatHours(data.indicadores.mtbf)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tempo médio entre falhas
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">MTTR</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatHours(data.indicadores.mttr)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Tempo médio de reparo
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Disponibilidade</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.indicadores.disponibilidade.toFixed(1)}%
                </p>
                <Progress value={data.indicadores.disponibilidade} className="h-2" />
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Confiabilidade</p>
                <p className="text-2xl font-bold text-purple-600">
                  {data.indicadores.confiabilidade.toFixed(1)}%
                </p>
                <Progress value={data.indicadores.confiabilidade} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Preventiva</span>
                  <span className="text-sm font-medium">
                    {data.porTipo.preventiva} ({((data.porTipo.preventiva / totalManutencoes) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porTipo.preventiva / totalManutencoes) * 100} 
                  className="h-2"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Corretiva</span>
                  <span className="text-sm font-medium">
                    {data.porTipo.corretiva} ({((data.porTipo.corretiva / totalManutencoes) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porTipo.corretiva / totalManutencoes) * 100} 
                  className="h-2"
                  indicatorClassName="bg-red-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Preditiva</span>
                  <span className="text-sm font-medium">
                    {data.porTipo.preditiva} ({((data.porTipo.preditiva / totalManutencoes) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porTipo.preditiva / totalManutencoes) * 100} 
                  className="h-2"
                  indicatorClassName="bg-green-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lista">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lista">Lista de Manutenções</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4">
          <ManutencaoList 
            equipamentoId={equipamentoId !== 'todos' ? parseInt(equipamentoId) : undefined}
          />
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <ManutencaoCalendar />
        </TabsContent>

        <TabsContent value="graficos" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Manutenções por Mês</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <MaintenanceChart 
                  data={[]}
                  type="bar"
                  dataKey="count"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custos por Tipo</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <MaintenanceChart 
                  data={[]}
                  type="pie"
                  dataKey="valor"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}