'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Download,
  RefreshCw,
  Package,
  ChevronRight,
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
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface DepreciacaoData {
  resumo: {
    totalEquipamentos: number
    valorAquisicao: number
    depreciacaoAcumulada: number
    valorAtual: number
    percentualDepreciado: number
  }
  porClasse: Array<{
    tipo: string
    totalEquipamentos: number
    valorAquisicao: number
    depreciacaoAcumulada: number
    valorAtual: number
  }>
  equipamentos: Array<{
    equipamento: {
      id: number
      tag: string
      nome: string
      tipo: string
      valorAquisicao: number
      dataAquisicao: string
      vidaUtilAnos: number
    }
    depreciacao: number
  }>
  historico: Array<{
    data: string
    valor: number
  }>
}

export default function DepreciacaoPage() {
  const { toast } = useToast()

  const [data, setData] = useState<DepreciacaoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/financeiro/depreciacao', {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar depreciação',
        description: 'Não foi possível carregar os dados de depreciação.',
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
          <Header title="Depreciação" />
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
        <Header title="Depreciação" />
        
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
                Depreciação
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe a depreciação dos seus equipamentos
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
                <p className="text-sm text-muted-foreground">Valor de Aquisição</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(data?.resumo.valorAquisicao || 0)}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {data?.resumo.totalEquipamentos} equipamentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Depreciação Acumulada</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {formatCurrency(data?.resumo.depreciacaoAcumulada || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {data?.resumo.percentualDepreciado.toFixed(1)}% do total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Valor Atual</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(data?.resumo.valorAtual || 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Patrimônio líquido
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Evolução da Depreciação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de evolução da depreciação</p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="classes" className="space-y-6">
            <TabsList>
              <TabsTrigger value="classes">Por Classe</TabsTrigger>
              <TabsTrigger value="equipamentos">Por Equipamento</TabsTrigger>
            </TabsList>

            <TabsContent value="classes">
              <Card>
                <CardHeader>
                  <CardTitle>Depreciação por Classe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.porClasse.map((item, index) => (
                      <motion.div
                        key={item.tipo}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link href={`/app-empresa/financeiro/depreciacao/classes/${encodeURIComponent(item.tipo)}`}>
                          <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">{item.tipo}</span>
                                <Badge variant="outline">{item.totalEquipamentos} equipamentos</Badge>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Aquisição:</span>
                                <p className="font-bold">{formatCurrency(item.valorAquisicao)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Depreciação:</span>
                                <p className="font-bold text-yellow-600">{formatCurrency(item.depreciacaoAcumulada)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Atual:</span>
                                <p className="font-bold text-green-600">{formatCurrency(item.valorAtual)}</p>
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

            <TabsContent value="equipamentos">
              <Card>
                <CardHeader>
                  <CardTitle>Depreciação por Equipamento</CardTitle>
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
                        <Link href={`/app-empresa/financeiro/depreciacao/equipamentos/${item.equipamento.id}`}>
                          <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-mono text-sm text-muted-foreground">
                                  {item.equipamento.tag}
                                </span>
                                <h3 className="font-medium">{item.equipamento.nome}</h3>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Aquisição:</span>
                                <p className="font-bold">{formatCurrency(item.equipamento.valorAquisicao)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Depreciação:</span>
                                <p className="font-bold text-yellow-600">{formatCurrency(item.depreciacao)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Atual:</span>
                                <p className="font-bold text-green-600">
                                  {formatCurrency(item.equipamento.valorAquisicao - item.depreciacao)}
                                </p>
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
          </Tabs>
        </Container>
      </main>
    </>
  )
}