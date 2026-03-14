'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Filter,
<<<<<<< HEAD
  Download,
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FileSpreadsheet,
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

interface Medicao {
  id: number
  titulo: string
  obra: {
    id: number
    nome: string
    codigo: string
  }
  periodoInicio: string
  periodoFim: string
  valorTotal: number
  horasTotal: number
  status: 'rascunho' | 'emitida' | 'aprovada' | 'cancelada'
  dataEmissao?: string
  dataAprovacao?: string
  createdBy: {
    id: number
    nome: string
  }
  createdAt: string
  equipamentos: any[]
}

export default function MedicaoPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [medicoes, setMedicoes] = useState<Medicao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [obraFiltro, setObraFiltro] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedMedicao, setSelectedMedicao] = useState<Medicao | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    rascunho: 0,
    emitida: 0,
    aprovada: 0,
    cancelada: 0,
    valorTotal: 0
  })

  // Lista de obras para filtro
  const [obras, setObras] = useState<{ id: number; nome: string }[]>([])

  useEffect(() => {
    carregarMedicoes()
    carregarStats()
    carregarObras()
  }, [page, statusFiltro, obraFiltro, searchTerm])

  const carregarMedicoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/medicao', {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
          status: statusFiltro !== 'todos' ? statusFiltro : undefined,
          obraId: obraFiltro !== 'todos' ? obraFiltro : undefined
        }
      })
      setMedicoes(response.data.medicoes)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar medições',
        description: 'Não foi possível carregar a lista de medições.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarStats = async () => {
    try {
      const response = await api.get('/medicao/stats')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { limit: 100 }
      })
      setObras(response.data.obras)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedMedicao) return

    try {
      setDeleting(true)
      await api.delete(`/medicao/${selectedMedicao.id}`)
      
      toast({
        title: 'Medição excluída',
        description: 'A medição foi excluída com sucesso.'
      })

      carregarMedicoes()
      carregarStats()
      setDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.response?.data?.error || 'Não foi possível excluir a medição.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setSelectedMedicao(null)
    }
  }

  const handleEmitir = async (id: number) => {
    try {
      const response = await api.post(`/medicao/${id}/emitir`, {}, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `medicao-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast({
        title: 'Medição emitida',
        description: 'O PDF foi gerado com sucesso.'
      })

      carregarMedicoes()
    } catch (error) {
      toast({
        title: 'Erro ao emitir',
        description: 'Não foi possível gerar o PDF da medição.',
        variant: 'destructive'
      })
    }
  }

  const handleDownload = async (id: number, formato: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/medicao/${id}/download`, {
        params: { formato },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `medicao-${id}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast({
        title: 'Erro ao baixar',
        description: 'Não foi possível baixar o arquivo.',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      rascunho: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      emitida: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      aprovada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelada':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'emitida':
        return <FileText className="h-4 w-4 text-blue-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Medição" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Medição
              </h1>
              <p className="text-muted-foreground mt-1">
                Gere e gerencie medições de serviços
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Link href="/app-empresa/medicao/emitir">
                <Button className="group">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Nova Medição
                </Button>
              </Link>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rascunho</p>
                    <p className="text-2xl font-bold text-gray-600">{stats.rascunho}</p>
                  </div>
                  <Clock className="h-8 w-8 text-gray-600/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Emitidas</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.emitida}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Aprovadas</p>
                    <p className="text-2xl font-bold text-green-600">{stats.aprovada}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.valorTotal)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título ou obra..."
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
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="emitida">Emitida</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={obraFiltro} onValueChange={setObraFiltro}>
                    <SelectTrigger className="w-[200px]">
                      <Building2 className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Obra" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas as obras</SelectItem>
                      {obras.map(obra => (
                        <SelectItem key={obra.id} value={obra.id.toString()}>
                          {obra.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={carregarMedicoes}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Medições */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Obra</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-28 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-8 w-32 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : medicoes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Nenhuma medição encontrada
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || statusFiltro !== 'todos' || obraFiltro !== 'todos'
                              ? 'Tente ajustar os filtros'
                              : 'Comece criando sua primeira medição'}
                          </p>
                          {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                            <Link href="/app-empresa/medicao/emitir">
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Nova Medição
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    medicoes.map((medicao, index) => (
                      <motion.tr
                        key={medicao.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="font-medium">{medicao.titulo}</div>
                          <div className="text-xs text-muted-foreground">
                            #{medicao.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{medicao.obra.nome}</div>
                            <div className="text-xs text-muted-foreground">
                              {medicao.obra.codigo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(medicao.periodoInicio, 'dd/MM/yyyy')}</div>
                            <div className="text-xs text-muted-foreground">
                              até {formatDate(medicao.periodoFim, 'dd/MM/yyyy')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {medicao.horasTotal} h
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-bold text-primary">
                            {formatCurrency(medicao.valorTotal)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(medicao.status)}
                            <Badge className={getStatusBadge(medicao.status)}>
                              {medicao.status.charAt(0).toUpperCase() + medicao.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{medicao.createdBy.nome}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownload(medicao.id, 'pdf')}
                              title="Download PDF"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleDownload(medicao.id, 'excel')}
                              title="Download Excel"
                            >
                              <FileSpreadsheet className="h-4 w-4" />
                            </Button>

                            <Link href={`/app-empresa/medicao/historico/${medicao.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {medicao.status === 'rascunho' && (
                              <>
                                <Link href={`/app-empresa/medicao/emitir?id=${medicao.id}`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600"
                                  onClick={() => handleEmitir(medicao.id)}
                                  title="Emitir"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>

                                {user?.tipo === 'adm_empresa' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setSelectedMedicao(medicao)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}

                            {medicao.status === 'emitida' && user?.tipo === 'adm_empresa' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                                onClick={() => {
                                  // Abrir modal de aprovação
                                }}
                                title="Aprovar"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
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
            <DialogTitle>Excluir medição</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a medição "{selectedMedicao?.titulo}"?
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