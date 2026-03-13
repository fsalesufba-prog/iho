'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Wrench,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
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
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ManutencaoPreventiva {
  id: number
  equipamentoId: number
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
    horaAtual: number
    obra?: {
      nome: string
    }
  }
  itens: any[]
}

export default function ManutencaoPreventivaPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [manutencoes, setManutencoes] = useState<ManutencaoPreventiva[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [prioridadeFiltro, setPrioridadeFiltro] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedManutencao, setSelectedManutencao] = useState<ManutencaoPreventiva | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarManutencoes()
  }, [page, statusFiltro, prioridadeFiltro, searchTerm])

  const carregarManutencoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/manutencoes', {
        params: {
          page,
          limit: 10,
          tipo: 'preventiva',
          search: searchTerm || undefined,
          status: statusFiltro !== 'todos' ? statusFiltro : undefined,
          prioridade: prioridadeFiltro !== 'todos' ? prioridadeFiltro : undefined
        }
      })
      setManutencoes(response.data.manutencoes)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar manutenções',
        description: 'Não foi possível carregar a lista de manutenções preventivas.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedManutencao) return

    try {
      setDeleting(true)
      await api.delete(`/manutencoes/${selectedManutencao.id}`)
      
      toast({
        title: 'Manutenção excluída',
        description: 'A manutenção preventiva foi excluída com sucesso.'
      })

      carregarManutencoes()
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
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive'
      })
    }
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

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Manutenção Preventiva" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Manutenção Preventiva
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as manutenções preventivas programadas
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Link href="/app-empresa/manutencao/preventiva/nova">
                <Button className="group bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Nova Preventiva
                </Button>
              </Link>
            )}
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por equipamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="em_andamento">Em Andamento</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
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
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Data Programada</TableHead>
                    <TableHead>Horas Atuais</TableHead>
                    <TableHead>Custo</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-40 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-8 w-20 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : manutencoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Nenhuma manutenção preventiva encontrada
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || statusFiltro !== 'todos' || prioridadeFiltro !== 'todos'
                              ? 'Tente ajustar os filtros'
                              : 'Comece programando a primeira manutenção preventiva'}
                          </p>
                          {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                            <Link href="/app-empresa/manutencao/preventiva/nova">
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Preventiva
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    manutencoes.map((manutencao, index) => (
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
                          <span className="text-sm">{manutencao.equipamento.horaAtual} h</span>
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
            <DialogTitle>Excluir manutenção preventiva</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta manutenção preventiva?
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