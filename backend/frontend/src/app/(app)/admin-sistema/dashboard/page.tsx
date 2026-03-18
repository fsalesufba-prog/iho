'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Building2,
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Download,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Activity,
  FileText,
  Info,
  AlertCircle,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'

import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface DashboardData {
  resumo: {
    totalEmpresas: number
    empresasAtivas: number
    empresasInativas: number
    empresasAtrasadas: number
    totalUsuarios: number
    usuariosAtivos: number
    totalPlanos: number
    faturamentoMes: number
    faturamentoAno: number
    ticketMedio: number
    crescimento: number
    inadimplencia: number
  }
  distribuicaoPlanos: Array<{
    nome: string
    total: number
    percentual: number
    cor: string
  }>
  empresasRecentes: Array<{
    id: number
    nome: string
    cnpj: string
    plano: string
    status: string
    dataCadastro: string
  }>
  atividadesRecentes: Array<{
    id: number
    usuario: string
    acao: string
    entidade: string
    data: string
    tipo: 'info' | 'success' | 'warning' | 'error'
  }>
  alertas: {
    criticos: number
    atencao: number
    info: number
  }
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')

  useEffect(() => {
    carregarDashboard()
  }, [periodo])

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/dashboard', {
        params: { periodo }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>
      case 'atrasado':
        return <Badge variant="destructive">Atrasado</Badge>
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
            <div>
              <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-64 bg-muted animate-pulse rounded" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
                <div className="h-2 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table skeleton */}
        <Card>
          <CardHeader>
            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="h-10 w-64 bg-muted animate-pulse rounded" />
                <div className="h-10 w-32 bg-muted animate-pulse rounded" />
              </div>
              <div className="border rounded-lg">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border-b">
                    <div className="grid grid-cols-5 gap-4">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="h-4 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo de volta, {user?.nome}! Aqui está o resumo do sistema.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={carregarDashboard}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={data.alertas.criticos > 0 ? 'border-red-500' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{data.alertas.criticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atenção</p>
                <p className="text-2xl font-bold text-yellow-600">{data.alertas.atencao}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Informativos</p>
                <p className="text-2xl font-bold text-blue-600">{data.alertas.info}</p>
              </div>
              <Info className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Empresas</p>
                <p className="text-2xl font-bold">{data.resumo.totalEmpresas}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600">{data.resumo.empresasAtivas} ativas</span>
              <span className="text-muted-foreground ml-2">
                {data.resumo.empresasInativas} inativas
              </span>
            </div>
            <Progress 
              value={(data.resumo.empresasAtivas / data.resumo.totalEmpresas) * 100} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-2xl font-bold">{data.resumo.totalUsuarios}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600">{data.resumo.usuariosAtivos} ativos</span>
            </div>
            <Progress 
              value={(data.resumo.usuariosAtivos / data.resumo.totalUsuarios) * 100} 
              className="h-1 mt-2"
            />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Mensal</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.resumo.faturamentoMes)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              {data.resumo.crescimento >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                  <span className="text-green-600">+{data.resumo.crescimento}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                  <span className="text-red-600">{data.resumo.crescimento}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-2">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inadimplência</p>
                <p className="text-2xl font-bold text-red-600">{data.resumo.inadimplencia}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <Progress 
              value={data.resumo.inadimplencia} 
              className="h-1 mt-2"
              indicatorClassName="bg-red-500"
            />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Planos</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="space-y-4">
              {data.distribuicaoPlanos.map((plano, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{plano.nome}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {plano.total} empresas
                      </span>
                      <span className="text-xs font-medium">{plano.percentual}%</span>
                    </div>
                  </div>
                  <Progress 
                    value={plano.percentual} 
                    className="h-2"
                    indicatorClassName={plano.cor}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Faturamento Anual</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(data.resumo.faturamentoAno)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Total acumulado no ano
              </p>
            </div>
            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ticket Médio</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(data.resumo.ticketMedio)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total de Planos</span>
                <span className="font-bold">{data.resumo.totalPlanos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Empresas em Atraso</span>
                <span className="font-bold text-red-600">
                  {data.resumo.empresasAtrasadas}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="empresas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="empresas">Empresas Recentes</TabsTrigger>
          <TabsTrigger value="atividades">Atividades Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="empresas" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Empresas Recentes</CardTitle>
                <Link href="/admin-sistema/empresas">
                  <Button variant="ghost" size="sm">
                    Ver todas
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.empresasRecentes.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell className="font-medium">{empresa.nome}</TableCell>
                      <TableCell>{empresa.cnpj}</TableCell>
                      <TableCell>{empresa.plano}</TableCell>
                      <TableCell>{getStatusBadge(empresa.status)}</TableCell>
                      <TableCell>{empresa.dataCadastro}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atividades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.atividadesRecentes.map((atividade) => (
                  <div
                    key={atividade.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center",
                      atividade.tipo === 'success' && "bg-green-100 text-green-600",
                      atividade.tipo === 'warning' && "bg-yellow-100 text-yellow-600",
                      atividade.tipo === 'error' && "bg-red-100 text-red-600",
                      atividade.tipo === 'info' && "bg-blue-100 text-blue-600"
                    )}>
                      {atividade.tipo === 'success' && <CheckCircle className="h-4 w-4" />}
                      {atividade.tipo === 'warning' && <AlertTriangle className="h-4 w-4" />}
                      {atividade.tipo === 'error' && <XCircle className="h-4 w-4" />}
                      {atividade.tipo === 'info' && <Info className="h-4 w-4" />}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{atividade.usuario}</span>
                        {' '}{atividade.acao}{' '}
                        <span className="text-muted-foreground">{atividade.entidade}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {atividade.data}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin-sistema/empresas/nova">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Building2 className="h-5 w-5" />
                <span>Nova Empresa</span>
              </Button>
            </Link>

            <Link href="/admin-sistema/usuarios/novo">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>Novo Usuário</span>
              </Button>
            </Link>

            <Link href="/admin-sistema/planos/novo">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <CreditCard className="h-5 w-5" />
                <span>Novo Plano</span>
              </Button>
            </Link>

            <Link href="/admin-sistema/blog/novo">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span>Novo Post</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}