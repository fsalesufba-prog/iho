'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Users,
  Plus,
  Search,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Key,
  CheckCircle,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent } from '@/components/ui/Card'
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

interface Usuario {
  id: number
  nome: string
  email: string
  telefone?: string
  tipo: 'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'
  empresaId?: number
  empresaNome?: string
  ativo: boolean
  avatar?: string
  ultimoAcesso?: string
  createdAt: string
  updatedAt: string
}

export default function UsuariosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [empresa, setEmpresa] = useState('todas')
  const [empresas, setEmpresas] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    carregarEmpresas()
    carregarUsuarios()
  }, [page, tipo, status, empresa, search])

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/empresas', { params: { limit: 100 } })
      setEmpresas(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const carregarUsuarios = async () => {
    try {
      setLoading(true)
      const response = await api.get('/usuarios', {
        params: {
          page,
          limit: 10,
          tipo: tipo !== 'todos' ? tipo : undefined,
          ativo: status !== 'todos' ? (status === 'ativo') : undefined,
          empresaId: empresa !== 'todas' ? empresa : undefined,
          search: search || undefined
        }
      })
      setUsuarios(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os usuários',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarUsuarios()
  }

  const handleToggleStatus = async (id: number, ativo: boolean) => {
    try {
      await api.patch(`/usuarios/${id}/status`, { ativo: !ativo })
      toast({
        title: 'Sucesso',
        description: ativo ? 'Usuário desativado' : 'Usuário ativado'
      })
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'destructive'
      })
    }
  }

  const handleResetPassword = async (id: number) => {
    try {
      await api.post(`/usuarios/${id}/reset-password`)
      toast({
        title: 'Sucesso',
        description: 'E-mail de redefinição de senha enviado'
      })
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar a senha',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedUsuario) return

    try {
      await api.delete(`/usuarios/${selectedUsuario.id}`)
      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso'
      })
      setShowDeleteDialog(false)
      setSelectedUsuario(null)
      carregarUsuarios()
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o usuário',
        variant: 'destructive'
      })
    }
  }

  const getTipoBadge = (tipo: string) => {
    const config = {
      adm_sistema: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', label: 'Admin Sistema' },
      adm_empresa: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Admin Empresa' },
      controlador: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Controlador' },
      apontador: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Apontador' }
    }
    const c = config[tipo as keyof typeof config] || config.apontador
    return <Badge className={c.color}>{c.label}</Badge>
  }

  const getStatusBadge = (ativo: boolean) => {
    return ativo ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    )
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
    if (!date) return 'Nunca'
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
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie todos os usuários do sistema
            </p>
          </div>
        </div>

        <Link href="/admin-sistema/usuarios/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
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
                  placeholder="Buscar por nome ou e-mail..."
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

            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="adm_sistema">Admin Sistema</SelectItem>
                <SelectItem value="adm_empresa">Admin Empresa</SelectItem>
                <SelectItem value="controlador">Controlador</SelectItem>
                <SelectItem value="apontador">Apontador</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={empresa} onValueChange={setEmpresa}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as empresas</SelectItem>
                {empresas.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarUsuarios}>
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
                  <TableHead>Usuário</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow
                      key={usuario.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin-sistema/usuarios/${usuario.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={usuario.avatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(usuario.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{usuario.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.telefone || '-'}</TableCell>
                      <TableCell>{getTipoBadge(usuario.tipo)}</TableCell>
                      <TableCell>{usuario.empresaNome || '-'}</TableCell>
                      <TableCell>{getStatusBadge(usuario.ativo)}</TableCell>
                      <TableCell>{formatDate(usuario.ultimoAcesso)}</TableCell>
                      <TableCell>{formatDate(usuario.createdAt)}</TableCell>
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
                              onClick={() => router.push(`/admin-sistema/usuarios/${usuario.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin-sistema/usuarios/${usuario.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(usuario.id, usuario.ativo)}>
                              {usuario.ativo ? (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Desativar
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Ativar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(usuario.id)}>
                              <Key className="h-4 w-4 mr-2" />
                              Resetar Senha
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUsuario(usuario)
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
              Tem certeza que deseja excluir o usuário "{selectedUsuario?.nome}"?
              Esta ação não pode ser desfeita.
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