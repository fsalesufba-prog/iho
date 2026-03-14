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
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface ManutencaoPrevisaoData {
  totalEquipamentos: number
  equipamentosAnalisados: number
  previsoes: Array<{
    equipamentoId: number
    equipamentoTag: string
    equipamentoNome: string
    horaAtual: number
    mediaIntervalo: number
    diasDesdeUltima: number
    ultimaManutencao: string
    previsao: Array<{
      mes: number
      data: string
      diasAteProxima: number
      confiabilidade: number
    }>
  }>
  resumo: {
    manutencoesProximas: number
    mediaIntervalo: number
  }
}

export default function PrevisaoManutencoesPage() {
  const { toast } = useToast()

  const [data, setData] = useState<ManutencaoPrevisaoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [meses, setMeses] = useState('12')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [meses])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/previsao/manutencao', {
        params: { meses }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar previsões',
        description: 'Não foi possível carregar os dados de previsão de manutenções.',
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
          <Header title="Previsão de Manutenções" />
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

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Previsão de Manutenções" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/previsao"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Previsão
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Previsão de Manutenções
              </h1>
              <p className="text-muted-foreground mt-1">
                Projeção de manutenções preventivas
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

          {/* Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Equipamentos Analisados</p>
                <p className="text-2xl font-bold mt-1">{data?.equipamentosAnalisados}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  de {data?.totalEquipamentos} totais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Manutenções nos Próximos 30 Dias</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {data?.resumo.manutencoesProximas}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Intervalo Médio entre Manutenções</p>
                <p className="text-2xl font-bold mt-1">{data?.resumo.mediaIntervalo} dias</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Previsões */}
          <Card>
            <CardHeader>
              <CardTitle>Previsões por Equipamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.previsoes.map((item, index) => (
                  <motion.div
                    key={item.equipamentoId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/app-empresa/previsao/manutencao/${item.equipamentoId}`}>
                      <div className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-mono text-sm text-muted-foreground">
                              {item.equipamentoTag}
                            </span>
                            <h3 className="font-medium">{item.equipamentoNome}</h3>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Última manutenção</p>
                            <p className="font-medium">{formatDate(item.ultimaManutencao, 'dd/MM/yyyy')}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Dias desde última</p>
                            <p className="font-medium">{item.diasDesdeUltima} dias</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Intervalo médio</p>
                            <p className="font-medium">{item.mediaIntervalo} dias</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-sm font-medium">Próximas:</p>
                          <div className="flex gap-2 flex-wrap">
                            {item.previsao.slice(0, 3).map((p, i) => (
                              <Badge
                                key={i}
                                variant={p.diasAteProxima <= 30 ? 'destructive' : 'outline'}
                                className="text-xs"
                              >
                                {formatDate(p.data, 'dd/MM')}
                                {p.diasAteProxima <= 30 && ' ⚠️'}
                              </Badge>
                            ))}
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