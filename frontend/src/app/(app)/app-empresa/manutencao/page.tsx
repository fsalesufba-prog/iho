'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Wrench,
<<<<<<< HEAD
=======
  Play,
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Activity,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Manutencao {
  id: number
  tipo: 'preventiva' | 'corretiva' | 'preditiva'
  dataProgramada: string
  dataRealizada?: string
  descricao: string
  observacoes?: string
  horasEquipamento: number
  custo?: number
  status: 'programada' | 'em_andamento' | 'concluida' | 'cancelada'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  equipamento: {
    id: number
    tag: string
    nome: string
    modelo: string
    obra?: {
      nome: string
    }
  }
  itens: any[]
}

export default function ManutencaoPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [manutencoes, setManutencoes] = useState<Manutencao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
<<<<<<< HEAD
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
=======
  const [statusFiltro] = useState<string>('todos')
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedManutencao, setSelectedManutencao] = useState<Manutencao | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('todas')

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    programadas: 0,
    emAndamento: 0,
    concluidas: 0,
    canceladas: 0,
    preventivas: 0,
    corretivas: 0,
    preditivas: 0,
    custoTotal: 0,
    porPrioridade: []
  })

  useEffect(() => {
    carregarManutencoes()
    carregarStats()
  }, [page, tipoFiltro, statusFiltro, prioridadeFiltro, activeTab])

  const carregarManutencoes = async () => {
    try {
      setLoading(true)
      
      let status = statusFiltro
      if (activeTab !== 'todas') {
        status = activeTab
      }

      const response = await api.get('/manutencoes', {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
          tipo: tipoFiltro !== 'todos' ? tipoFiltro : undefined,
          status: status !== 'todos' ? status : undefined,
          prioridade: prioridadeFiltro !== 'todos' ? prioridadeFiltro : undefined
        }
      })
      setManutencoes(response.data.manutencoes)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar manutenções',
        description: 'Não foi possível carregar a lista de manutenções.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarStats = async () => {
    try {
      const response = await api.get('/manutencoes/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedManutencao) return

    try {
      setDeleting(true)
      await api.delete(`/manutencoes/${selectedManutencao.id}`)
      
      toast({
        title: 'Manutenção excluída',
        description: 'A manutenção foi excluída com sucesso.'
      })

      carregarManutencoes()
      carregarStats()
      setDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a manutenção.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setSelectedManutencao(null)
    }
  }

  const handleStatusChange = async (id: number, novoStatus: string) => {
    try {
      await api.patch(`/manutencoes/${id}/status`, { status: novoStatus })
      
      toast({
        title: 'Status atualizado',
        description: `Status alterado para ${novoStatus}.`
      })

      carregarManutencoes()
      carregarStats()
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive'
      })
    }
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      preventiva: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      corretiva: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      preditiva: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    }
    return variants[tipo as keyof typeof variants] || ''
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      programada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      em_andamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      concluida: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelada: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  const getPrioridadeBadge = (prioridade: string) => {
    const variants = {
      baixa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      critica: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 animate-pulse'
    }
    return variants[prioridade as keyof typeof variants] || ''
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'cancelada':
        return <XCircle className="h-4 w-4 text-gray-600" />
      case 'em_andamento':
        return <Activity className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const manutencoesFiltradas = manutencoes.filter(m => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        m.equipamento.tag.toLowerCase().includes(term) ||
        m.equipamento.nome.toLowerCase().includes(term) ||
        m.descricao.toLowerCase().includes(term)
      )
    }
    return true
  })

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Manutenção" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Manutenção
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie todas as manutenções dos equipamentos
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <div className="flex gap-2">
                <Link href="/app-empresa/manutencao/preventiva/nova">
                  <Button variant="outline" className="group">
                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                    Preventiva
                  </Button>
                </Link>
                <Link href="/app-empresa/manutencao/corretiva/nova">
                  <Button variant="outline" className="group">
                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                    Corretiva
                  </Button>
                </Link>
                <Link href="/app-empresa/manutencao/preditiva/nova">
                  <Button className="group">
                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                    Nova Manutenção
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Wrench className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Programadas</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.programadas}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-yellow-600/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Em Andamento</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.emAndamento}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Custo Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.custoTotal)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="programada">Programadas</TabsTrigger>
              <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
              <TabsTrigger value="concluida">Concluídas</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por equipamento ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="preventiva">Preventiva</SelectItem>
                      <SelectItem value="corretiva">Corretiva</SelectItem>
                      <SelectItem value="preditiva">Preditiva</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={prioridadeFiltro} onValueChange={setPrioridadeFiltro}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={carregarManutencoes}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  <Link href="/app-empresa/manutencao/calendario">
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Calendário
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Manutenções */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data Prog.</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-40 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-8 w-20 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : manutencoesFiltradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Nenhuma manutenção encontrada
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || tipoFiltro !== 'todos' || statusFiltro !== 'todos' || prioridadeFiltro !== 'todos'
                              ? 'Tente ajustar os filtros'
                              : 'Comece registrando a primeira manutenção'}
                          </p>
                          {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                            <Link href="/app-empresa/manutencao/preditiva/nova">
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Manutenção
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    manutencoesFiltradas.map((manutencao, index) => (
                      <motion.tr
                        key={manutencao.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium">{manutencao.equipamento.tag}</div>
                            <div className="text-sm text-muted-foreground">
                              {manutencao.equipamento.nome}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTipoBadge(manutencao.tipo)}>
                            {manutencao.tipo.charAt(0).toUpperCase() + manutencao.tipo.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm line-clamp-2">{manutencao.descricao}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(manutencao.status)}
                            <Badge className={getStatusBadge(manutencao.status)}>
                              {manutencao.status === 'em_andamento' ? 'Em Andamento' : 
                               manutencao.status.charAt(0).toUpperCase() + manutencao.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPrioridadeBadge(manutencao.prioridade)}>
                            {manutencao.prioridade.charAt(0).toUpperCase() + manutencao.prioridade.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(manutencao.dataProgramada, 'dd/MM/yyyy')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{manutencao.horasEquipamento} h</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {manutencao.custo ? formatCurrency(manutencao.custo) : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/app-empresa/manutencao/${manutencao.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                              <>
                                <Link href={`/app-empresa/manutencao/${manutencao.id}/edit`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>

                                {manutencao.status === 'programada' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600"
                                    onClick={() => handleStatusChange(manutencao.id, 'em_andamento')}
                                    title="Iniciar"
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                )}

                                {manutencao.status === 'em_andamento' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600"
                                    onClick={() => handleStatusChange(manutencao.id, 'concluida')}
                                    title="Concluir"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}

                                {user?.tipo === 'adm_empresa' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setSelectedManutencao(manutencao)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </Container>
      </main>

      {/* Modal de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir manutenção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta manutenção?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}