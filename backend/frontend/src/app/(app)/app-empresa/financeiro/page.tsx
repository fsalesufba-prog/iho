'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  Wrench,
  Building2,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
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

export default function FinanceiroPage() {
  const { toast } = useToast()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

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
        title: 'Erro ao carregar dados financeiros',
        description: 'Não foi possível carregar o dashboard financeiro.',
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

  const formatPayback = (anos: number) => {
    if (anos < 1) {
      const meses = Math.round(anos * 12)
      return `${meses} meses`
    }
    return `${anos.toFixed(1)} anos`
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Financeiro" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse" />
                ))}
              </div>
              <div className="h-64 bg-muted rounded animate-pulse" />
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
        <Header title="Financeiro" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Financeiro
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe os indicadores financeiros da sua operação
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

              <Button variant="outline" asChild>
                <Link href="/app-empresa/financeiro/exportar">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Link>
              </Button>
            </div>
          </div>

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

          {/* Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold">{data?.indicadores.roi.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Retorno sobre investimento</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Payback</p>
                <p className="text-2xl font-bold">{formatPayback(data?.indicadores.payback || 0)}</p>
                <p className="text-xs text-muted-foreground">Tempo de retorno</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Margem</p>
                <p className="text-2xl font-bold">{data?.indicadores.margem.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Margem operacional</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

          {/* Links Rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/app-empresa/financeiro/dashboard">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Dashboard</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/financeiro/depreciacao">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 text-yellow-600 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Depreciação</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/financeiro/patrimonio">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Patrimônio</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/financeiro/custos">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Wrench className="h-8 w-8 mx-auto mb-2 text-orange-600 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Custos</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </Container>
      </main>
    </>
  )
}