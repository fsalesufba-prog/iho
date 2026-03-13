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
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
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
  Star,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
  HelpCircle,
  Info,
  AlertCircle,
  XCircle as XCircleIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Users as UsersIcon,
  Building,
  Home,
  Settings,
  LogOut,
  Bell,
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
  AlertCircle as AlertCircleIcon,
  XCircle as XCircleIconIcon,
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
import { Input } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
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
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Obra {
  id: number
  nome: string
  codigo: string
  cnpj: string
  endereco: string
  cidade: string
  estado: string
  status: 'ativa' | 'paralisada' | 'concluida' | 'cancelada'
  progresso: number
  dataInicio?: string
  dataPrevisaoTermino?: string
  dataTermino?: string
  valor?: number
  frentesCount: number
  equipamentosCount: number
  createdAt: string
}

export default function ObrasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [obras, setObras] = useState<Obra[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todas')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    ativas: 0,
    paralisadas: 0,
    concluidas: 0,
    canceladas: 0,
    valorTotal: 0
  })

  useEffect(() => {
    carregarObras()
    carregarStats()
  }, [page, status, search])

  const carregarObras = async () => {
    try {
      setLoading(true)
      const response = await api.get('/obras', {
        params: {
          empresaId: user?.empresaId,
          page,
          limit: 10,
          status: status !== 'todas' ? status : undefined,
          search: search || undefined
        }
      })
      setObras(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as obras',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarStats = async () => {
    try {
      const response = await api.get('/obras/stats', {
        params: { empresaId: user?.empresaId }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarObras()
  }

  const handleDelete = async () => {
    if (!selectedObra) return

    try {
      await api.delete(`/obras/${selectedObra.id}`)
      toast({
        title: 'Sucesso',
        description: 'Obra excluída com sucesso'
      })
      setShowDeleteDialog(false)
      setSelectedObra(null)
      carregarObras()
      carregarStats()
    } catch (error) {
      console.error('Erro ao excluir obra:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a obra',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativa
          </Badge>
        )
      case 'paralisada':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Paralisada
          </Badge>
        )
      case 'concluida':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      case 'cancelada':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
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
            <h1 className="text-3xl font-bold">Obras</h1>
            <p className="text-muted-foreground">
              Gerencie todas as obras da sua empresa
            </p>
          </div>
        </div>

        <Link href="/app-empresa/obras/nova">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Obra
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Obras</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Obras Ativas</p>
                <p className="text-2xl font-bold text-green-600">{stats.ativas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paralisadas</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.paralisadas}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.valorTotal)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código..."
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
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="paralisada">Paralisada</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarObras}>
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
                  <TableHead>Obra</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : obras.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma obra encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  obras.map((obra) => (
                    <TableRow
                      key={obra.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/app-empresa/obras/${obra.id}`)}
                    >
                      <TableCell className="font-medium">{obra.nome}</TableCell>
                      <TableCell className="font-mono text-xs">{obra.codigo}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{obra.cidade}/{obra.estado}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(obra.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={obra.progresso} className="h-2 w-20" />
                          <span className="text-xs">{obra.progresso}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>Início: {formatDate(obra.dataInicio)}</p>
                          <p className="text-xs text-muted-foreground">
                            Término: {formatDate(obra.dataPrevisaoTermino)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(obra.valor)}
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
                              onClick={() => router.push(`/app-empresa/obras/${obra.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/app-empresa/obras/${obra.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedObra(obra)
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
              Tem certeza que deseja excluir a obra "{selectedObra?.nome}"?
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