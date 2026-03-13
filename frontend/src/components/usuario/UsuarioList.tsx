'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Key,
  Mail,
  Phone,
  UserCheck,
  UserX
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { UsuarioForm } from './UsuarioForm'
import { UsuarioDetails } from './UsuarioDetails'
import { UsuarioStatus } from './UsuarioStatus'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
}

interface UsuarioListProps {
  empresaId?: number
  simple?: boolean
}

export function UsuarioList({ empresaId, simple }: UsuarioListProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [empresaFiltro, setEmpresaFiltro] = useState<string>(empresaId?.toString() || 'todas')
  const [empresas, setEmpresas] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.tipo === 'adm_sistema') {
      carregarEmpresas()
    }
    carregarUsuarios()
  }, [page, tipo, status, empresaFiltro, search])

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
      const params: any = {
        page,
        limit: simple ? 5 : 10,
        search: search || undefined,
        tipo: tipo !== 'todos' ? tipo : undefined,
        ativo: status !== 'todos' ? (status === 'ativo') : undefined
      }

      if (user?.tipo === 'adm_sistema') {
        if (empresaFiltro !== 'todas') {
          params.empresaId = empresaFiltro
        }
      } else {
        params.empresaId = user?.empresaId
      }

      const response = await api.get('/usuarios', { params })
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

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/usuarios/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso'
      })
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

  const getTipoBadge = (tipo: string) => {
    const config = {
      adm_sistema: { color: 'bg-purple-100 text-purple-800', label: 'Admin Sistema' },
      adm_empresa: { color: 'bg-blue-100 text-blue-800', label: 'Admin Empresa' },
      controlador: { color: 'bg-green-100 text-green-800', label: 'Controlador' },
      apontador: { color: 'bg-yellow-100 text-yellow-800', label: 'Apontador' }
    }
    const c = config[tipo as keyof typeof config] || config.apontador
    return <Badge className={c.color}>{c.label}</Badge>
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (simple) {
    return (
      <div className="space-y-4">
        {usuarios.map((usuario) => (
          <div
            key={usuario.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => {
              setSelectedUsuario(usuario)
              setShowDetails(true)
            }}
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={usuario.avatar} />
                <AvatarFallback>{getInitials(usuario.nome)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{usuario.nome}</p>
                <p className="text-sm text-muted-foreground">{usuario.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getTipoBadge(usuario.tipo)}
              <UsuarioStatus ativo={usuario.ativo} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Usuários</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {user?.tipo === 'adm_sistema' && (
              <Select value={empresaFiltro} onValueChange={setEmpresaFiltro}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todas as empresas" />
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
            )}

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

            <Button variant="outline" onClick={carregarUsuarios}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : usuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
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
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{usuario.email}</span>
                        </div>
                        {usuario.telefone && (
                          <div className="flex items-center gap-1 mt-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{usuario.telefone}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getTipoBadge(usuario.tipo)}</TableCell>
                      <TableCell>{usuario.empresaNome || '-'}</TableCell>
                      <TableCell>
                        <UsuarioStatus ativo={usuario.ativo} />
                      </TableCell>
                      <TableCell>
                        {usuario.ultimoAcesso 
                          ? format(new Date(usuario.ultimoAcesso), "dd/MM/yyyy HH:mm")
                          : 'Nunca'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUsuario(usuario)
                              setShowDetails(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedUsuario(usuario)
                              setShowForm(true)
                            }}>
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
                              onClick={() => handleDelete(usuario.id)}
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
            <div className="flex items-center justify-between mt-4">
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

      {/* Modais */}
      {showForm && (
        <UsuarioForm
          open={showForm}
          onOpenChange={setShowForm}
          usuario={selectedUsuario}
          onSuccess={() => {
            setShowForm(false)
            setSelectedUsuario(null)
            carregarUsuarios()
          }}
        />
      )}

      {showDetails && selectedUsuario && (
        <UsuarioDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          usuarioId={selectedUsuario.id}
        />
      )}
    </>
  )
}