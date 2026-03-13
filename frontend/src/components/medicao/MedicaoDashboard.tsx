'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
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
import { MedicaoList } from './MedicaoList'
import { MedicaoGrafico } from './MedicaoGrafico'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    total: number
    pendentes: number
    aprovadas: number
    rejeitadas: number
    valorTotal: number
    valorMes: number
    variacao: number
  }
  porStatus: {
    pendente: number
    em_analise: number
    aprovado: number
    rejeitado: number
  }
  recentes: Array<any>
}

export function MedicaoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const [obraId, setObraId] = useState<string>('todas')
  const [obras, setObras] = useState<any[]>([])

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    carregarObras()
    carregarDashboard()
  }, [periodo, obraId])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { empresaId: user?.empresaId, limit: 100 }
      })
      setObras(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/medicao/dashboard', {
        params: {
          empresaId: user?.empresaId,
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
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
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Medição</h1>
            <p className="text-muted-foreground">
              Gerencie medições de obras e serviços
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
                <p className="text-sm text-muted-foreground">Total de Medições</p>
                <p className="text-2xl font-bold">{data.resumo.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

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
                <p className="text-sm text-muted-foreground">Aprovadas</p>
                <p className="text-2xl font-bold text-green-600">{data.resumo.aprovadas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejeitadas</p>
                <p className="text-2xl font-bold text-red-600">{data.resumo.rejeitadas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Valor e Variação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Valor Total do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(data.resumo.valorMes)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {data.resumo.variacao >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    +{data.resumo.variacao}% em relação ao período anterior
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    {data.resumo.variacao}% em relação ao período anterior
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Pendente</span>
                  <span className="text-sm font-medium">
                    {data.porStatus.pendente} ({((data.porStatus.pendente / data.resumo.total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porStatus.pendente / data.resumo.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-yellow-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Em Análise</span>
                  <span className="text-sm font-medium">
                    {data.porStatus.em_analise} ({((data.porStatus.em_analise / data.resumo.total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porStatus.em_analise / data.resumo.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Aprovado</span>
                  <span className="text-sm font-medium">
                    {data.porStatus.aprovado} ({((data.porStatus.aprovado / data.resumo.total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porStatus.aprovado / data.resumo.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-green-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Rejeitado</span>
                  <span className="text-sm font-medium">
                    {data.porStatus.rejeitado} ({((data.porStatus.rejeitado / data.resumo.total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porStatus.rejeitado / data.resumo.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-red-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Medições por Período</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <MedicaoGrafico 
              data={[]}
              type="line"
              dataKey="valor"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores por Obra</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <MedicaoGrafico 
              data={[]}
              type="bar"
              dataKey="valor"
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de Medições Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Medições Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <MedicaoList 
            medições={data.recentes}
            simple
          />
        </CardContent>
      </Card>
    </div>
  )
}