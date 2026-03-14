'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Activity,
  TrendingUp,
<<<<<<< HEAD
=======
  Minus,
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  Clock,
  DollarSign,
  AlertCircle,
  BarChart3,
  Download,
  RefreshCw,
  Calendar,
  Zap,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'

import { useToast } from '@/components/ui/use-toast'
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

// Componentes de gráficos (simplificados - em produção use Recharts ou ApexCharts)
const GaugeChart = ({ value, max = 100, label, color }: { value: number; max?: number; label: string; color: string }) => (
  <div className="relative w-32 h-32 mx-auto">
    <svg className="w-full h-full" viewBox="0 0 100 100">
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="10"
      />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={`${2 * Math.PI * 40 * value / max} ${2 * Math.PI * 40}`}
        strokeDashoffset={2 * Math.PI * 40 * 0.25}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dy="0.3em"
        className="text-2xl font-bold"
        fill="currentColor"
      >
        {value}
      </text>
    </svg>
    <p className="text-center text-sm text-muted-foreground mt-2">{label}</p>
  </div>
)

const LineChartPlaceholder = ({ data, label }: { data: number[]; label: string }) => (
  <div className="h-32 w-full">
    <svg className="w-full h-full" viewBox="0 0 200 80">
      <polyline
        points={data.map((v, i) => `${i * 30 + 10},${80 - v * 0.6}`).join(' ')}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
      />
      {data.map((v, i) => (
        <circle
          key={i}
          cx={i * 30 + 10}
          cy={80 - v * 0.6}
          r="2"
          fill="hsl(var(--primary))"
        />
      ))}
    </svg>
    <p className="text-center text-xs text-muted-foreground mt-2">{label}</p>
  </div>
)

interface DashboardData {
  iho: {
    valor: number
    classificacao: 'otimo' | 'bom' | 'regular' | 'ruim' | 'pessimo'
    tendencia: 'subindo' | 'estavel' | 'descendo'
  }
  disponibilidade: {
    valor: number
    tendencia: string
  }
  performance: {
    valor: number
    tendencia: string
  }
  mtbf: {
    valor: number
    tendencia: string
  }
  mttr: {
    valor: number
    tendencia: string
  }
  custos: {
    total: number
    porTipo: {
      preventiva: number
      corretiva: number
      preditiva: number
    }
  }
  alertas: Array<{
    tipo: string
    gravidade: string
    equipamento: string
    descricao: string
  }>
}

export default function IndicadoresPage() {
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/indicadores/dashboard', {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar indicadores',
        description: 'Não foi possível carregar os dados do dashboard.',
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
    if (valor >= 90) return '#10b981'
    if (valor >= 75) return '#3b82f6'
    if (valor >= 60) return '#f59e0b'
    if (valor >= 40) return '#f97316'
    return '#ef4444'
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

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subindo':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'descendo':
        return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getGravidadeBadge = (gravidade: string) => {
    const variants = {
      alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      baixa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
    return variants[gravidade as keyof typeof variants] || ''
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Indicadores" />
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
        <Header title="Indicadores" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Indicadores
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe o desempenho operacional da sua frota
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

          {/* Cards principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <Badge className={getIHOBadge(data?.iho.classificacao || 'regular')}>
                    {data?.iho.classificacao}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">IHO - Saúde Operacional</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold">{data?.iho.valor}%</p>
                    <div className="flex items-center mb-1">
                      {getTendenciaIcon(data?.iho.tendencia || 'estavel')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Disponibilidade</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold">{data?.disponibilidade.valor}%</p>
                    <div className="flex items-center mb-1">
                      {getTendenciaIcon(data?.disponibilidade.tendencia || 'estavel')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Performance</p>
                  <div className="flex items-end gap-2">
                    <p className="text-3xl font-bold">{data?.performance.valor}%</p>
                    <div className="flex items-center mb-1">
                      {getTendenciaIcon(data?.performance.tendencia || 'estavel')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Custos (30d)</p>
                  <p className="text-3xl font-bold">{formatCurrency(data?.custos.total || 0)}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* IHO Gauge e componentes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>IHO - Índice de Saúde Operacional</CardTitle>
              </CardHeader>
              <CardContent>
                <GaugeChart
                  value={data?.iho.valor || 0}
                  max={100}
                  label="Saúde Geral"
                  color={getIHOColor(data?.iho.valor || 0)}
                />
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">Disponibilidade</p>
                    <p className="text-lg font-bold">{data?.disponibilidade.valor}%</p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-xs text-muted-foreground">Performance</p>
                    <p className="text-lg font-bold">{data?.performance.valor}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução do IHO</CardTitle>
              </CardHeader>
              <CardContent>
                <LineChartPlaceholder
                  data={[65, 68, 72, 70, 75, 78, 82, 80, 85, 83, 87, 85]}
                  label="Últimos 30 dias"
                />
              </CardContent>
            </Card>
          </div>

          {/* MTBF e MTTR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>MTBF - Tempo Médio Entre Falhas</span>
                  <Badge variant="outline">{data?.mtbf.valor}h</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LineChartPlaceholder
                    data={[120, 135, 118, 142, 138, 155, 148]}
                    label="Histórico (horas)"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tendência:</span>
                    <span className="flex items-center gap-1">
                      {getTendenciaIcon(data?.mtbf.tendencia || 'estavel')}
                      {data?.mtbf.tendencia === 'subindo' ? 'Melhorando' : 
                       data?.mtbf.tendencia === 'descendo' ? 'Piorando' : 'Estável'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>MTTR - Tempo Médio de Reparo</span>
                  <Badge variant="outline">{data?.mttr.valor}h</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <LineChartPlaceholder
                    data={[8, 7.5, 9, 8.2, 7.8, 6.5, 7]}
                    label="Histórico (horas)"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tendência:</span>
                    <span className="flex items-center gap-1">
                      {getTendenciaIcon(data?.mttr.tendencia || 'estavel')}
                      {data?.mttr.tendencia === 'subindo' ? 'Piorando' : 
                       data?.mttr.tendencia === 'descendo' ? 'Melhorando' : 'Estável'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custos e Alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Custos de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-sm text-muted-foreground">Preventiva</p>
                      <p className="text-lg font-bold text-blue-600">
                        {formatCurrency(data?.custos.porTipo.preventiva || 0)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
                      <p className="text-sm text-muted-foreground">Corretiva</p>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(data?.custos.porTipo.corretiva || 0)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <p className="text-sm text-muted-foreground">Preditiva</p>
                      <p className="text-lg font-bold text-purple-600">
                        {formatCurrency(data?.custos.porTipo.preditiva || 0)}
                      </p>
                    </div>
                  </div>
                  <LineChartPlaceholder
                    data={[1200, 1500, 1100, 1800, 1600, 1400, 1900]}
                    label="Evolução de custos"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Alertas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.alertas.slice(0, 5).map((alerta, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 rounded-lg border"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <Badge className={getGravidadeBadge(alerta.gravidade)}>
                          {alerta.gravidade}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {alerta.equipamento}
                        </span>
                      </div>
                      <p className="text-sm">{alerta.descricao}</p>
                    </motion.div>
                  ))}
                  {(!data?.alertas || data.alertas.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum alerta no período
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Links rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Link href="/app-empresa/indicadores/iho">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">IHO Detalhado</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/indicadores/disponibilidade">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Disponibilidade</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/indicadores/performance">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Performance</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/indicadores/mtbf-mttr">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">MTBF/MTTR</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </Container>
      </main>
    </>
  )
}