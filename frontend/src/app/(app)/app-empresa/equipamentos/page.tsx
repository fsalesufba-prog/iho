'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Tag,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
import { useEmpresa } from '@/hooks/useEmpresa'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Equipamento {
  id: number
  tag: string
  nome: string
  tipo: string
  marca: string
  modelo: string
  anoFabricacao: number
  numeroSerie: string
  placa?: string
  horaAtual: number
  kmAtual?: number
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'inativo'
  obra?: {
    id: number
    nome: string
    codigo: string
  }
  frenteServico?: {
    id: number
    nome: string
  }
  centroCusto?: {
    id: number
    nome: string
    codigo: string
  }
  valorAquisicao?: number
  manutencoes: any[]
  createdAt: string
}

export default function EquipamentosPage() {
  const { user } = useAuth()
  const { empresa, plano } = useEmpresa()
  const { toast } = useToast()

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [obraFiltro, setObraFiltro] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEquipamento, setSelectedEquipamento] = useState<Equipamento | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    disponivel: 0,
    emUso: 0,
    manutencao: 0,
    inativo: 0,
    porTipo: [] as { tipo: string; quantidade: number }[],
    depreciacaoTotal: 0,
    valorTotal: 0
  })

  // Lista de obras para filtro
  const [obras, setObras] = useState<{ id: number; nome: string }[]>([])

  useEffect(() => {
    carregarEquipamentos()
    carregarStats()
    carregarObras()
  }, [page, statusFiltro, tipoFiltro, obraFiltro, searchTerm])

  const carregarEquipamentos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/equipamentos', {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
          status: statusFiltro !== 'todos' ? statusFiltro : undefined,
          tipo: tipoFiltro !== 'todos' ? tipoFiltro : undefined,
          obraId: obraFiltro !== 'todos' ? obraFiltro : undefined
        }
      })
      setEquipamentos(response.data.equipamentos)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar equipamentos',
        description: 'Não foi possível carregar a lista de equipamentos.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarStats = async () => {
    try {
      const response = await api.get('/equipamentos/stats')
      setStats(response.data.data)
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
    if (!selectedEquipamento) return

    try {
      setDeleting(true)
      await api.delete(`/equipamentos/${selectedEquipamento.id}`)
      
      toast({
        title: 'Equipamento excluído',
        description: 'O equipamento foi excluído com sucesso.'
      })

      carregarEquipamentos()
      carregarStats()
      setDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.response?.data?.error || 'Não foi possível excluir o equipamento.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setSelectedEquipamento(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      disponivel: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      em_uso: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      manutencao: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      inativo: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      disponivel: 'Disponível',
      em_uso: 'Em Uso',
      manutencao: 'Em Manutenção',
      inativo: 'Inativo'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'disponivel':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'em_uso':
        return <Activity className="h-4 w-4 text-blue-600" />
      case 'manutencao':
        return <Wrench className="h-4 w-4 text-yellow-600" />
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const podeAdicionarEquipamento = () => {
    if (!plano) return false
    if (user?.tipo !== 'adm_empresa' && user?.tipo !== 'controlador') return false

    return stats.total < plano.limiteEquipamentos
  }

  const tiposUnicos = [...new Set(equipamentos.map(e => e.tipo))]

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Equipamentos" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Equipamentos
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie todos os equipamentos da sua frota
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Link href="/app-empresa/equipamentos/novo">
                <Button 
                  className="group"
                  disabled={!podeAdicionarEquipamento()}
                  title={!podeAdicionarEquipamento() ? 'Limite de equipamentos atingido' : ''}
                >
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Novo Equipamento
                </Button>
              </Link>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-3xl font-bold mt-1">{stats.total}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Limite: {plano?.limiteEquipamentos || 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="group hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Disponíveis</p>
                      <p className="text-3xl font-bold mt-1">{stats.disponivel}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="group hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Em Uso</p>
                      <p className="text-3xl font-bold mt-1">{stats.emUso}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="group hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Em Manutenção</p>
                      <p className="text-3xl font-bold mt-1">{stats.manutencao}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Wrench className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por tag, nome ou série..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger className="w-[160px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {tiposUnicos.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={obraFiltro} onValueChange={setObraFiltro}>
                    <SelectTrigger className="w-[160px]">
                      <MapPin className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Obra" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      {obras.map(obra => (
                        <SelectItem key={obra.id} value={obra.id.toString()}>
                          {obra.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={carregarEquipamentos}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" onClick={() => window.open('/api/equipamentos/exportar/csv')}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Equipamentos */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Horímetro/KM</TableHead>
                    <TableHead>Próx. Manutenção</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                          </div>
                        </TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-8 w-20 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : equipamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Nenhum equipamento encontrado
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || statusFiltro !== 'todos' || tipoFiltro !== 'todos' || obraFiltro !== 'todos'
                              ? 'Tente ajustar os filtros'
                              : 'Comece cadastrando seu primeiro equipamento'}
                          </p>
                          {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && podeAdicionarEquipamento() && (
                            <Link href="/app-empresa/equipamentos/novo">
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Equipamento
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    equipamentos.map((equipamento, index) => (
                      <motion.tr
                        key={equipamento.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              {equipamento.tag}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {equipamento.nome} - {equipamento.marca} {equipamento.modelo}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Série: {equipamento.numeroSerie}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(equipamento.status)}
                            <Badge className={getStatusBadge(equipamento.status)}>
                              {getStatusLabel(equipamento.status)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {equipamento.obra ? (
                            <div>
                              <div className="text-sm font-medium">{equipamento.obra.nome}</div>
                              {equipamento.frenteServico && (
                                <div className="text-xs text-muted-foreground">
                                  {equipamento.frenteServico.nome}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Não alocado</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{equipamento.horaAtual.toLocaleString()} h</div>
                            {equipamento.kmAtual && (
                              <div className="text-xs text-muted-foreground">
                                {equipamento.kmAtual.toLocaleString()} km
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {equipamento.manutencoes && equipamento.manutencoes.length > 0 ? (
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-yellow-600" />
                              <span className="text-sm">
                                {formatDate(equipamento.manutencoes[0].dataProgramada, 'dd/MM/yyyy')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Não programada</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/app-empresa/equipamentos/${equipamento.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                              <>
                                <Link href={`/app-empresa/equipamentos/${equipamento.id}/edit`}>
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
                                      setSelectedEquipamento(equipamento)
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
            <DialogTitle>Excluir equipamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o equipamento {selectedEquipamento?.tag} - {selectedEquipamento?.nome}?
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
              {deleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}