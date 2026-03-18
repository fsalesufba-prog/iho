'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Download,
  Calendar,
  RefreshCw,
  FileText,
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
import { formatDate, formatCurrency } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
interface ManutencaoData {
  titulo: string
  periodo: {
    inicio: string
    fim: string
  }
  resumo: {
    total: number
    custoTotal: number
    custoMedio: number
  }
  porTipo: Array<{
    tipo: string
    quantidade: number
    custo: number
  }>
  manutencoes: Array<{
    id: number
    tipo: string
    descricao: string
    dataRealizada: string
    custo: number
    equipamento: {
      id: number
      tag: string
      nome: string
    }
  }>
}

export default function RelatorioManutencaoPage() {
  const { toast } = useToast()

  const [data, setData] = useState<ManutencaoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [formato, setFormato] = useState('pdf')
  const [refreshing, setRefreshing] = useState(false)
  const [equipamentoId, setEquipamentoId] = useState<string>('')

  useEffect(() => {
    carregarDados()
  }, [periodo, equipamentoId])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/relatorios/gerenciais/manutencao', {
        params: { 
          periodo,
          equipamentoId: equipamentoId || undefined
        }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar relatório',
        description: 'Não foi possível carregar os dados de manutenção.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get('/relatorios/gerenciais/manutencao', {
        params: { periodo, equipamentoId: equipamentoId || undefined, formato },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-manutencao.${formato}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast({
        title: 'Erro ao baixar',
        description: 'Não foi possível baixar o relatório.',
        variant: 'destructive'
      })
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarDados()
    setRefreshing(false)
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      preventiva: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      corretiva: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      preditiva: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    }
    return variants[tipo as keyof typeof variants] || ''
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Relatório de Manutenção" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
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
        <Header title="Relatório de Manutenção" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/relatorios/gerenciais"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Gerenciais
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Relatório de Manutenção
              </h1>
              <p className="text-muted-foreground mt-1">
                {data?.periodo.inicio && data?.periodo.fim && (
                  <>Período: {formatDate(data.periodo.inicio, 'dd/MM/yyyy')} - {formatDate(data.periodo.fim, 'dd/MM/yyyy')}</>
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="ID do equipamento (opcional)"
                value={equipamentoId}
                onChange={(e) => setEquipamentoId(e.target.value)}
                className="w-[200px]"
              />

              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="15">15 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>

              <Select value={formato} onValueChange={setFormato}>
                <SelectTrigger className="w-[100px]">
                  <FileText className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Button onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total de Manutenções</p>
                <p className="text-2xl font-bold">{data?.resumo.total}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(data?.resumo.custoTotal || 0)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Custo Médio</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(data?.resumo.custoMedio || 0)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Manutenções por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.porTipo.map((item) => (
                    <div key={item.tipo} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <Badge className={getTipoBadge(item.tipo)}>
                          {item.tipo}
                        </Badge>
                        <span className="font-bold">{item.quantidade}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary"
                          style={{ width: `${(item.quantidade / (data?.resumo.total || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data?.porTipo.map((item) => (
                    <div key={item.tipo} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.tipo}</span>
                        <span className="font-bold">{formatCurrency(item.custo)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500"
                          style={{ width: `${(item.custo / (data?.resumo.custoTotal || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Manutenções */}
          <Card>
            <CardHeader>
              <CardTitle>Manutenções Realizadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.manutencoes.map((manutencao, index) => (
                  <motion.div
                    key={manutencao.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getTipoBadge(manutencao.tipo)}>
                          {manutencao.tipo}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {manutencao.equipamento.tag} - {manutencao.equipamento.nome}
                        </span>
                      </div>
                      <span className="font-bold text-red-600">
                        {formatCurrency(manutencao.custo || 0)}
                      </span>
                    </div>
                    <p className="text-sm">{manutencao.descricao}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(manutencao.dataRealizada, 'dd/MM/yyyy')}
                    </p>
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