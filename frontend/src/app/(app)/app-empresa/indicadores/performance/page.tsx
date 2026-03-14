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
  ArrowLeft,
  Download,
  RefreshCw,
  Calendar,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'

interface PerformanceData {
  geral: {
    valor: number
    tendencia: 'subindo' | 'estavel' | 'descendo'
  }
  equipamentos: Array<{
    equipamento: {
      id: number
      tag: string
      nome: string
      tipo: string
    }
    performance: {
      atual: number
      tendencia: number
      metricas: {
        produtividade: number
        eficiencia: number
        utilizacao: number
      }
    }
  }>
  historico: Array<{
    data: string
    valor: number
  }>
}

export default function PerformancePage() {
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const { toast } = useToast()

  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/indicadores/performance', {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar performance',
        description: 'Não foi possível carregar os dados.',
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

  const getTendenciaIcon = (tendencia: string | number) => {
    if (typeof tendencia === 'number') {
      if (tendencia > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
      if (tendencia < 0) return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
      return <Minus className="h-4 w-4 text-gray-600" />
    } else {
      switch (tendencia) {
        case 'subindo':
          return <TrendingUp className="h-4 w-4 text-green-600" />
        case 'descendo':
          return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
        default:
          return <Minus className="h-4 w-4 text-gray-600" />
      }
    }
  }

  const getPerformanceColor = (valor: number) => {
    if (valor >= 90) return 'text-green-600'
    if (valor >= 80) return 'text-blue-600'
    if (valor >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Performance" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-32 bg-muted rounded animate-pulse" />
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
        <Header title="Performance" />
        
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
                Performance
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe a performance operacional dos equipamentos
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

          {/* Card Principal */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-5xl font-bold ${getPerformanceColor(data?.geral.valor || 0)}`}>
                    {data?.geral.valor}%
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTendenciaIcon(data?.geral.tendencia || 'estavel')}
                    <span className="text-sm text-muted-foreground">
                      Tendência: {data?.geral.tendencia === 'subindo' ? 'Melhorando' :
                                 data?.geral.tendencia === 'descendo' ? 'Piorando' : 'Estável'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Meta</p>
                  <p className="text-3xl font-bold text-green-600">90%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Evolução da Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de evolução da performance</p>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Equipamento</CardTitle>
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
                    <Link href={`/app-empresa/indicadores/performance/${item.equipamento.id}`}>
                      <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-mono text-sm text-muted-foreground">
                              {item.equipamento.tag}
                            </span>
                            <h3 className="font-medium">{item.equipamento.nome}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.equipamento.tipo}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getPerformanceColor(item.performance.atual)}`}>
                              {item.performance.atual}%
                            </div>
                            <div className="flex items-center gap-1 justify-end">
                              {getTendenciaIcon(item.performance.tendencia)}
                              <span className="text-xs text-muted-foreground">
                                {item.performance.tendencia > 0 ? '+' : ''}{item.performance.tendencia}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t text-xs">
                          <div className="text-center">
                            <span className="text-muted-foreground">Produtividade</span>
                            <p className="font-bold">{item.performance.metricas.produtividade}%</p>
                          </div>
                          <div className="text-center">
                            <span className="text-muted-foreground">Eficiência</span>
                            <p className="font-bold">{item.performance.metricas.eficiencia}%</p>
                          </div>
                          <div className="text-center">
                            <span className="text-muted-foreground">Utilização</span>
                            <p className="font-bold">{item.performance.metricas.utilizacao}%</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>
    </>
  )
}