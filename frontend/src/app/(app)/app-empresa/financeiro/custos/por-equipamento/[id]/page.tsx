'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Calendar, RefreshCw, Truck } from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

interface Equipamento {
  id: number
  tag: string
  nome: string
  tipo: string
  marca: string
  modelo: string
}

interface CustosData {
  equipamento: Equipamento
  total: number
  manutencao: number
  combustivel: number
  porHora: number
  horasTrabalhadas: number
  historico: Array<{
    data: string
    valor: number
    tipo: string
    descricao: string
  }>
}

export default function CustosEquipamentoPage() {
  const params = useParams()
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const { toast } = useToast()

  const [data, setData] = useState<CustosData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [params.id, periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/financeiro/custos/por-equipamento/${params.id}`, {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar custos',
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
              <Truck className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Equipamento não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O equipamento que você está procurando não existe.
              </p>
              <Link href="/app-empresa/financeiro/custos">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Custos
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
        <Header title={`Custos - ${data.equipamento.tag}`} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/financeiro/custos"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Custos
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Custos - {data.equipamento.tag}
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
            </div>
          </div>

          {/* Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(data.total)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Manutenção</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {formatCurrency(data.manutencao)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Combustível</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {formatCurrency(data.combustivel)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Custo por Hora</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {formatCurrency(data.porHora)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.horasTrabalhadas} horas
                </p>
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
              </div>
            </CardContent>
          </Card>

          {/* Gráfico */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Evolução dos Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de evolução de custos</p>
              </div>
            </CardContent>
          </Card>

          {/* Histórico */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.historico.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-lg border"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge className="mb-2">{item.tipo}</Badge>
                        <p className="font-medium">{item.descricao}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-red-600">
                        {formatCurrency(item.valor)}
                      </p>
                    </div>
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