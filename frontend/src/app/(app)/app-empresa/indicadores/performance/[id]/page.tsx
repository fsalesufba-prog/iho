'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  TrendingUp,
  Minus,
  Calendar,
  Download,
  RefreshCw,
  Truck,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

interface Equipamento {
  id: number
  tag: string
  nome: string
  tipo: string
  marca: string
  modelo: string
  horaAtual: number
}

interface PerformanceData {
  equipamento: Equipamento
  performance: {
    atual: number
    tendencia: number
    metricas: {
      produtividade: number
      eficiencia: number
      utilizacao: number
    }
  }
  historico: Array<{
    data: string
    valor: number
  }>
}

export default function PerformanceEquipamentoPage() {
  const params = useParams()
  const { toast } = useToast()

  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [params.id, periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/indicadores/performance/${params.id}`, {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar performance',
        description: 'Não foi possível carregar os dados do equipamento.',
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

  const getTendenciaIcon = (tendencia: number) => {
    if (tendencia > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (tendencia < 0) return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
    return <Minus className="h-4 w-4 text-gray-600" />
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
          <Header title="Carregando..." />
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

  if (!data) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Equipamento não encontrado" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Equipamento não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O equipamento que você está procurando não existe.
              </p>
              <Link href="/app-empresa/indicadores/performance">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Performance
                </Button>
              </Link>
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
        <Header title={`Performance - ${data.equipamento.tag}`} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/indicadores/performance"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Performance
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Performance - {data.equipamento.tag}
              </h1>
              <p className="text-muted-foreground mt-1">
                {data.equipamento.nome} - {data.equipamento.marca} {data.equipamento.modelo}
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
              <CardTitle>Performance do Equipamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-5xl font-bold ${getPerformanceColor(data.performance.atual)}`}>
                    {data.performance.atual}%
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {getTendenciaIcon(data.performance.tendencia)}
                    <span className="text-sm text-muted-foreground">
                      Tendência: {data.performance.tendencia > 0 ? '+' : ''}{data.performance.tendencia}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Produtividade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getPerformanceColor(data.performance.metricas.produtividade)}`}>
                  {data.performance.metricas.produtividade}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getPerformanceColor(data.performance.metricas.eficiencia)}`}>
                  {data.performance.metricas.eficiencia}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getPerformanceColor(data.performance.metricas.utilizacao)}`}>
                  {data.performance.metricas.utilizacao}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações do Equipamento */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Informações do Equipamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tag</p>
                  <p className="font-mono">{data.equipamento.tag}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p>{data.equipamento.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p>{data.equipamento.marca}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modelo</p>
                  <p>{data.equipamento.modelo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horas Atuais</p>
                  <p className="font-bold">{data.equipamento.horaAtual}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de evolução da performance</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>
    </>
  )
}