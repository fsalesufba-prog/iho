'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Download,
  Eye,
  MoreHorizontal,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Target,
  Zap,
  Sparkles,
  Rocket,
  Globe,
  Shield,
  Lock,
  Building2,
  Users,
  Truck,
  Wrench,
  Package,
  DollarSign,
  FileText,
  Settings,
  LogOut,
  Bell,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Printer,
  Upload,
  Download as DownloadIcon,
  Share2,
  Heart,
  Star,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
  HelpCircle,
  Info,
  Warning,
  AlertCircle as AlertCircleIcon,
  XCircle,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart,
  LineChart,
  PieChart as PieChartIcon,
  AreaChart,
  Radar,
  RadarChart,
  ScatterChart,
  HeatMap,
  Gauge,
  GaugeChart,
  Progress,
  Metric,
  KPI,
  Widget,
  Card,
  Table,
  List,
  Grid,
  Timeline,
  Activity as ActivityIcon,
  Users as UsersIcon,
  Building,
  Home,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  Bell as BellIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Copy as CopyIcon,
  Printer as PrinterIcon,
  Upload as UploadIcon,
  Download as DownloadIconIcon,
  Share2 as Share2Icon,
  Heart as HeartIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  ThumbsUp as ThumbsUpIcon,
  MessageCircle as MessageCircleIcon,
  MessageSquare as MessageSquareIcon,
  HelpCircle as HelpCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  AlertCircle as AlertCircleIconIcon,
  XCircle as XCircleIcon,
  CheckCircle as CheckCircleIconIcon,
  Clock as ClockIconIcon,
  Calendar as CalendarIconIcon,
  TrendingUp as TrendingUpIconIcon,
  TrendingDown as TrendingDownIconIcon
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardData {
  resumo: {
    totalObras: number
    obrasAtivas: number
    totalEquipamentos: number
    equipamentosDisponiveis: number
    equipamentosEmUso: number
    equipamentosEmManutencao: number
    manutencoesPendentes: number
    manutencoesAtrasadas: number
    indicadores: {
      iho: number
      disponibilidade: number
      mtbf: number
      mttr: number
      oee: number
    }
    financeiro: {
      custoTotal: number
      custoManutencao: number
      custoCombustivel: number
      faturamento: number
    }
  }
  alertas: {
    criticos: number
    atencao: number
    info: number
  }
  topEquipamentos: Array<{
    id: number
    nome: string
    tag: string
    iho: number
    horas: number
    status: string
  }>
  atividadesRecentes: Array<{
    id: number
    descricao: string
    tipo: string
    data: string
    usuario: string
  }>
  proximasManutencoes: Array<{
    id: number
    equipamento: string
    tipo: string
    data: string
    prioridade: string
  }>
}

export default function EmpresaDashboardPage() {
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
      const response = await api.get('/empresa/dashboard', {
        params: { periodo }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard',
        variant: 'destructive'
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

  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)}h`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel':
        return 'bg-green-100 text-green-800'
      case 'em_uso':
        return 'bg-blue-100 text-blue-800'
      case 'manutencao':
        return 'bg-yellow-100 text-yellow-800'
      case 'inativo':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'critica':
        return <Badge variant="destructive">Crítica</Badge>
      case 'alta':
        return <Badge className="bg-orange-100 text-orange-800">Alta</Badge>
      case 'media':
        return <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>
      case 'baixa':
        return <Badge variant="secondary">Baixa</Badge>
      default:
        return <Badge variant="outline">{prioridade}</Badge>
    }
  }

  if (loading || !data) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
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

        {/* Alertas skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-4">
                <div className="h-4 w-16 bg-muted animate-pulse rounded mb-2" />
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
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
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user?.nome}! Acompanhe o desempenho da sua operação.
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

      {/* IHO Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Índice de Saúde Operacional (IHO)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative">
              <div className="h-40 w-40 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {data.resumo.indicadores.iho}%
                </span>
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Disponibilidade</p>
                <p className="text-2xl font-bold text-green-600">
                  {data.resumo.indicadores.disponibilidade}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">OEE</p>
                <p className="text-2xl font-bold text-blue-600">
                  {data.resumo.indicadores.oee}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">MTBF</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatHours(data.resumo.indicadores.mtbf)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">MTTR</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatHours(data.resumo.indicadores.mttr)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Obras Ativas</p>
                <p className="text-2xl font-bold">{data.resumo.obrasAtivas}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total: {data.resumo.totalObras} obras
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Equipamentos</p>
                <p className="text-2xl font-bold">{data.resumo.totalEquipamentos}</p>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className="text-green-600">{data.resumo.equipamentosDisponiveis} disponíveis</span>
              <span className="text-muted-foreground ml-2">
                {data.resumo.equipamentosEmUso} em uso
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Manutenções</p>
                <p className="text-2xl font-bold">{data.resumo.manutencoesPendentes}</p>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-red-600 mt-2">
              {data.resumo.manutencoesAtrasadas} atrasadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.resumo.financeiro.custoTotal)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Equipamentos</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Disponível</span>
                  <span className="font-medium">{data.resumo.equipamentosDisponiveis}</span>
                </div>
                <Progress 
                  value={(data.resumo.equipamentosDisponiveis / data.resumo.totalEquipamentos) * 100} 
                  className="h-2"
                  indicatorClassName="bg-green-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Em Uso</span>
                  <span className="font-medium">{data.resumo.equipamentosEmUso}</span>
                </div>
                <Progress 
                  value={(data.resumo.equipamentosEmUso / data.resumo.totalEquipamentos) * 100} 
                  className="h-2"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Em Manutenção</span>
                  <span className="font-medium">{data.resumo.equipamentosEmManutencao}</span>
                </div>
                <Progress 
                  value={(data.resumo.equipamentosEmManutencao / data.resumo.totalEquipamentos) * 100} 
                  className="h-2"
                  indicatorClassName="bg-yellow-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Composição de Custos</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Manutenção</span>
                  <span className="font-medium">
                    {formatCurrency(data.resumo.financeiro.custoManutencao)}
                  </span>
                </div>
                <Progress 
                  value={(data.resumo.financeiro.custoManutencao / data.resumo.financeiro.custoTotal) * 100} 
                  className="h-2"
                  indicatorClassName="bg-orange-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Combustível</span>
                  <span className="font-medium">
                    {formatCurrency(data.resumo.financeiro.custoCombustivel)}
                  </span>
                </div>
                <Progress 
                  value={(data.resumo.financeiro.custoCombustivel / data.resumo.financeiro.custoTotal) * 100} 
                  className="h-2"
                  indicatorClassName="bg-yellow-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Outros</span>
                  <span className="font-medium">
                    {formatCurrency(data.resumo.financeiro.custoTotal - 
                      data.resumo.financeiro.custoManutencao - 
                      data.resumo.financeiro.custoCombustivel)}
                  </span>
                </div>
                <Progress 
                  value={((data.resumo.financeiro.custoTotal - 
                    data.resumo.financeiro.custoManutencao - 
                    data.resumo.financeiro.custoCombustivel) / data.resumo.financeiro.custoTotal) * 100} 
                  className="h-2"
                  indicatorClassName="bg-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="equipamentos">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="equipamentos">Top Equipamentos</TabsTrigger>
          <TabsTrigger value="manutencoes">Próximas Manutenções</TabsTrigger>
          <TabsTrigger value="atividades">Atividades Recentes</TabsTrigger>
        </TabsList>

        <TabsContent value="equipamentos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos com Melhor IHO</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>IHO</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topEquipamentos.map((equip) => (
                    <TableRow key={equip.id}>
                      <TableCell className="font-medium">{equip.nome}</TableCell>
                      <TableCell className="font-mono text-xs">{equip.tag}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={equip.iho} className="h-2 w-16" />
                          <span className={cn(
                            "font-bold",
                            equip.iho >= 80 ? "text-green-600" :
                            equip.iho >= 60 ? "text-yellow-600" :
                            "text-red-600"
                          )}>
                            {equip.iho}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{equip.horas}h</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(equip.status)}>
                          {equip.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manutencoes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Próximas Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Prioridade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.proximasManutencoes.map((manutencao) => (
                    <TableRow key={manutencao.id}>
                      <TableCell className="font-medium">{manutencao.equipamento}</TableCell>
                      <TableCell className="capitalize">{manutencao.tipo}</TableCell>
                      <TableCell>
                        {format(new Date(manutencao.data), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{getPrioridadeBadge(manutencao.prioridade)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="atividades" className="mt-4">
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
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm">{atividade.descricao}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{atividade.usuario}</span>
                        <span>•</span>
                        <span>{format(new Date(atividade.data), "dd/MM/yyyy HH:mm")}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/app-empresa/obras/nova">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Building2 className="h-5 w-5" />
                <span>Nova Obra</span>
              </Button>
            </Link>

            <Link href="/app-empresa/equipamentos/novo">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Truck className="h-5 w-5" />
                <span>Novo Equipamento</span>
              </Button>
            </Link>

            <Link href="/app-empresa/manutencao/nova">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <Wrench className="h-5 w-5" />
                <span>Nova Manutenção</span>
              </Button>
            </Link>

            <Link href="/app-empresa/apontamentos/novo">
              <Button variant="outline" className="w-full h-20 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span>Novo Apontamento</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}