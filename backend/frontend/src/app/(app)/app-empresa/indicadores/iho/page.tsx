'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  TrendingUp,
  ArrowLeft,
  Download,
  RefreshCw,
  Calendar,
  Package,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

interface IHOData {
  geral: {
    valor: number
    classificacao: string
    tendencia: string
  }
  equipamentos: Array<{
    equipamento: {
      id: number
      tag: string
      nome: string
      tipo: string
    }
    iho: {
      atual: number
      tendencia: number
      componentes: {
        disponibilidade: number
        performance: number
        qualidade: number
        custo: number
        seguranca: number
      }
    }
  }>
  porTipo: Array<{
    tipo: string
    iho: number
  }>
  porStatus: Array<{
    status: string
    iho: number
    quantidade: number
  }>
  historico: Array<{
    data: string
    valor: number
  }>
}

export default function IhoPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<IHOData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('geral')

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/indicadores/iho', {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar IHO',
        description: 'Não foi possível carregar os dados do IHO.',
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

  const getIHOColor = (valor: number) => {
    if (valor >= 90) return 'text-green-600'
    if (valor >= 75) return 'text-blue-600'
    if (valor >= 60) return 'text-yellow-600'
    if (valor >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getIHOBadge = (classificacao: string) => {
    const variants = {
      otimo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      bom: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      regular: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      ruim: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      pessimo: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return variants[classificacao as keyof typeof variants] || ''
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="IHO" />
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
        <Header title="IHO - Índice de Saúde Operacional" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/indicadores"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Indicadores
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                IHO - Índice de Saúde Operacional
              </h1>
              <p className="text-muted-foreground mt-1">
                Análise detalhada da saúde dos equipamentos
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

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* IHO Geral */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>IHO Geral</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className={`text-7xl font-bold mb-2 ${getIHOColor(data?.geral.valor || 0)}`}>
                  {data?.geral.valor}
                </div>
                <Badge className={getIHOBadge(data?.geral.classificacao || 'regular')}>
                  {data?.geral.classificacao}
                </Badge>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <TrendingUp className={`h-4 w-4 ${
                    data?.geral.tendencia === 'subindo' ? 'text-green-600' :
                    data?.geral.tendencia === 'descendo' ? 'text-red-600' : 'text-gray-600'
                  }`} />
                  <span className="text-sm text-muted-foreground">
                    Tendência: {data?.geral.tendencia === 'subindo' ? 'Subindo' :
                               data?.geral.tendencia === 'descendo' ? 'Descendo' : 'Estável'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Componentes do IHO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {data?.equipamentos[0]?.iho.componentes.disponibilidade.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Disponibilidade</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {data?.equipamentos[0]?.iho.componentes.performance.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data?.equipamentos[0]?.iho.componentes.qualidade.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Qualidade</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {data?.equipamentos[0]?.iho.componentes.custo.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Custo</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {data?.equipamentos[0]?.iho.componentes.seguranca.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Segurança</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="geral">Visão Geral</TabsTrigger>
              <TabsTrigger value="equipamentos">Por Equipamento</TabsTrigger>
              <TabsTrigger value="tipos">Por Tipo</TabsTrigger>
              <TabsTrigger value="status">Por Status</TabsTrigger>
            </TabsList>

            <TabsContent value="geral">
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do IHO</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Gráfico de evolução do IHO</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipamentos">
              <Card>
                <CardHeader>
                  <CardTitle>IHO por Equipamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.equipamentos.map((item, index) => (
                      <motion.div
                        key={item.equipamento.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/app-empresa/indicadores/iho/equipamentos/${item.equipamento.id}`}>
                          <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-mono text-sm text-muted-foreground">
                                  {item.equipamento.tag}
                                </span>
                                <h3 className="font-medium">{item.equipamento.nome}</h3>
                              </div>
                              <div className={`text-2xl font-bold ${getIHOColor(item.iho.atual)}`}>
                                {item.iho.atual}
                              </div>
                            </div>
                            <div className="grid grid-cols-5 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Disp:</span>
                                <span className="ml-1 font-medium">{item.iho.componentes.disponibilidade.toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Perf:</span>
                                <span className="ml-1 font-medium">{item.iho.componentes.performance.toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Qual:</span>
                                <span className="ml-1 font-medium">{item.iho.componentes.qualidade.toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Custo:</span>
                                <span className="ml-1 font-medium">{item.iho.componentes.custo.toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Seg:</span>
                                <span className="ml-1 font-medium">{item.iho.componentes.seguranca.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tipos">
              <Card>
                <CardHeader>
                  <CardTitle>IHO por Tipo de Equipamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.porTipo.map((item, index) => (
                      <motion.div
                        key={item.tipo}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/app-empresa/indicadores/iho/classes/${encodeURIComponent(item.tipo)}`}>
                          <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{item.tipo}</span>
                              </div>
                              <div className={`text-2xl font-bold ${getIHOColor(item.iho)}`}>
                                {item.iho.toFixed(1)}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>IHO por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.porStatus.map((item, index) => (
                      <motion.div
                        key={item.status}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{item.status}</span>
                          <Badge variant="outline">{item.quantidade} equipamentos</Badge>
                        </div>
                        <div className={`text-2xl font-bold ${getIHOColor(item.iho)}`}>
                          {item.iho.toFixed(1)}
                        </div>
                      </motion.div>
                    ))}
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