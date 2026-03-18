'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  AlertCircle,
  Package,
  RefreshCw,
  Download,
  Eye,
  TrendingDown
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface ItemAnalise {
  id: number
  nome: string
  codigo: string
  categoria: string
  unidade: string
  estoqueMinimo: number
  estoqueAtual: number
  valorUnitario?: number
  alerta: boolean
  percentual: number
  diasAteAcabar: number | null
}

export default function AnaliseEstoqueMinimoPage() {
  const { toast } = useToast()

  const [items, setItems] = useState<ItemAnalise[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/analise/estoque-minimo')
      setItems(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar análise',
        description: 'Não foi possível carregar os dados de estoque mínimo.',
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



  const itemsCriticos = items.filter(i => i.estoqueAtual <= 0)
  const itemsAtencao = items.filter(i => i.estoqueAtual > 0 && i.estoqueAtual <= i.estoqueMinimo)
  const itemsNormais = items.filter(i => i.estoqueAtual > i.estoqueMinimo)

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Análise de Estoque Mínimo" />
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
        <Header title="Análise de Estoque Mínimo" />
        
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
                Análise de Estoque Mínimo
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe itens com estoque baixo ou esgotado
              </p>
            </div>

            <div className="flex gap-2">
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
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 dark:text-red-400">Itens Esgotados</p>
                    <p className="text-2xl font-bold text-red-600">{itemsCriticos.length}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Abaixo do Mínimo</p>
                    <p className="text-2xl font-bold text-yellow-600">{itemsAtencao.length}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Estoque Normal</p>
                    <p className="text-2xl font-bold text-green-600">{itemsNormais.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Itens Críticos */}
          {itemsCriticos.length > 0 && (
            <Card className="mb-8 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Itens Esgotados - Necessário Reposição Urgente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {itemsCriticos.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm">{item.codigo}</span>
                            <Badge variant="destructive">ESGOTADO</Badge>
                          </div>
                          <h3 className="font-medium">{item.nome}</h3>
                          <p className="text-sm text-muted-foreground">{item.categoria}</p>
                        </div>
                        <Link href={`/app-empresa/almoxarifado/estoque/${item.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver item
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Itens Abaixo do Mínimo */}
          {itemsAtencao.length > 0 && (
            <Card className="mb-8 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <TrendingDown className="h-5 w-5" />
                  Itens Abaixo do Estoque Mínimo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {itemsAtencao.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-sm">{item.codigo}</span>
                            <Badge variant="outline" className="bg-yellow-100">
                              {item.estoqueAtual}/{item.estoqueMinimo} {item.unidade}
                            </Badge>
                          </div>
                          <h3 className="font-medium">{item.nome}</h3>
                          <p className="text-sm text-muted-foreground">{item.categoria}</p>
                          
                          {item.diasAteAcabar && (
                            <p className="text-sm mt-2">
                              <span className="text-muted-foreground">Previsão de esgotamento:</span>
                              <span className="ml-2 font-medium text-yellow-600">
                                {item.diasAteAcabar} dias
                              </span>
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Valor unit.</p>
                          <p className="font-bold">{item.valorUnitario ? formatCurrency(item.valorUnitario) : '-'}</p>
                          
                          <Link href={`/app-empresa/almoxarifado/estoque/${item.id}`}>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Eye className="mr-2 h-4 w-4" />
                              Ver item
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Estoque atual</span>
                          <span>{item.estoqueAtual} / {item.estoqueMinimo} (mínimo)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500"
                            style={{ width: `${item.percentual}%` }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Itens Normais */}
          {itemsNormais.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Package className="h-5 w-5" />
                  Itens com Estoque Normal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itemsNormais.slice(0, 6).map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-3 rounded-lg border"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.nome}</p>
                          <p className="text-sm text-muted-foreground">{item.codigo}</p>
                        </div>
                        <Badge>{item.estoqueAtual} {item.unidade}</Badge>
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