'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  TrendingUp,
  Minus,
  Calendar,
  Download,
  RefreshCw,
  Truck,
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
import { formatDate } from '@/lib/utils'

interface Equipamento {
  id: number
  tag: string
  nome: string
  tipo: string
  marca: string
  modelo: string
  horaAtual: number
}

interface MTBFMTTRData {
  equipamento: Equipamento
  mtbf: {
    atual: number
    tendencia: number
    falhas: Array<{
      data: string
      descricao: string
      tempoParada: number
    }>
  }
  mttr: {
    atual: number
    tendencia: number
    reparos: Array<{
      data: string
      descricao: string
      tempoReparo: number
      custo: number
    }>
  }
  historico: {
    mtbf: Array<{
      data: string
      valor: number
    }>
    mttr: Array<{
      data: string
      valor: number
    }>
  }
}

export default function MtbfMttrEquipamentoPage() {
  const params = useParams()
  const { toast } = useToast()

  const [data, setData] = useState<MTBFMTTRData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTab, setSelectedTab] = useState('mtbf')

  useEffect(() => {
    carregarDados()
  }, [params.id, periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/indicadores/mtbf-mttr/${params.id}`, {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar MTBF/MTTR',
        description: 'Não foi possível carregar os dados do equipamento.',
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

  const getTendenciaIcon = (tendencia: number) => {
    if (tendencia > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (tendencia < 0) return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getMTBFColor = (valor: number) => {
    if (valor >= 200) return 'text-green-600'
    if (valor >= 100) return 'text-blue-600'
    if (valor >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMTTRColor = (valor: number) => {
    if (valor <= 4) return 'text-green-600'
    if (valor <= 8) return 'text-blue-600'
    if (valor <= 12) return 'text-yellow-600'
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
          <Header title="Equipamento não encontrado" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Equipamento não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O equipamento que você está procurando não existe.
              </p>
              <Link href="/app-empresa/indicadores/mtbf-mttr">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para MTBF/MTTR
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
        <Header title={`MTBF/MTTR - ${data.equipamento.tag}`} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/indicadores/mtbf-mttr"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para MTBF/MTTR
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                MTBF/MTTR - {data.equipamento.tag}
              </h1>
              <p className="text-muted-foreground mt-1">
                {data.equipamento.nome} - {data.equipamento.marca} {data.equipamento.modelo}
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

          {/* Cards Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>MTBF - Tempo Médio Entre Falhas</span>
                  <Badge variant="outline" className="ml-2">horas</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getMTBFColor(data.mtbf.atual)}`}>
                      {data.mtbf.atual}h
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getTendenciaIcon(data.mtbf.tendencia)}
                      <span className="text-sm text-muted-foreground">
                        Tendência: {data.mtbf.tendencia > 0 ? '+' : ''}{data.mtbf.tendencia}h
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total de falhas</p>
                    <p className="text-lg font-bold">{data.mtbf.falhas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>MTTR - Tempo Médio de Reparo</span>
                  <Badge variant="outline" className="ml-2">horas</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <div className={`text-4xl font-bold ${getMTTRColor(data.mttr.atual)}`}>
                      {data.mttr.atual}h
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {getTendenciaIcon(data.mttr.tendencia)}
                      <span className="text-sm text-muted-foreground">
                        Tendência: {data.mttr.tendencia > 0 ? '+' : ''}{data.mttr.tendencia}h
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total de reparos</p>
                    <p className="text-lg font-bold">{data.mttr.reparos.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações do Equipamento */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Informações do Equipamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tag</p>
                  <p className="font-mono">{data.equipamento.tag}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p>{data.equipamento.tipo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marca</p>
                  <p>{data.equipamento.marca}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Modelo</p>
                  <p>{data.equipamento.modelo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horas Atuais</p>
                  <p className="font-bold">{data.equipamento.horaAtual}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="mtbf">Histórico de Falhas (MTBF)</TabsTrigger>
              <TabsTrigger value="mttr">Histórico de Reparos (MTTR)</TabsTrigger>
              <TabsTrigger value="graficos">Gráficos</TabsTrigger>
            </TabsList>

            <TabsContent value="mtbf">
              <Card>
                <CardHeader>
                  <CardTitle>Falhas Registradas</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.mtbf.falhas.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma falha registrada no período
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {data.mtbf.falhas.map((falha, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-lg border"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{falha.descricao}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(falha.data, 'dd/MM/yyyy HH:mm')}
                              </p>
                            </div>
                            <Badge variant="destructive">
                              {falha.tempoParada.toFixed(1)}h parado
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mttr">
              <Card>
                <CardHeader>
                  <CardTitle>Reparos Realizados</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.mttr.reparos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum reparo registrado no período
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {data.mttr.reparos.map((reparo, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-lg border"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{reparo.descricao}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(reparo.data, 'dd/MM/yyyy HH:mm')}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="mb-1">
                                {reparo.tempoReparo.toFixed(1)}h reparo
                              </Badge>
                              <p className="text-sm font-bold text-primary">
                                R$ {reparo.custo.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="graficos">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Evolução do MTBF</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Gráfico de evolução do MTBF</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Evolução do MTTR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Gráfico de evolução do MTTR</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </main>
    </>
  )
}