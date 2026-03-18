'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Download,
  RefreshCw,
  TrendingUp,
  Minus
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface CustosPrevisaoData {
  historico: Array<{
    mes: string
    valor: number
  }>
  previsao: Array<{
    mes: number
    valor: number
    intervaloMin: number
    intervaloMax: number
    confiabilidade: number
  }>
  estatisticas: {
    mediaMensal: number
    minimo: number
    maximo: number
    tendencia: number
  }
  totalProjetado: number
}

export default function PrevisaoCustosPage() {
  const { toast } = useToast()

  const [data, setData] = useState<CustosPrevisaoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [meses, setMeses] = useState('12')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [meses])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/previsao/custos', {
        params: { meses }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar previsões',
        description: 'Não foi possível carregar os dados de previsão de custos.',
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

  const getTendenciaIcon = (tendencia: number = 0) => {
    if (tendencia > 0.05) return <TrendingUp className="h-4 w-4 text-red-600" />
    if (tendencia < -0.05) return <TrendingUp className="h-4 w-4 text-green-600 transform rotate-180" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Previsão de Custos" />
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

  // Valores seguros com fallback
  const estatisticas = data?.estatisticas || {
    mediaMensal: 0,
    minimo: 0,
    maximo: 0,
    tendencia: 0
  }
  const totalProjetado = data?.totalProjetado || 0
  const previsao = data?.previsao || []

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Previsão de Custos" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/previsao"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Previsão
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Previsão de Custos
              </h1>
              <p className="text-muted-foreground mt-1">
                Projeção de custos de manutenção
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

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Média Mensal</p>
                <p className="text-2xl font-bold">{formatCurrency(estatisticas.mediaMensal)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Mínimo Mensal</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(estatisticas.minimo)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Máximo Mensal</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(estatisticas.maximo)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Projetado</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalProjetado)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Tendência */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTendenciaIcon(estatisticas.tendencia)}
                  <div>
                    <p className="text-sm text-muted-foreground">Tendência de Custos</p>
                    <p className="text-lg font-bold">
                      {estatisticas.tendencia > 0 ? '+' : ''}
                      {(estatisticas.tendencia * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  {estatisticas.tendencia > 0.1 ? 'Alta' :
                   estatisticas.tendencia < -0.1 ? 'Queda' : 'Estável'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Histórico e Projeção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de histórico e projeção de custos</p>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Previsão */}
          {previsao.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previsão Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {previsao.map((item, index) => (
                    <motion.div
                      key={item.mes}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Mês {item.mes}</span>
                        <Badge variant="outline">{item.confiabilidade}% confiança</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Projeção</p>
                          <p className="text-lg font-bold">{formatCurrency(item.valor)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Mínimo</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(item.intervaloMin)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Máximo</p>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(item.intervaloMax)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </Container>
      </main>
    </>
  )
}