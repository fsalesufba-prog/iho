'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Download,
  RefreshCw,
  DollarSign,
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

interface CentroCustoData {
  centroCusto: {
    id: number
    nome: string
    codigo: string
    empresaId: number
  }
  iho: number
  totalEquipamentos: number
}

export default function IhoCentroCustoPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<CentroCustoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [params.id, periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/indicadores/iho/centros-custo/${params.id}`, {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar IHO',
        description: 'Não foi possível carregar os dados do centro de custo.',
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
          <Header title="Centro de Custo não encontrado" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Centro de Custo não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O centro de custo que você está procurando não existe.
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
        <Header title={`IHO - ${data.centroCusto.nome}`} />
        
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
                IHO - {data.centroCusto.nome}
              </h1>
              <p className="text-muted-foreground mt-1">
                {data.centroCusto.codigo}
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

          {/* IHO do Centro de Custo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>IHO do Centro de Custo</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className={`text-7xl font-bold mb-2 ${getIHOColor(data.iho)}`}>
                  {data.iho.toFixed(1)}
                </div>
                <Badge variant="outline" className="mt-2">
                  {data.totalEquipamentos} equipamentos
                </Badge>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Informações do Centro de Custo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código:</span>
                    <span className="font-medium">{data.centroCusto.codigo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total de Equipamentos:</span>
                    <span className="font-medium">{data.totalEquipamentos}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </>
  )
}