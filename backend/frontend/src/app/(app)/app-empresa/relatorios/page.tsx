'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  TrendingUp,
  DollarSign,
  Wrench,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  RefreshCw,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface DashboardData {
  recentes: Array<{
    id: number
    tipo: string
    formato: string
    createdAt: string
    usuario: {
      nome: string
    }
  }>
  agendados: Array<{
    id: number
    nome: string
    frequencia: string
    proximaExecucao: string
    destinatarios: string[]
  }>
  estatisticas: {
    total: number
    ultimos7Dias: number
    porTipo: Array<{
      tipo: string
      quantidade: number
    }>
  }
}

export default function RelatoriosPage() {
  const { toast } = useToast()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/relatorios/dashboard')
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar dashboard',
        description: 'Não foi possível carregar os dados de relatórios.',
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

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'operacional':
        return <TrendingUp className="h-4 w-4" />
      case 'financeiro':
        return <DollarSign className="h-4 w-4" />
      case 'manutencao':
        return <Wrench className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Relatórios" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded animate-pulse" />
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
        <Header title="Relatórios" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Relatórios
              </h1>
              <p className="text-muted-foreground mt-1">
                Gere e gerencie relatórios gerenciais
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Link href="/app-empresa/relatorios/personalizados/criar">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Relatório
                </Button>
              </Link>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Relatórios</p>
                    <p className="text-2xl font-bold">{data?.estatisticas.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
                    <p className="text-2xl font-bold">{data?.estatisticas.ultimos7Dias}</p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Relatórios Agendados</p>
                    <p className="text-2xl font-bold">{data?.agendados.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Tipos */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Relatórios por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de distribuição por tipo</p>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="gerenciais" className="space-y-6">
            <TabsList>
              <TabsTrigger value="gerenciais">Relatórios Gerenciais</TabsTrigger>
              <TabsTrigger value="recentes">Recentes</TabsTrigger>
              <TabsTrigger value="agendados">Agendados</TabsTrigger>
            </TabsList>

            <TabsContent value="gerenciais">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link href="/app-empresa/relatorios/gerenciais/operacional">
                  <Card className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="font-semibold mb-1">Relatório Operacional</h3>
                      <p className="text-sm text-muted-foreground">
                        Análise de horas trabalhadas, produtividade e desempenho
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/app-empresa/relatorios/gerenciais/financeiro">
                  <Card className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="font-semibold mb-1">Relatório Financeiro</h3>
                      <p className="text-sm text-muted-foreground">
                        Custos, receitas, depreciação e indicadores financeiros
                      </p>
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/app-empresa/relatorios/gerenciais/manutencao">
                  <Card className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                          <Wrench className="h-5 w-5 text-yellow-600" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="font-semibold mb-1">Relatório de Manutenção</h3>
                      <p className="text-sm text-muted-foreground">
                        Manutenções realizadas, custos e indicadores de confiabilidade
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="recentes">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.recentes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum relatório gerado recentemente
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {data?.recentes.map((relatorio, index) => (
                        <motion.div
                          key={relatorio.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div className="flex items-center gap-3">
                            {getTipoIcon(relatorio.tipo)}
                            <div>
                              <p className="font-medium">
                                Relatório {relatorio.tipo}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(relatorio.createdAt, 'dd/MM/yyyy HH:mm')} • {relatorio.usuario.nome}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">{relatorio.formato}</Badge>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="agendados">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Agendados</CardTitle>
                </CardHeader>
                <CardContent>
                  {data?.agendados.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum relatório agendado
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {data?.agendados.map((agendado, index) => (
                        <motion.div
                          key={agendado.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{agendado.nome}</h3>
                            <Badge>{agendado.frequencia}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Próxima execução: {formatDate(agendado.proximaExecucao, 'dd/MM/yyyy HH:mm')}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Destinatários:</span>
                            {agendado.destinatarios.map((email, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {email}
                              </Badge>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Links Rápidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Link href="/app-empresa/relatorios/personalizados">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Personalizados</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/relatorios/agendados">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Agendados</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/relatorios/historico">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Histórico</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/app-empresa/relatorios/personalizados/criar">
              <Card className="hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium">Criar Novo</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </Container>
      </main>
    </>
  )
}