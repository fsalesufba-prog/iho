'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Wrench,
  Calendar,
  Download,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  TrendingUp
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

interface PrevisaoData {
  equipamento: Equipamento
  previsao: {
    estatisticas: {
      totalManutencoes: number
      mediaIntervalo: number
      desvioPadrao: number
      minimoIntervalo: number
      maximoIntervalo: number
    }
    tipos: Record<string, number>
    ultimaManutencao: string
    previsao: Array<{
      mes: number
      data: string
      intervalo: number
      tipo: string
      confiabilidade: number
    }>
  }
  historico: Array<{
    data: string
    tipo: string
    custo?: number
    descricao: string
  }>
  recomendacoes: string[]
}

export default function PrevisaoManutencaoEquipamentoPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<PrevisaoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [meses, setMeses] = useState('12')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [params.id, meses])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/previsao/manutencao/${params.id}`, {
        params: { meses }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar previsão',
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
              <Wrench className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Equipamento não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O equipamento que você está procurando não existe.
              </p>
              <Link href="/app-empresa/previsao/manutencao">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para lista
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
        <Header title={`Previsão de Manutenções - ${data.equipamento.tag}`} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/previsao/manutencao"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Previsão de Manutenções - {data.equipamento.tag}
              </h1>
              <p className="text-muted-foreground mt-1">
                {data.equipamento.nome} - {data.equipamento.marca} {data.equipamento.modelo}
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
                  <p className="font-bold">{data.equipamento.horaAtual} h</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última Manutenção</p>
                  <p className="font-bold">{formatDate(data.previsao.ultimaManutencao, 'dd/MM/yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total de Manutenções</p>
                <p className="text-2xl font-bold">{data.previsao.estatisticas.totalManutencoes}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Intervalo Médio</p>
                <p className="text-2xl font-bold">{data.previsao.estatisticas.mediaIntervalo} dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Mínimo Intervalo</p>
                <p className="text-2xl font-bold text-green-600">{data.previsao.estatisticas.minimoIntervalo} dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Máximo Intervalo</p>
                <p className="text-2xl font-bold text-red-600">{data.previsao.estatisticas.maximoIntervalo} dias</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Histórico e Previsão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de histórico e previsão</p>
              </div>
            </CardContent>
          </Card>

          {/* Previsões */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Próximas Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.previsao.previsao.map((item, index) => (
                  <motion.div
                    key={item.mes}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Manutenção {item.mes}</span>
                      <Badge variant={item.confiabilidade > 70 ? 'default' : 'outline'}>
                        {item.confiabilidade}% confiança
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Data prevista</p>
                        <p className="text-lg font-bold">{formatDate(item.data, 'dd/MM/yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo</p>
                        <p className="text-lg font-bold">{item.tipo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Intervalo</p>
                        <p className="text-lg font-bold">{item.intervalo.toFixed(0)} dias</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recomendações */}
          {data.recomendacoes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {data.recomendacoes.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </Container>
      </main>
    </>
  )
}