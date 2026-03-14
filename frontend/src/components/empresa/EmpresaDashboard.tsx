'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
<<<<<<< HEAD

=======
import { cn } from '@/lib/utils'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { EmpresaList } from './EmpresaList'
<<<<<<< HEAD
import { EmpresaMetrics } from './EmpresaMetrics'
import { EmpresaAlerts } from './EmpresaAlerts'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    totalEmpresas: number
    empresasAtivas: number
    empresasInativas: number
    empresasAtrasadas: number
    faturamentoMensal: number
    faturamentoAnual: number
    ticketMedio: number
    churnRate: number
  }
  crescimento: {
    periodo: string
    novasEmpresas: number
    cancelamentos: number
    taxaCrescimento: number
  }
  planos: Array<{
    nome: string
    total: number
    faturamento: number
    percentual: number
  }>
  atividades: Array<{
    id: string
    empresa: string
    acao: string
    data: string
    tipo: 'cadastro' | 'pagamento' | 'atualizacao' | 'alerta'
  }>
}

export function EmpresaDashboard() {
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
      const response = await api.get('/admin/empresas/dashboard', {
        params: { periodo }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
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
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">
              Gerencie todas as empresas do sistema
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
                <p className="text-sm text-muted-foreground">Total de Empresas</p>
                <p className="text-2xl font-bold">{data.resumo.totalEmpresas}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">+{data.crescimento.novasEmpresas}</span>
              <span className="text-muted-foreground ml-1">este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Empresas Ativas</p>
                <p className="text-2xl font-bold">{data.resumo.empresasAtivas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <Progress 
              value={(data.resumo.empresasAtivas / data.resumo.totalEmpresas) * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">{data.resumo.empresasAtrasadas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <Progress 
              value={(data.resumo.empresasAtrasadas / data.resumo.totalEmpresas) * 100} 
              className="mt-2 h-2"
              indicatorClassName="bg-red-500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Mensal</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(data.resumo.faturamentoMensal)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-600">↑ 12%</span>
              <span className="text-muted-foreground ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.planos.map((plano) => (
                <div key={plano.nome}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <span className="font-medium">{plano.nome}</span>
                      <Badge variant="secondary" className="ml-2">
                        {plano.total} empresas
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(plano.faturamento)}
                    </span>
                  </div>
                  <Progress value={plano.percentual} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.atividades.map((atividade) => (
                <div key={atividade.id} className="flex items-start gap-3">
                  <div className={cn(
                    'h-2 w-2 rounded-full mt-2',
                    atividade.tipo === 'cadastro' && 'bg-green-500',
                    atividade.tipo === 'pagamento' && 'bg-blue-500',
                    atividade.tipo === 'atualizacao' && 'bg-yellow-500',
                    atividade.tipo === 'alerta' && 'bg-red-500'
                  )} />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{atividade.empresa}</span>
                      {' '}{atividade.acao}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(atividade.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="empresas">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
        </TabsList>

        <TabsContent value="empresas" className="mt-4">
          <EmpresaList />
        </TabsContent>

<<<<<<< HEAD
        <TabsContent value="metricas" className="mt-4">
          <EmpresaMetrics />
        </TabsContent>

        <TabsContent value="alertas" className="mt-4">
          <EmpresaAlerts />
        </TabsContent>

=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
        <TabsContent value="financeiro" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Faturamento por Período</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {/* Gráfico de faturamento */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Gráfico de faturamento
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inadimplência</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {/* Gráfico de inadimplência */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Gráfico de inadimplência
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}