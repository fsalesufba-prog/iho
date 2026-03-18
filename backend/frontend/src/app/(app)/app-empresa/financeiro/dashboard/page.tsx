'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Building2,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/use-toast'

import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface DashboardData {
  patrimonio: {
    total: number
    depreciado: number
    depreciacaoAcumulada: number
    quantidadeEquipamentos: number
  }
  custos: {
    manutencao: number
    operacional: number
    total: number
    porHora: number
  }
  receitas: {
    locacao: number
    total: number
    porHora: number
  }
  indicadores: {
    margem: number
    roi: number
    payback: number
    lucroLiquido: number
  }
  historico: Array<{
    data: string
    receita: number
    custo: number
    saldo: number
  }>
}

export default function DashboardFinanceiroPage() {
  const { toast } = useToast()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('visao-geral')

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/financeiro/dashboard', {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar dashboard',
        description: 'Não foi possível carregar os dados do dashboard financeiro.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarDados()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Dashboard Financeiro" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </Container>
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Dashboard Financeiro" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/financeiro"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Financeiro
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard Financeiro
              </h1>
              <p className="text-muted-foreground mt-1">
                Visão completa da saúde financeira da operação
              </p>
            </div>

            <div className="flex gap-2">
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="15">Últimos 15 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="visao-geral">
              {/* Cards Principais */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Patrimônio Líquido</p>
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(data?.patrimonio.depreciado || 0)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data?.patrimonio.quantidadeEquipamentos} equipamentos
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Receita Total</p>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(data?.receitas.total || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      R$ {data?.receitas.porHora.toFixed(2)}/h
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Custos Totais</p>
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-600">
                      {formatCurrency(data?.custos.total || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      R$ {data?.custos.porHora.toFixed(2)}/h
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className={`text-2xl font-bold ${
                      (data?.indicadores.lucroLiquido || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(data?.indicadores.lucroLiquido || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Margem: {data?.indicadores.margem.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Receitas vs Custos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Gráfico de receitas e custos</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Custos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Gráfico de distribuição de custos</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="indicadores">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ROI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">{data?.indicadores.roi.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Retorno sobre o investimento total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">
                      {(data?.indicadores.payback || 0).toFixed(1)} anos
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tempo estimado para retorno do investimento
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Margem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-4xl font-bold text-primary">{data?.indicadores.margem.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Margem operacional líquida
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="historico">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Financeira</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Gráfico de evolução financeira</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </main>
    </>
  )
}