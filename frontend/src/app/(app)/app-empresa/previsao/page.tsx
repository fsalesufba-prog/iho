'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp,
<<<<<<< HEAD
=======
  Minus,
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  Calendar,
  Download,
  RefreshCw,
  AlertCircle,
  DollarSign,
  Wrench,
  Truck,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
<<<<<<< HEAD
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
=======
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/use-toast'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

interface DashboardData {
  previsaoUso: {
    totalEquipamentos: number
    equipamentosAnalisados: number
    resumo: {
      totalHorasProjetadas: number
      mediaHorasPorEquipamento: number
    }
  }
  previsaoManutencao: {
    totalEquipamentos: number
    equipamentosAnalisados: number
<<<<<<< HEAD
=======
    previsoes?: Array<{
      equipamentoId: number
      equipamentoTag: string
      equipamentoNome: string
      mediaIntervalo: number
      diasDesdeUltima: number
      ultimaManutencao: string
      previsao: Array<{
        mes: number
        data: string
        diasAteProxima: number
        confiabilidade: number
      }>
    }>
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    resumo: {
      manutencoesProximas: number
      mediaIntervalo: number
    }
  }
  previsaoCustos: {
    historico: Array<{ mes: string; valor: number }>
    previsao: Array<{ mes: number; valor: number; intervaloMin: number; intervaloMax: number }>
    estatisticas: {
      mediaMensal: number
      minimo: number
      maximo: number
      tendencia: number
    }
  }
  tendencias: {
    uso: {
      tendenciaGeral: string
      equipamentosCriticos: any[]
    }
    manutencoes: {
      tendenciaGeral: string
      equipamentosAtencao: any[]
    }
    custos: {
      tendenciaGeral: number
      projecao: number
    }
  }
  alertas: Array<{
    tipo: string
    gravidade: string
    equipamento: string
    descricao: string
    data?: string
    diasAte?: number
  }>
  confiabilidade: number
}

export default function PrevisaoPage() {
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const { toast } = useToast()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [meses, setMeses] = useState('12')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [meses])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/previsao/dashboard', {
        params: { meses }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar previsões',
        description: 'Não foi possível carregar o dashboard de previsões.',
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

  const getGravidadeBadge = (gravidade: string) => {
    const variants = {
      alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      baixa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
    return variants[gravidade as keyof typeof variants] || ''
  }

<<<<<<< HEAD
  const getTendenciaIcon = (tendencia: string | number) => {
=======
  const getTendenciaIcon = (tendencia: string | number | undefined) => {
    if (tendencia === undefined) return <Minus className="h-4 w-4 text-gray-600" />
    
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
    if (typeof tendencia === 'number') {
      if (tendencia > 0.05) return <TrendingUp className="h-4 w-4 text-red-600" />
      if (tendencia < -0.05) return <TrendingUp className="h-4 w-4 text-green-600 transform rotate-180" />
      return <Minus className="h-4 w-4 text-gray-600" />
    } else {
      switch (tendencia) {
        case 'crescente':
          return <TrendingUp className="h-4 w-4 text-red-600" />
        case 'decrescente':
          return <TrendingUp className="h-4 w-4 text-green-600 transform rotate-180" />
        default:
          return <Minus className="h-4 w-4 text-gray-600" />
      }
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Previsão" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
<<<<<<< HEAD
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse" />
                ))}
              </div>
              <div className="h-64 bg-muted rounded animate-pulse" />
=======
              <Skeleton className="h-8 w-48" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
          </Container>
        </main>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Previsão" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Dados não encontrados</h2>
              <p className="text-muted-foreground mb-6">
                Não foi possível carregar os dados de previsão.
              </p>
              <Button onClick={carregarDados}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Tentar novamente
              </Button>
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
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
        <Header title="Previsão" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Previsão
              </h1>
              <p className="text-muted-foreground mt-1">
                Análise preditiva e projeções futuras
              </p>
            </div>

            <div className="flex gap-2">
              <Select value={meses} onValueChange={setMeses}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Próximos 6 meses</SelectItem>
                  <SelectItem value="12">Próximos 12 meses</SelectItem>
                  <SelectItem value="24">Próximos 24 meses</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Cards de Confiabilidade */}
          <Card className="mb-8 bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Confiabilidade das Previsões</p>
<<<<<<< HEAD
                    <p className="text-2xl font-bold">{data?.confiabilidade}%</p>
=======
                    <p className="text-2xl font-bold">{data.confiabilidade}%</p>
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quanto mais dados históricos, maior a precisão
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cards Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link href="/app-empresa/previsao/uso-equipamentos">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm text-muted-foreground">Uso de Equipamentos</p>
                  <p className="text-2xl font-bold mt-1">
<<<<<<< HEAD
                    {data?.previsaoUso.resumo.totalHorasProjetadas.toFixed(0)}h
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {data?.previsaoUso.equipamentosAnalisados} equipamentos analisados
=======
                    {data.previsaoUso.resumo.totalHorasProjetadas.toFixed(0)}h
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {data.previsaoUso.equipamentosAnalisados} equipamentos analisados
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/previsao/manutencao">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <Wrench className="h-5 w-5 text-yellow-600" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm text-muted-foreground">Manutenções</p>
                  <p className="text-2xl font-bold mt-1">
<<<<<<< HEAD
                    {data?.previsaoManutencao.resumo.manutencoesProximas}
=======
                    {data.previsaoManutencao.resumo.manutencoesProximas}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Manutenções nos próximos 30 dias
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/previsao/custos">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-sm text-muted-foreground">Custos Projetados</p>
                  <p className="text-2xl font-bold mt-1">
<<<<<<< HEAD
                    {formatCurrency(data?.previsaoCustos.previsao[data?.previsaoCustos.previsao.length - 1]?.valor || 0)}
=======
                    {formatCurrency(data.previsaoCustos.previsao[data.previsaoCustos.previsao.length - 1]?.valor || 0)}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Último mês da projeção
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="visao-geral" className="space-y-6">
            <TabsList>
              <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="tendencias">Tendências</TabsTrigger>
              <TabsTrigger value="alertas">Alertas Preditivos</TabsTrigger>
            </TabsList>

            <TabsContent value="visao-geral">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Projeção de Custos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Gráfico de projeção de custos</p>
                    </div>
                    <div className="mt-4 space-y-2">
<<<<<<< HEAD
                      {data?.previsaoCustos.previsao.slice(0, 6).map((item, index) => (
=======
                      {data.previsaoCustos.previsao.slice(0, 6).map((item, index) => (
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                        <div key={index} className="flex justify-between text-sm">
                          <span>Mês {item.mes}</span>
                          <span className="font-bold">{formatCurrency(item.valor)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Manutenções Previstas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
<<<<<<< HEAD
                      {data?.previsaoManutencao.previsoes?.slice(0, 5).map((item, index) => (
=======
                      {data.previsaoManutencao.previsoes?.slice(0, 5).map((item, index) => (
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                        <div key={index} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm">{item.equipamentoTag}</span>
                            <Badge variant="outline">{item.previsao[0]?.diasAteProxima} dias</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
<<<<<<< HEAD
                            Próxima: {formatDate(item.previsao[0]?.data, 'dd/MM/yyyy')}
                          </p>
                        </div>
                      ))}
=======
                            Próxima: {item.previsao[0]?.data ? formatDate(item.previsao[0].data, 'dd/MM/yyyy') : '-'}
                          </p>
                        </div>
                      ))}
                      {!data.previsaoManutencao.previsoes?.length && (
                        <p className="text-center text-muted-foreground py-4">
                          Nenhuma manutenção prevista
                        </p>
                      )}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tendencias">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      Uso de Equipamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
<<<<<<< HEAD
                      {getTendenciaIcon(data?.tendencias.uso.tendenciaGeral || 'estavel')}
                      <span className="font-medium">
                        Tendência: {data?.tendencias.uso.tendenciaGeral}
                      </span>
                    </div>
                    {data?.tendencias.uso.equipamentosCriticos.length > 0 && (
=======
                      {getTendenciaIcon(data.tendencias.uso.tendenciaGeral)}
                      <span className="font-medium">
                        Tendência: {data.tendencias.uso.tendenciaGeral}
                      </span>
                    </div>
                    {data.tendencias.uso.equipamentosCriticos.length > 0 && (
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                      <div>
                        <p className="text-sm font-medium mb-2">Equipamentos críticos:</p>
                        <div className="space-y-2">
                          {data.tendencias.uso.equipamentosCriticos.slice(0, 3).map((eq, i) => (
                            <div key={i} className="text-sm flex justify-between">
                              <span>{eq.tag}</span>
                              <span className="text-red-600">+{(eq.tendencia * 100).toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-primary" />
                      Manutenções
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
<<<<<<< HEAD
                      {getTendenciaIcon(data?.tendencias.manutencoes.tendenciaGeral || 'estavel')}
                      <span className="font-medium">
                        Tendência: {data?.tendencias.manutencoes.tendenciaGeral}
                      </span>
                    </div>
                    {data?.tendencias.manutencoes.equipamentosAtencao.length > 0 && (
=======
                      {getTendenciaIcon(data.tendencias.manutencoes.tendenciaGeral)}
                      <span className="font-medium">
                        Tendência: {data.tendencias.manutencoes.tendenciaGeral}
                      </span>
                    </div>
                    {data.tendencias.manutencoes.equipamentosAtencao.length > 0 && (
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                      <div>
                        <p className="text-sm font-medium mb-2">Equipamentos em atenção:</p>
                        <div className="space-y-2">
                          {data.tendencias.manutencoes.equipamentosAtencao.slice(0, 3).map((eq, i) => (
                            <div key={i} className="text-sm flex justify-between">
                              <span>{eq.tag}</span>
                              <Badge variant="outline">{eq.dias} dias</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Custos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
<<<<<<< HEAD
                      {getTendenciaIcon(data?.tendencias.custos.tendenciaGeral || 0)}
                      <span className="font-medium">
                        Tendência: {data?.tendencias.custos.tendenciaGeral > 0 ? '+'
                          : data?.tendencias.custos.tendenciaGeral < 0 ? '-' : ''}
                        {((data?.tendencias.custos.tendenciaGeral || 0) * 100).toFixed(1)}%
=======
                      {getTendenciaIcon(data.tendencias.custos.tendenciaGeral)}
                      <span className="font-medium">
                        Tendência: {data.tendencias.custos.tendenciaGeral > 0 ? '+' : ''}
                        {(data.tendencias.custos.tendenciaGeral * 100).toFixed(1)}%
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Projeção mensal:</span>
<<<<<<< HEAD
                        <span className="font-bold">{formatCurrency(data?.tendencias.custos.projecao || 0)}</span>
=======
                        <span className="font-bold">{formatCurrency(data.tendencias.custos.projecao)}</span>
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alertas">
              <Card>
                <CardHeader>
                  <CardTitle>Alertas Preditivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
<<<<<<< HEAD
                    {data?.alertas.length === 0 ? (
=======
                    {data.alertas.length === 0 ? (
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                      <p className="text-center text-muted-foreground py-4">
                        Nenhum alerta preditivo no momento
                      </p>
                    ) : (
<<<<<<< HEAD
                      data?.alertas.map((alerta, index) => (
=======
                      data.alertas.map((alerta, index) => (
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 rounded-lg border ${
                            alerta.gravidade === 'alta' ? 'border-red-200 bg-red-50 dark:bg-red-950/20' :
                            alerta.gravidade === 'media' ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20' :
                            'border-green-200 bg-green-50 dark:bg-green-950/20'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {alerta.gravidade === 'alta' ? (
                                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                              ) : alerta.gravidade === 'media' ? (
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                              ) : (
                                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                              )}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getGravidadeBadge(alerta.gravidade)}>
                                    {alerta.gravidade}
                                  </Badge>
                                  <span className="text-sm font-medium">{alerta.equipamento}</span>
                                </div>
                                <p className="text-sm">{alerta.descricao}</p>
<<<<<<< HEAD
                                {alerta.diasAte && (
=======
                                {alerta.diasAte !== undefined && (
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {alerta.diasAte <= 0 ? 'Atrasado' : `${alerta.diasAte} dias`}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
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