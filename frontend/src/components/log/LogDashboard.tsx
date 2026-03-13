'use client'

import React, { useState, useEffect } from 'react'
import {
  History,
  Users,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp
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
import { LogList } from './LogList'
import { LogChart } from './LogChart'
import { LogStats } from './LogStats'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardData {
  resumo: {
    total: number
    hoje: number
    ultimaHora: number
    usuariosAtivos: number
    acoesCriticas: number
    entidadesMaisAcessadas: Array<{ entidade: string; count: number }>
    usuariosMaisAtivos: Array<{ usuario: string; count: number }>
  }
  graficos: {
    porHora: Array<{ hora: string; count: number }>
    porDia: Array<{ dia: string; count: number }>
    porAcao: Array<{ acao: string; count: number }>
    porEntidade: Array<{ entidade: string; count: number }>
  }
  ultimosLogs: Array<any>
}

export function LogDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('24h')
  const [activeTab, setActiveTab] = useState('resumo')

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    carregarDashboard()
  }, [periodo])

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/logs/dashboard', {
        params: { periodo }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard de logs:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard de logs',
        variant: 'destructive'
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
          <History className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Logs do Sistema</h1>
            <p className="text-muted-foreground">
              Monitore todas as atividades e eventos do sistema
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
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="6h">Últimas 6 horas</SelectItem>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
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
                <p className="text-sm text-muted-foreground">Total de Logs</p>
                <p className="text-2xl font-bold">{data.resumo.total}</p>
              </div>
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold text-blue-600">{data.resumo.hoje}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Última Hora</p>
                <p className="text-2xl font-bold text-green-600">{data.resumo.ultimaHora}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ações Críticas</p>
                <p className="text-2xl font-bold text-red-600">{data.resumo.acoesCriticas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Logs por Hora</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <LogChart 
              data={data.graficos.porHora}
              type="line"
              dataKey="count"
              nameKey="hora"
              color="#3b82f6"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Logs por Ação</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <LogChart 
              data={data.graficos.porAcao}
              type="pie"
              dataKey="count"
              nameKey="acao"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="lista" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lista">Lista de Logs</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="usuarios">Por Usuário</TabsTrigger>
          <TabsTrigger value="entidades">Por Entidade</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4">
          <LogList logs={data.ultimosLogs} />
        </TabsContent>

        <TabsContent value="estatisticas" className="mt-4">
          <LogStats data={data.resumo} />
        </TabsContent>

        <TabsContent value="usuarios" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuários Mais Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.resumo.usuariosMaisAtivos.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.usuario}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} logs
                        </span>
                      </div>
                      <Progress 
                        value={(item.count / data.resumo.usuariosMaisAtivos[0].count) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entidades" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Entidades Mais Acessadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.resumo.entidadesMaisAcessadas.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted-foreground w-8">
                      #{index + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium capitalize">{item.entidade}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.count} acessos
                        </span>
                      </div>
                      <Progress 
                        value={(item.count / data.resumo.entidadesMaisAcessadas[0].count) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}