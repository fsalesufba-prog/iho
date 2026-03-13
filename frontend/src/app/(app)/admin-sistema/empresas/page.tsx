'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  MapPin,
  FileText,
  Settings,
  LogOut,
  Bell,
  Star,
  TrendingUp,
  TrendingDown,
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
  Copy,
  Printer,
  Upload,
  Download as DownloadIcon,
  Share2,
  Heart,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
  HelpCircle,
  Info,
  Warning,
  AlertCircle,
  XCircle as XCircleIcon,
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
  AlertCircle as AlertCircleIcon,
  XCircle as XCircleIconIcon,
  CheckCircle as CheckCircleIconIcon,
  Clock as ClockIconIcon,
  Calendar as CalendarIconIcon,
  TrendingUp as TrendingUpIconIcon,
  TrendingDown as TrendingDownIconIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIconIcon,
  AreaChart as AreaChartIcon,
  Radar as RadarIcon,
  RadarChart as RadarChartIcon,
  ScatterChart as ScatterChartIcon,
  HeatMap as HeatMapIcon,
  Gauge as GaugeIcon,
  GaugeChart as GaugeChartIcon,
  Progress as ProgressIcon,
  Metric as MetricIcon,
  KPI as KPIIcon,
  Widget as WidgetIcon,
  Card as CardIcon,
  Table as TableIcon,
  List as ListIcon,
  Grid as GridIcon,
  Timeline as TimelineIcon,
  Activity as ActivityIconIcon
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Empresa {
  id: number
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  plano: {
    id: number
    nome: string
  }
  status: 'ativo' | 'inativo' | 'atrasado' | 'cancelado' | 'pendente'
  diasAtraso: number
  usuariosCount: number
  equipamentosCount: number
  obrasCount: number
  dataCadastro: string
  dataAtivacao?: string
  nextBillingAt?: string
  implantacaoPaga: boolean
}

export default function EmpresasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [plano, setPlano] = useState('todos')
  const [planos, setPlanos] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    carregarPlanos()
    carregarEmpresas()
  }, [page, status, plano, search])

  const carregarPlanos = async () => {
    try {
      const response = await api.get('/planos', { params: { limit: 100 } })
      setPlanos(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    }
  }

  const carregarEmpresas = async () => {
    try {
      setLoading(true)
      const response = await api.get('/empresas', {
        params: {
          page,
          limit: 10,
          status: status !== 'todos' ? status : undefined,
          planoId: plano !== 'todos' ? plano : undefined,
          search: search || undefined
        }
      })
      setEmpresas(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as empresas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarEmpresas()
  }

  const handleDelete = async () => {
    if (!selectedEmpresa) return

    try {
      await api.delete(`/empresas/${selectedEmpresa.id}`)
      toast({
        title: 'Sucesso',
        description: 'Empresa excluída com sucesso'
      })
      setShowDeleteDialog(false)
      setSelectedEmpresa(null)
      carregarEmpresas()
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a empresa',
        variant: 'destructive'
      })
    }
  }

  const handleStatusChange = async (id: number, novoStatus: string) => {
    try {
      await api.patch(`/empresas/${id}/status`, { status: novoStatus })
      toast({
        title: 'Sucesso',
        description: `Status alterado para ${novoStatus}`
      })
      carregarEmpresas()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (empresa: Empresa) => {
    switch (empresa.status) {
      case 'ativo':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        )
      case 'inativo':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inativo
          </Badge>
        )
      case 'atrasado':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {empresa.diasAtraso} dias atrasado
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        )
      case 'pendente':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      default:
        return <Badge variant="outline">{empresa.status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
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
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">
              Gerencie todas as empresas do sistema
            </p>
          </div>
        </div>

        <Link href="/admin-sistema/empresas/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CNPJ ou e-mail..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Buscar
              </Button>
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="atrasado">Em atraso</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={plano} onValueChange={setPlano}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os planos</SelectItem>
                {planos.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarEmpresas}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Equip.</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : empresas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  empresas.map((empresa) => (
                    <TableRow
                      key={empresa.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin-sistema/empresas/${empresa.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(empresa.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{empresa.nome}</p>
                            <p className="text-xs text-muted-foreground">{empresa.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{empresa.cnpj}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{empresa.telefone}</p>
                          <p className="text-xs text-muted-foreground">
                            {empresa.cidade}/{empresa.estado}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{empresa.plano.nome}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(empresa)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{empresa.usuariosCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{empresa.equipamentosCount}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(empresa.dataCadastro)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin-sistema/empresas/${empresa.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin-sistema/empresas/${empresa.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(empresa.id, 'ativo')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Ativar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(empresa.id, 'inativo')}>
                              <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                              Inativar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(empresa.id, 'cancelado')}>
                              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                              Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedEmpresa(empresa)
                                setShowDeleteDialog(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a empresa "{selectedEmpresa?.nome}"?
              Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}