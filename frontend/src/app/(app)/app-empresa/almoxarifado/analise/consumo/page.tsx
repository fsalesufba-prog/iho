'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
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
import { formatCurrency } from '@/lib/utils'

interface ConsumoData {
  periodo: string
  totalMovimentacoes: number
  consumoPorItem: Array<{
    id: number
    nome: string
    quantidade: number
    valor: number
  }>
  consumoPorCategoria: Record<string, {
    quantidade: number
    valor: number
  }>
  topItems: Array<{
    id: number
    nome: string
    quantidade: number
    valor: number
  }>
}

export default function AnaliseConsumoPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<ConsumoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/analise/consumo', {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar análise',
        description: 'Não foi possível carregar os dados de consumo.',
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

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Análise de Consumo" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-64 bg-muted rounded animate-pulse" />
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
        <Header title="Análise de Consumo" />
        
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Análise de Consumo
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe o consumo de itens do estoque
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

          {/* Resumo */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Movimentações</p>
                    <p className="text-2xl font-bold">{data?.totalMovimentacoes}</p>
                  </div>
                </div>
                <Badge variant="outline">Período: {data?.periodo}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Top Itens Consumidos */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top 10 Itens Mais Consumidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.topItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{item.nome}</p>
                        <p className="text-xs text-muted-foreground">ID: {item.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.quantidade} unidades</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.valor)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Consumo por Categoria */}
          <Card>
            <CardHeader>
              <CardTitle>Consumo por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.consumoPorCategoria && Object.entries(data.consumoPorCategoria).map(([categoria, dados], index) => (
                  <motion.div
                    key={categoria}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{categoria}</h3>
                      <Badge variant="outline">{dados.quantidade} unidades</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Valor total:</span>
                      <span className="text-lg font-bold text-primary">{formatCurrency(dados.valor)}</span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ 
                          width: `${(dados.valor / (data?.consumoPorItem.reduce((sum, i) => sum + i.valor, 0) || 1)) * 100}%` 
                        }}
                      />
                    </div>
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