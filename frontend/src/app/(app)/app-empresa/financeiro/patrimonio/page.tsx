'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Truck,
  Package,
  MapPin,
  ChevronRight,
  FileText
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
import { formatCurrency } from '@/lib/utils'

interface PatrimonioData {
  resumo: {
    totalEquipamentos: number
    valorTotal: number
    depreciacaoTotal: number
    valorLiquido: number
  }
  porStatus: Record<string, {
    quantidade: number
    valor: number
  }>
  porObra: Record<string, {
    quantidade: number
    valor: number
  }>
  equipamentos: Array<{
    id: number
    tag: string
    nome: string
    valorAquisicao: number
    valorAtual: number
    obra?: string
  }>
}

export default function PatrimonioPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<PatrimonioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/financeiro/patrimonio')
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar patrimônio',
        description: 'Não foi possível carregar os dados de patrimônio.',
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
          <Header title="Patrimônio" />
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
        <Header title="Patrimônio" />
        
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
                Patrimônio
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe o valor patrimonial dos seus equipamentos
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Link href="/app-empresa/financeiro/patrimonio/relatorio">
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Relatório
                </Button>
              </Link>

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
                <p className="text-sm text-muted-foreground">Valor Total de Aquisição</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(data?.resumo.valorTotal || 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {data?.resumo.totalEquipamentos} equipamentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Depreciação Total</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {formatCurrency(data?.resumo.depreciacaoTotal || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Valor Líquido</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(data?.resumo.valorLiquido || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="status" className="space-y-6">
            <TabsList>
              <TabsTrigger value="status">Por Status</TabsTrigger>
              <TabsTrigger value="obras">Por Obra</TabsTrigger>
              <TabsTrigger value="equipamentos">Lista de Equipamentos</TabsTrigger>
            </TabsList>

            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Patrimônio por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.porStatus && Object.entries(data.porStatus).map(([status, item], index) => (
                      <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge>{status}</Badge>
                          <span className="text-sm text-muted-foreground">{item.quantidade} equipamentos</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="text-lg font-bold">{formatCurrency(item.valor)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="obras">
              <Card>
                <CardHeader>
                  <CardTitle>Patrimônio por Obra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.porObra && Object.entries(data.porObra).map(([obra, item], index) => (
                      <motion.div
                        key={obra}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{obra}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.quantidade} equipamentos</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Valor:</span>
                          <span className="text-lg font-bold">{formatCurrency(item.valor)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipamentos">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Equipamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.equipamentos.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/app-empresa/equipamentos/${item.id}`}>
                          <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-mono text-sm text-muted-foreground">
                                  {item.tag}
                                </span>
                                <h3 className="font-medium">{item.nome}</h3>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Aquisição:</span>
                                <p className="font-bold">{formatCurrency(item.valorAquisicao)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Valor Atual:</span>
                                <p className="font-bold text-green-600">{formatCurrency(item.valorAtual)}</p>
                              </div>
                            </div>

                            {item.obra && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Obra: {item.obra}
                              </div>
                            )}
                          </div>
                        </Link>
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