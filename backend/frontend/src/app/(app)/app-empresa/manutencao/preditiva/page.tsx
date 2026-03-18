'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
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
  TrendingUp,
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

interface ManutencaoPreditiva {
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
  confiabilidade: number
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

export default function ManutencaoPreditivaPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [manutencoes, setManutencoes] = useState<ManutencaoPreditiva[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [confiabilidadeFiltro] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedManutencao, setSelectedManutencao] = useState<ManutencaoPreditiva | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarManutencoes()
  }, [page, statusFiltro, confiabilidadeFiltro, searchTerm])

  const carregarManutencoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/manutencoes', {
        params: {
          page,
          limit: 10,
          tipo: 'preditiva',
          search: searchTerm || undefined,
          status: statusFiltro !== 'todos' ? statusFiltro : undefined
        }
      })
      setManutencoes(response.data.manutencoes)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar manutenções',
        description: 'Não foi possível carregar a lista de manutenções preditivas.',
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
        description: 'A manutenção preditiva foi excluída com sucesso.'
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

  const getStatusBadge = (status: string) => {
    const variants = {
      programada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      em_andamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      concluida: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelada: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  const getConfiabilidadeBadge = (confiabilidade: number) => {
    if (confiabilidade >= 80) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    } else if (confiabilidade >= 60) {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    } else {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
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
        <Header title="Manutenção Preditiva" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Manutenção Preditiva
              </h1>
              <p className="text-muted-foreground mt-1">
                Acompanhe as análises preditivas e recomendações
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Link href="/app-empresa/manutencao/preditiva/nova">
                <Button className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Nova Análise
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
                    <TableHead>Confiabilidade</TableHead>
                    <TableHead>Data Prevista</TableHead>
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
                          <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Nenhuma análise preditiva encontrada
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || statusFiltro !== 'todos'
                              ? 'Tente ajustar os filtros'
                              : 'As análises preditivas aparecerão aqui'}
                          </p>
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
                          <Badge className={getConfiabilidadeBadge(manutencao.confiabilidade)}>
                            {manutencao.confiabilidade}%
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
            <DialogTitle>Excluir análise preditiva</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta análise preditiva?
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