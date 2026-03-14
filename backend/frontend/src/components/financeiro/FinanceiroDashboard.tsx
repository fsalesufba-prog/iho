'use client'

import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { PeriodoSelector } from './PeriodoSelector'
import { FluxoCaixa } from './FluxoCaixa'
import { DRE } from './DRE'
import { BalancoPatrimonial } from './BalancoPatrimonial'
import { IndicadoresFinanceiros } from './IndicadoresFinanceiros'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    receitas: number
    despesas: number
    lucroLiquido: number
    margemLucro: number
    fluxoCaixa: number
    saldoAtual: number
  }
  comparativo: {
    receitas: number
    despesas: number
    lucro: number
  }
  graficos: {
    receitasDespesas: any[]
    fluxoCaixa: any[]
    dre: any[]
  }
}

export function FinanceiroDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const [comparativo, setComparativo] = useState('periodoAnterior')
  const { toast } = useToast()

  useEffect(() => {
    carregarDashboard()
  }, [periodo])

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/financeiro/dashboard', {
        params: { periodo }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard financeiro',
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

  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />
    if (variacao < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getVariacaoColor = (variacao: number) => {
    if (variacao > 0) return 'text-green-600'
    if (variacao < 0) return 'text-red-600'
    return 'text-gray-400'
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
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Financeiro</h1>
            <p className="text-muted-foreground">
              Gerencie receitas, despesas e indicadores financeiros
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <PeriodoSelector value={periodo} onChange={setPeriodo} />
          
          <Select value={comparativo} onValueChange={setComparativo}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Comparativo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="periodoAnterior">Período anterior</SelectItem>
              <SelectItem value="anoAnterior">Ano anterior</SelectItem>
              <SelectItem value="orcado">Vs. Orçado</SelectItem>
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
                <p className="text-sm text-muted-foreground">Receitas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.resumo.receitas)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {getVariacaoIcon(data.comparativo.receitas)}
              <span className={getVariacaoColor(data.comparativo.receitas)}>
                {data.comparativo.receitas > 0 ? '+' : ''}{data.comparativo.receitas}%
              </span>
              <span className="text-xs text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.resumo.despesas)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {getVariacaoIcon(data.comparativo.despesas * -1)}
              <span className={getVariacaoColor(data.comparativo.despesas * -1)}>
                {data.comparativo.despesas > 0 ? '+' : ''}{data.comparativo.despesas}%
              </span>
              <span className="text-xs text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.resumo.lucroLiquido)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {getVariacaoIcon(data.comparativo.lucro)}
              <span className={getVariacaoColor(data.comparativo.lucro)}>
                {data.comparativo.lucro > 0 ? '+' : ''}{data.comparativo.lucro}%
              </span>
              <span className="text-xs text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Margem</p>
                <p className="text-2xl font-bold">
                  {data.resumo.margemLucro.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1">
              {getVariacaoIcon(data.comparativo.lucro)}
              <span className={getVariacaoColor(data.comparativo.lucro)}>
                +2.3%
              </span>
              <span className="text-xs text-muted-foreground">vs período anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fluxo de Caixa */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <FluxoCaixa data={data.graficos.fluxoCaixa} />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="dre">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="balanco">Balanço</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="mt-4">
          <DRE data={data.graficos.dre} />
        </TabsContent>

        <TabsContent value="balanco" className="mt-4">
          <BalancoPatrimonial />
        </TabsContent>

        <TabsContent value="indicadores" className="mt-4">
          <IndicadoresFinanceiros />
        </TabsContent>

        <TabsContent value="analise" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Receitas x Despesas</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {/* Gráfico de receitas x despesas */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Gráfico de análise
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Composição de Custos</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                {/* Gráfico de composição de custos */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Gráfico de custos
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}