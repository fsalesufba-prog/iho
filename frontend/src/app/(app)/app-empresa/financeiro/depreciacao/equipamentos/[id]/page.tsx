'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, RefreshCw, Truck } from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import { useToast } from '@/components/ui/use-toast'
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Equipamento {
  id: number
  tag: string
  nome: string
  tipo: string
  marca: string
  modelo: string
  valorAquisicao: number
  dataAquisicao: string
  vidaUtilAnos: number
  valorResidual: number
}

interface DepreciacaoData {
  equipamento: Equipamento
  depreciacao: {
    anual: number
    mensal: number
    acumulada: number
    percentual: number
    valorAtual: number
    vidaUtilRestante: number
  }
  historico: Array<{
    ano: number
    valor: number
    depreciacaoAno: number
  }>
}

export default function DepreciacaoEquipamentoPage() {
  const params = useParams()
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const { toast } = useToast()

  const [data, setData] = useState<DepreciacaoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [params.id])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/financeiro/depreciacao/equipamentos/${params.id}`)
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar depreciação',
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
        <Header title={`Depreciação - ${data.equipamento.tag}`} />
        
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
                Depreciação - {data.equipamento.tag}
              </h1>
              <p className="text-muted-foreground mt-1">
                {data.equipamento.nome} - {data.equipamento.marca} {data.equipamento.modelo}
              </p>
            </div>

            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Cards Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Valor de Aquisição</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(data.equipamento.valorAquisicao)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Depreciação Acumulada</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {formatCurrency(data.depreciacao.acumulada)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Valor Atual</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(data.depreciacao.valorAtual)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">% Depreciado</p>
                <p className="text-2xl font-bold mt-1">{data.depreciacao.percentual.toFixed(1)}%</p>
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
                  <p className="text-sm text-muted-foreground">Data Aquisição</p>
                  <p>{formatDate(data.equipamento.dataAquisicao, 'dd/MM/yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vida Útil</p>
                  <p>{data.equipamento.vidaUtilAnos} anos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes da Depreciação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Depreciação Anual</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(data.depreciacao.anual)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Depreciação Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(data.depreciacao.mensal)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vida Útil Restante</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">
                  {data.depreciacao.vidaUtilRestante.toFixed(1)} anos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Depreciação */}
          <Card>
            <CardHeader>
              <CardTitle>Projeção de Depreciação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.historico.map((item, index) => (
                  <motion.div
                    key={item.ano}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <span className="font-medium">{item.ano}</span>
                    <div className="flex gap-4">
                      <span className="text-muted-foreground">
                        Depreciação: {formatCurrency(item.depreciacaoAno)}
                      </span>
                      <span className="font-bold">
                        Valor: {formatCurrency(item.valor)}
                      </span>
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