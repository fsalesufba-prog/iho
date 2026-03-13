'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  UserCheck,
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Usuario {
  id: number
  nome: string
  email: string
  tipo: 'adm_empresa' | 'controlador' | 'apontador'
  ativo: boolean
  ultimoAcesso: string | null
  createdAt: string
}

export default function ConfiguracoesUsuariosPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarUsuarios()
  }, [page, searchTerm])

  const carregarUsuarios = async () => {
    try {
      setLoading(true)
      const response = await api.get('/configuracoes/usuarios', {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined
        }
      })
      setUsuarios(response.data.data)
      setTotalPages(response.data.meta.pages)
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

  const handleToggleStatus = async (usuario: Usuario) => {
    try {
      await api.patch(`/usuarios/${usuario.id}/status`, {
        ativo: !usuario.ativo
      })

      toast({
        title: usuario.ativo ? 'Usuário desativado' : 'Usuário ativado',
        description: `O usuário foi ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso.`
      })

      carregarUsuarios()
    } catch (error) {
      toast({
        title: 'Erro ao alterar status',
        description: 'Não foi possível alterar o status do usuário.',
        variant: 'destructive'
      })
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
      adm_empresa: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      controlador: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      apontador: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return variants[tipo as keyof typeof variants] || ''
  }

  const getTipoLabel = (tipo: string) => {
    const labels = {
      adm_empresa: 'Administrador',
      controlador: 'Controlador',
      apontador: 'Apontador'
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Gerenciar Usuários" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </button>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Gerenciar Usuários
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os usuários e permissões da sua empresa
              </p>
            </div>

            <Link href="/app-empresa/usuarios/novo">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </Link>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" onClick={carregarUsuarios}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle>Usuários da Empresa</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : usuarios.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum usuário encontrado
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm
                      ? 'Tente ajustar a busca'
                      : 'Comece adicionando o primeiro usuário'}
                  </p>
                  <Link href="/app-empresa/usuarios/novo">
                    <Button>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Novo Usuário
                    </Button>
                  </Link>
                </div>
              ) : (
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
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {getInitials(usuario.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{usuario.nome}</p>
                              <p className="text-sm text-muted-foreground">{usuario.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTipoBadge(usuario.tipo)}>
                            {getTipoLabel(usuario.tipo)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {usuario.ativo ? (
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {usuario.ultimoAcesso ? (
                            <span className="text-sm">{formatDate(usuario.ultimoAcesso, 'dd/MM/yyyy')}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Nunca acessou</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(usuario.createdAt, 'dd/MM/yyyy')}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/app-empresa/usuarios/${usuario.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/app-empresa/usuarios/${usuario.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(usuario)}
                              >
                                {usuario.ativo ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              {user?.tipo === 'adm_empresa' && (
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => {
                                    setSelectedUsuario(usuario)
                                    setDeleteDialogOpen(true)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
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
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}