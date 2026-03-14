'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Package,
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

interface ClasseData {
  classe: string
  totalEquipamentos: number
  ihoClasse: number
  equipamentos: Array<{
    equipamento: {
      id: number
      tag: string
      nome: string
      modelo: string
    }
    iho: {
      atual: number
      tendencia: number
    }
  }>
}

export default function IhoClassePage() {
  const params = useParams()
  const { toast } = useToast()

  const [data, setData] = useState<ClasseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [params.tipo, periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/indicadores/iho/classes/${encodeURIComponent(String(params.tipo))}`, {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar IHO',
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

  const getIHOColor = (valor: number) => {
    if (valor >= 90) return 'text-green-600'
    if (valor >= 75) return 'text-blue-600'
    if (valor >= 60) return 'text-yellow-600'
    if (valor >= 40) return 'text-orange-600'
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
          <Header title="Classe não encontrada" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Classe não encontrada</h2>
              <p className="text-muted-foreground mb-6">
                A classe de equipamento que você está procurando não existe.
              </p>
              <Link href="/app-empresa/indicadores/iho">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para IHO
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
        <Header title={`IHO - ${data.classe}`} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/indicadores/iho"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para IHO
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                IHO - {data.classe}
              </h1>
              <p className="text-muted-foreground mt-1">
                {data.totalEquipamentos} equipamentos nesta classe
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

          {/* IHO da Classe */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>IHO da Classe</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className={`text-7xl font-bold mb-2 ${getIHOColor(data.ihoClasse)}`}>
                  {data.ihoClasse.toFixed(1)}
                </div>
                <Badge variant="outline" className="mt-2">
                  Média da classe
                </Badge>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Distribuição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de distribuição do IHO</p>
                </div>
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
                    <Link href={`/app-empresa/indicadores/iho/equipamentos/${item.equipamento.id}`}>
                      <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-sm text-muted-foreground">
                              {item.equipamento.tag}
                            </span>
                            <h3 className="font-medium">{item.equipamento.nome}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.equipamento.modelo}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getIHOColor(item.iho.atual)}`}>
                              {item.iho.atual}
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <TrendingUp className={`h-3 w-3 ${
                                item.iho.tendencia > 0 ? 'text-green-600' :
                                item.iho.tendencia < 0 ? 'text-red-600' : 'text-gray-600'
                              }`} />
                              <span className="text-xs text-muted-foreground">
                                {item.iho.tendencia > 0 ? '+' : ''}{item.iho.tendencia}
                              </span>
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