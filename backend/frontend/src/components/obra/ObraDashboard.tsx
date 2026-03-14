'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  Calendar,
  RefreshCw,
  Download,
  CheckCircle,
  AlertTriangle,
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
import { ObraList } from './ObraList'
import { ObraChart } from './ObraChart'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    total: number
    ativas: number
    concluidas: number
    atrasadas: number
    valorTotal: number
    valorMes: number
    progressoMedio: number
  }
  porStatus: {
    ativa: number
    paralisada: number
    concluida: number
    cancelada: number
  }
  recentes: Array<any>
  topObras: Array<{
    id: number
    nome: string
    progresso: number
    valor: number
  }>
}

export function ObraDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const [empresaId, setEmpresaId] = useState<string>('todas')
  const [empresas, setEmpresas] = useState<any[]>([])

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.tipo === 'adm_sistema') {
      carregarEmpresas()
    }
    carregarDashboard()
  }, [periodo, empresaId])

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/empresas', { params: { limit: 100 } })
      setEmpresas(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const params: any = { periodo }
      
      if (user?.tipo === 'adm_sistema') {
        if (empresaId !== 'todas') {
          params.empresaId = empresaId
        }
      } else {
        params.empresaId = user?.empresaId
      }

      const response = await api.get('/obras/dashboard', { params })
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
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Obras</h1>
            <p className="text-muted-foreground">
              Gerencie todas as obras do sistema
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user?.tipo === 'adm_sistema' && (
            <Select value={empresaId} onValueChange={setEmpresaId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas as empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as empresas</SelectItem>
                {empresas.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

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
                <p className="text-sm text-muted-foreground">Total de Obras</p>
                <p className="text-2xl font-bold">{data.resumo.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Obras Ativas</p>
                <p className="text-2xl font-bold text-green-600">{data.resumo.ativas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Atraso</p>
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
                <p className="text-2xl font-bold text-blue-600">{data.resumo.concluidas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso e Valores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Progresso Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">
              {data.resumo.progressoMedio}%
            </div>
            <Progress value={data.resumo.progressoMedio} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Média de progresso de todas as obras
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor Total:</span>
                <span className="font-bold text-green-600">{formatCurrency(data.resumo.valorTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Valor no Mês:</span>
                <span className="font-bold text-blue-600">{formatCurrency(data.resumo.valorMes)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Obras */}
      <Card>
        <CardHeader>
          <CardTitle>Top Obras por Valor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topObras.map((obra, index) => (
              <div key={obra.id} className="flex items-center gap-4">
                <span className="text-lg font-bold text-muted-foreground w-8">
                  #{index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{obra.nome}</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(obra.valor)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={obra.progresso} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground w-12">
                      {obra.progresso}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="lista">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lista">Lista de Obras</TabsTrigger>
          <TabsTrigger value="graficos">Gráficos</TabsTrigger>
          <TabsTrigger value="mapa">Mapa</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4">
          <ObraList 
            empresaId={empresaId !== 'todas' ? parseInt(empresaId) : undefined}
          />
        </TabsContent>

        <TabsContent value="graficos" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Obras por Status</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ObraChart 
                  data={[
                    { name: 'Ativas', value: data.porStatus.ativa },
                    { name: 'Paralisadas', value: data.porStatus.paralisada },
                    { name: 'Concluídas', value: data.porStatus.concluida },
                    { name: 'Canceladas', value: data.porStatus.cancelada }
                  ]}
                  type="pie"
                  dataKey="value"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valores por Obra</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ObraChart 
                  data={data.topObras}
                  type="bar"
                  dataKey="valor"
                  nameKey="nome"
                  format="currency"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mapa" className="mt-4">
          <Card>
            <CardContent className="h-96 flex items-center justify-center">
              <p className="text-muted-foreground">Mapa de obras em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}