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
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

interface MTBFMTTRData {
  geral: {
    mtbf: {
      valor: number
      tendencia: 'subindo' | 'estavel' | 'descendo'
    }
    mttr: {
      valor: number
      tendencia: 'subindo' | 'estavel' | 'descendo'
    }
  }
  equipamentos: Array<{
    equipamento: {
      id: number
      tag: string
      nome: string
      tipo: string
    }
    mtbf: {
      atual: number
      tendencia: number
    }
    mttr: {
      atual: number
      tendencia: number
    }
    falhas: number
  }>
  historico: {
    mtbf: Array<{
      data: string
      valor: number
    }>
    mttr: Array<{
      data: string
      valor: number
    }>
  }
}

export default function MtbfMttrPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<MTBFMTTRData | null>(null)
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
      const response = await api.get('/indicadores/mtbf-mttr', {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar MTBF/MTTR',
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

  const getMTBFColor = (valor: number) => {
    if (valor >= 200) return 'text-green-600'
    if (valor >= 100) return 'text-blue-600'
    if (valor >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMTTRColor = (valor: number) => {
    if (valor <= 4) return 'text-green-600'
    if (valor <= 8) return 'text-blue-600'
    if (valor <= 12) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="MTBF/MTTR" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
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
        <Header title="MTBF/MTTR" />
        
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
                MTBF / MTTR
              </h1>
              <p className="text-muted-foreground mt-1">
                Tempo Médio Entre Falhas e Tempo Médio de Reparo
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

          {/* Cards Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>MTBF - Tempo Médio Entre Falhas</span>
                  <Badge variant="outline" className="ml-2">horas</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getMTBFColor(data?.geral.mtbf.valor || 0)}`}>
                      {data?.geral.mtbf.valor}h
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getTendenciaIcon(data?.geral.mtbf.tendencia || 'estavel')}
                      <span className="text-sm text-muted-foreground">
                        Tendência: {data?.geral.mtbf.tendencia === 'subindo' ? 'Melhorando' :
                                   data?.geral.mtbf.tendencia === 'descendo' ? 'Piorando' : 'Estável'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="text-lg font-bold">200h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>MTTR - Tempo Médio de Reparo</span>
                  <Badge variant="outline" className="ml-2">horas</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getMTTRColor(data?.geral.mttr.valor || 0)}`}>
                      {data?.geral.mttr.valor}h
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getTendenciaIcon(data?.geral.mttr.tendencia || 'estavel')}
                      <span className="text-sm text-muted-foreground">
                        Tendência: {data?.geral.mttr.tendencia === 'subindo' ? 'Piorando' :
                                   data?.geral.mttr.tendencia === 'descendo' ? 'Melhorando' : 'Estável'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Meta</p>
                    <p className="text-lg font-bold">4h</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do MTBF</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de evolução do MTBF</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução do MTTR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de evolução do MTTR</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos</CardTitle>
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
                    <Link href={`/app-empresa/indicadores/mtbf-mttr/${item.equipamento.id}`}>
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
                          <Badge>{item.falhas} falhas</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <p className="text-xs text-muted-foreground">MTBF</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${getMTBFColor(item.mtbf.atual)}`}>
                                {item.mtbf.atual}h
                              </span>
                              {getTendenciaIcon(item.mtbf.tendencia)}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">MTTR</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${getMTTRColor(item.mttr.atual)}`}>
                                {item.mttr.atual}h
                              </span>
                              {getTendenciaIcon(item.mttr.tendencia)}
                            </div>
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