'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Package,
  Truck,
  ChevronRight
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

interface ClasseData {
  classe: string
  totalEquipamentos: number
  valorAquisicao: number
  depreciacaoAcumulada: number
  valorAtual: number
  equipamentos: Array<{
    equipamento: {
      id: number
      tag: string
      nome: string
      valorAquisicao: number
    }
    depreciacao: number
  }>
}

export default function DepreciacaoClassePage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<ClasseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [params.tipo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/financeiro/depreciacao/classes/${encodeURIComponent(params.tipo)}`)
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar depreciação',
        description: 'Não foi possível carregar os dados da classe.',
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
          <Header title="Classe não encontrada" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Classe não encontrada</h2>
              <p className="text-muted-foreground mb-6">
                A classe de equipamento que você está procurando não existe.
              </p>
              <Link href="/app-empresa/financeiro/depreciacao">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Depreciação
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
        <Header title={`Depreciação - ${data.classe}`} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/financeiro/depreciacao"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Depreciação
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Depreciação - {data.classe}
              </h1>
              <p className="text-muted-foreground mt-1">
                {data.totalEquipamentos} equipamentos nesta classe
              </p>
            </div>

            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Valor de Aquisição</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(data.valorAquisicao)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Depreciação Acumulada</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {formatCurrency(data.depreciacaoAcumulada)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Valor Atual</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(data.valorAtual)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos da Classe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.equipamentos.map((item, index) => (
                  <motion.div
                    key={item.equipamento.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/app-empresa/financeiro/depreciacao/equipamentos/${item.equipamento.id}`}>
                      <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-sm text-muted-foreground">
                              {item.equipamento.tag}
                            </span>
                            <h3 className="font-medium">{item.equipamento.nome}</h3>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Aquisição:</span>
                            <p className="font-bold">{formatCurrency(item.equipamento.valorAquisicao)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Depreciação:</span>
                            <p className="font-bold text-yellow-600">{formatCurrency(item.depreciacao)}</p>
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