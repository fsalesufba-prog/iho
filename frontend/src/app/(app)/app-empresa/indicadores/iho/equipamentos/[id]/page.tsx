'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  Truck,
  Clock,
  DollarSign,
  CheckCircle2,
  Zap,
  Shield,
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
  status: string
}

interface IHOData {
  equipamento: Equipamento
  iho: {
    atual: number
    tendencia: number
    componentes: {
      disponibilidade: number
      performance: number
      qualidade: number
      custo: number
      seguranca: number
    }
  }
  historico: Array<{
    data: string
    valor: number
  }>
}

export default function IhoEquipamentoPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<IHOData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [params.id, periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/indicadores/iho/equipamentos/${params.id}`, {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar IHO',
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

  const getIHOColor = (valor: number) => {
    if (valor >= 90) return 'text-green-600'
    if (valor >= 75) return 'text-blue-600'
    if (valor >= 60) return 'text-yellow-600'
    if (valor >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getIHOBadge = (valor: number) => {
    if (valor >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (valor >= 75) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    if (valor >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    if (valor >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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
        <Header title={`IHO - ${data.equipamento.tag}`} />
        
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
                IHO - {data.equipamento.tag}
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

          {/* IHO Principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>IHO Atual</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className={`text-7xl font-bold mb-2 ${getIHOColor(data.iho.atual)}`}>
                  {data.iho.atual}
                </div>
                <Badge className={getIHOBadge(data.iho.atual)}>
                  {data.iho.atual >= 90 ? 'Ótimo' :
                   data.iho.atual >= 75 ? 'Bom' :
                   data.iho.atual >= 60 ? 'Regular' :
                   data.iho.atual >= 40 ? 'Ruim' : 'Péssimo'}
                </Badge>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <TrendingUp className={`h-4 w-4 ${
                    data.iho.tendencia > 0 ? 'text-green-600' :
                    data.iho.tendencia < 0 ? 'text-red-600' : 'text-gray-600'
                  }`} />
                  <span className="text-sm text-muted-foreground">
                    Tendência: {data.iho.tendencia > 0 ? '+' : ''}{data.iho.tendencia} pts
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Componentes do IHO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                    <div className="text-lg font-bold text-blue-600">
                      {data.iho.componentes.disponibilidade.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Disponibilidade</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                    <Zap className="h-5 w-5 mx-auto mb-1 text-green-600" />
                    <div className="text-lg font-bold text-green-600">
                      {data.iho.componentes.performance.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                    <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                    <div className="text-lg font-bold text-yellow-600">
                      {data.iho.componentes.qualidade.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Qualidade</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <DollarSign className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                    <div className="text-lg font-bold text-purple-600">
                      {data.iho.componentes.custo.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Custo</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
                    <Shield className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                    <div className="text-lg font-bold text-orange-600">
                      {data.iho.componentes.seguranca.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Segurança</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Histórico e Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do IHO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Gráfico de evolução do IHO</p>
                </div>
                <div className="mt-4 space-y-2">
                  {data.historico.slice(-7).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{formatDate(item.data, 'dd/MM')}</span>
                      <span className={`font-medium ${getIHOColor(item.valor)}`}>
                        {item.valor}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Equipamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tag</p>
                      <p className="font-mono">{data.equipamento.tag}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge>{data.equipamento.status}</Badge>
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
                  </div>

                  <div className="pt-4 border-t">
                    <Link href={`/app-empresa/equipamentos/${data.equipamento.id}`}>
                      <Button variant="outline" className="w-full">
                        Ver detalhes do equipamento
                      </Button>
                    </Link>
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