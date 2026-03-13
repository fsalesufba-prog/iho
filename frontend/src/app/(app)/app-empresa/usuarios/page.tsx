'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserCog,
  UserCheck,
  Mail,
  Calendar,
  Shield,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'

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

interface Usuario {
  id: number
  nome: string
  email: string
  tipo: 'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'
  ativo: boolean
  ultimoAcesso: string | null
  createdAt: string
  avatar?: string
  telefone?: string
}

export default function UsuariosPage() {
  const { user } = useAuth()
  const { empresa, plano } = useEmpresa()
  const { toast } = useToast()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    admEmpresa: 0,
    controladores: 0,
    apontadores: 0,
    ativos: 0,
    inativos: 0
  })

  useEffect(() => {
    carregarUsuarios()
    carregarStats()
  }, [page, tipoFiltro, statusFiltro, searchTerm])

  const carregarUsuarios = async () => {
    try {
      setLoading(true)
      const response = await api.get('/usuarios', {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
          tipo: tipoFiltro !== 'todos' ? tipoFiltro : undefined,
          status: statusFiltro !== 'todos' ? statusFiltro : undefined
        }
      })
      setUsuarios(response.data.usuarios)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarStats = async () => {
    try {
      const response = await api.get('/usuarios/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedUsuario) return

    try {
      setDeleting(true)
      await api.delete(`/usuarios/${selectedUsuario.id}`)
      
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi excluído com sucesso.'
      })

      carregarUsuarios()
      carregarStats()
      setDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o usuário.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setSelectedUsuario(null)
    }
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      adm_sistema: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      adm_empresa: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      controlador: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      apontador: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return variants[tipo as keyof typeof variants] || ''
  }

  const getTipoLabel = (tipo: string) => {
    const labels = {
      adm_sistema: 'ADM Sistema',
      adm_empresa: 'ADM Empresa',
      controlador: 'Controlador',
      apontador: 'Apontador'
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const getStatusBadge = (ativo: boolean) => {
    return ativo 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const podeAdicionarUsuario = () => {
    if (!plano) return false
    if (user?.tipo !== 'adm_empresa') return false

    const totalAtuais = usuarios.filter(u => u.ativo).length
    const limites = {
      adm_empresa: plano.limiteAdm,
      controlador: plano.limiteControlador,
      apontador: plano.limiteApontador
    }

    return totalAtuais < (limites.adm_empresa + limites.controlador + limites.apontador)
  }

  const usuariosFiltrados = usuarios.filter(usuario => {
    if (tipoFiltro !== 'todos' && usuario.tipo !== tipoFiltro) return false
    if (statusFiltro !== 'todos') {
      const statusMatch = statusFiltro === 'ativos' ? usuario.ativo : !usuario.ativo
      if (!statusMatch) return false
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        usuario.nome.toLowerCase().includes(term) ||
        usuario.email.toLowerCase().includes(term)
      )
    }
    return true
  })

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Usuários" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Usuários
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os usuários da sua empresa
              </p>
            </div>

            {user?.tipo === 'adm_empresa' && (
              <Link href="/app-empresa/usuarios/novo">
                <Button 
                  className="group"
                  disabled={!podeAdicionarUsuario()}
                  title={!podeAdicionarUsuario() ? 'Limite do plano atingido' : ''}
                >
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Novo Usuário
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
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-primary" />
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
                      <p className="text-sm text-muted-foreground">ADM Empresa</p>
                      <p className="text-3xl font-bold mt-1">{stats.admEmpresa}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Limite: {plano?.limiteAdm || 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCog className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                      <p className="text-sm text-muted-foreground">Controladores</p>
                      <p className="text-3xl font-bold mt-1">{stats.controladores}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Limite: {plano?.limiteControlador || 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
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
                      <p className="text-sm text-muted-foreground">Apontadores</p>
                      <p className="text-3xl font-bold mt-1">{stats.apontadores}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Limite: {plano?.limiteApontador || 0}
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCheck className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
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
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os tipos</SelectItem>
                      <SelectItem value="adm_empresa">ADM Empresa</SelectItem>
                      <SelectItem value="controlador">Controlador</SelectItem>
                      <SelectItem value="apontador">Apontador</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="ativos">Ativos</SelectItem>
                      <SelectItem value="inativos">Inativos</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={carregarUsuarios}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>

                  <Button variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Usuários */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Skeleton loading
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                            <div>
                              <div className="h-4 w-32 bg-muted rounded animate-pulse mb-2" />
                              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><div className="h-6 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-8 w-20 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : usuariosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <Users className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Nenhum usuário encontrado
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || tipoFiltro !== 'todos' || statusFiltro !== 'todos'
                              ? 'Tente ajustar os filtros'
                              : 'Comece adicionando seu primeiro usuário'}
                          </p>
                          {user?.tipo === 'adm_empresa' && podeAdicionarUsuario() && (
                            <Link href="/app-empresa/usuarios/novo">
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Adicionar Usuário
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    usuariosFiltrados.map((usuario, index) => (
                      <motion.tr
                        key={usuario.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={usuario.avatar} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(usuario.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{usuario.nome}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {usuario.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTipoBadge(usuario.tipo)}>
                            {getTipoLabel(usuario.tipo)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(usuario.ativo)}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {usuario.ultimoAcesso 
                              ? new Date(usuario.ultimoAcesso).toLocaleDateString('pt-BR')
                              : 'Nunca acessou'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                            {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/app-empresa/usuarios/${usuario.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            {user?.tipo === 'adm_empresa' && (
                              <>
                                <Link href={`/app-empresa/usuarios/${usuario.id}/edit`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedUsuario(usuario)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário {selectedUsuario?.nome}?
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