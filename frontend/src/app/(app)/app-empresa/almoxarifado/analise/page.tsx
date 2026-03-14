'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  AlertCircle,
  BarChart3,
  LineChart,
  ChevronRight,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/components/ui/use-toast'
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface AnaliseData {
  consumo: {
    totalMovimentacoes: number
    topItems: Array<{
      id: number
      nome: string
      quantidade: number
      valor: number
    }>
  }
  estoqueMinimo: {
    criticos: number
    atencao: number
    normais: number
  }
  custos: {
    total: number
    porCategoria: Record<string, number>
  }
}

export default function AnalisePage() {
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const { toast } = useToast()

  const [data, setData] = useState<AnaliseData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      
      // Carregar dados das três análises
      const [consumoRes, estoqueMinimoRes, custosRes] = await Promise.all([
        api.get('/almoxarifado/analise/consumo', { params: { periodo: 30 } }),
        api.get('/almoxarifado/analise/estoque-minimo'),
        api.get('/almoxarifado/analise/custos', { params: { periodo: 30 } })
      ])

      setData({
        consumo: consumoRes.data.data,
        estoqueMinimo: {
          criticos: estoqueMinimoRes.data.data.filter((i: any) => i.estoqueAtual <= 0).length,
          atencao: estoqueMinimoRes.data.data.filter((i: any) => i.estoqueAtual > 0 && i.estoqueAtual <= i.estoqueMinimo).length,
          normais: estoqueMinimoRes.data.data.filter((i: any) => i.estoqueAtual > i.estoqueMinimo).length
        },
        custos: custosRes.data.data
      })
    } catch (error) {
      toast({
        title: 'Erro ao carregar análises',
        description: 'Não foi possível carregar os dados de análise.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Análises" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded animate-pulse" />
                ))}
              </div>
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
        <Header title="Análises" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/almoxarifado"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Almoxarifado
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Análises do Almoxarifado
            </h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe métricas e indicadores do estoque
            </p>
          </div>

          {/* Cards de Análise */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Análise de Consumo */}
            <Link href="/app-empresa/almoxarifado/analise/consumo">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Consumo
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Movimentações (30 dias)</p>
                        <p className="text-2xl font-bold">{data?.consumo.totalMovimentacoes}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Top itens consumidos</p>
                        <div className="space-y-2">
<<<<<<< HEAD
                          {data?.consumo.topItems.slice(0, 3).map((item, index) => (
=======
                          {data?.consumo.topItems.slice(0, 3).map((item) => (
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                            <div key={item.id} className="flex justify-between text-sm">
                              <span className="truncate max-w-[150px]">{item.nome}</span>
                              <span className="font-medium">{item.quantidade} un</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* Análise de Estoque Mínimo */}
            <Link href="/app-empresa/almoxarifado/analise/estoque-minimo">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        Estoque Mínimo
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded">
                          <p className="text-xs text-red-600">Críticos</p>
                          <p className="text-xl font-bold text-red-600">{data?.estoqueMinimo.criticos}</p>
                        </div>
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded">
                          <p className="text-xs text-yellow-600">Atenção</p>
                          <p className="text-xl font-bold text-yellow-600">{data?.estoqueMinimo.atencao}</p>
                        </div>
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded">
                          <p className="text-xs text-green-600">Normal</p>
                          <p className="text-xl font-bold text-green-600">{data?.estoqueMinimo.normais}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground text-center">
                        {data && (data.estoqueMinimo.criticos + data.estoqueMinimo.atencao)} itens precisam de atenção
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>

            {/* Análise de Custos */}
            <Link href="/app-empresa/almoxarifado/analise/custos">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Custos
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Custo total (30 dias)</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(data?.custos.total || 0)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Principais categorias</p>
                        <div className="space-y-2">
                          {data?.custos.porCategoria && 
                            Object.entries(data.custos.porCategoria)
                              .sort(([, a], [, b]) => b - a)
                              .slice(0, 3)
<<<<<<< HEAD
                              .map(([categoria, valor], index) => (
=======
                              .map(([categoria, valor]) => (
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                                <div key={categoria} className="flex justify-between text-sm">
                                  <span className="truncate max-w-[150px]">{categoria}</span>
                                  <span className="font-medium">{formatCurrency(valor)}</span>
                                </div>
                              ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </div>

          {/* Gráficos Rápidos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Consumo por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de consumo por categoria</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" />
                  Evolução de Custos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de evolução de custos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </>
  )
}