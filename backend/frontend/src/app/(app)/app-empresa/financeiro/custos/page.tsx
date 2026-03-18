'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Download,
  RefreshCw,
  ChevronRight,
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

interface CustosData {
  resumo: {
    total: number
    manutencao: number
    combustivel: number
  }
  porTipo: {
    preventiva: number
    corretiva: number
    preditiva: number
  }
  porEquipamento: Array<{
    tag: string
    nome: string
    custo: number
  }>
  historico: Array<{
    data: string
    valor: number
  }>
}

export default function CustosPage() {
  const { toast } = useToast()

  const [data, setData] = useState<CustosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/financeiro/custos', {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar custos',
        description: 'Não foi possível carregar os dados de custos.',
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
          <Header title="Custos" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
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
        <Header title="Custos" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/financeiro"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Financeiro
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Custos Operacionais
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe os custos de manutenção e operação
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

          {/* Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(data?.resumo.total || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Manutenção</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(data?.resumo.manutencao || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Combustível</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {formatCurrency(data?.resumo.combustivel || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Custos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Preventiva</span>
                      <span className="text-sm font-bold">{formatCurrency(data?.porTipo.preventiva || 0)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600"
                        style={{ width: `${((data?.porTipo.preventiva || 0) / (data?.resumo.manutencao || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Corretiva</span>
                      <span className="text-sm font-bold">{formatCurrency(data?.porTipo.corretiva || 0)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-600"
                        style={{ width: `${((data?.porTipo.corretiva || 0) / (data?.resumo.manutencao || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Preditiva</span>
                      <span className="text-sm font-bold">{formatCurrency(data?.porTipo.preditiva || 0)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600"
                        style={{ width: `${((data?.porTipo.preditiva || 0) / (data?.resumo.manutencao || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução dos Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de evolução de custos</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Equipamentos por Custo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.porEquipamento.slice(0, 10).map((item, index) => (
                  <motion.div
                    key={item.tag}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/app-empresa/financeiro/custos/por-equipamento/${item.tag}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                          <div>
                            <span className="font-mono text-sm">{item.tag}</span>
                            <p className="text-sm font-medium">{item.nome}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-bold text-red-600">{formatCurrency(item.custo)}</span>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
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