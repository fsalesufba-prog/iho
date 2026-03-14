'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
<<<<<<< HEAD
=======
  Truck
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
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
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { EmpresaForm } from './EmpresaForm'
import { EmpresaDetails } from './EmpresaDetails'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface Empresa {
  id: number
  nome: string
  cnpj: string
  email: string
  telefone: string
  plano: {
    id: number
    nome: string
  }
  status: 'ativo' | 'inativo' | 'atrasado' | 'cancelado'
  diasAtraso: number
  usuarios: number
  equipamentos: number
  dataCadastro: string
  dataAtivacao?: string
}

interface EmpresaListProps {
  filtroStatus?: string
}

export function EmpresaList({ filtroStatus }: EmpresaListProps) {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(filtroStatus || 'todos')
  const [plano, setPlano] = useState('todos')
  const [planos, setPlanos] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
<<<<<<< HEAD
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
=======

>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

  const { toast } = useToast()

  useEffect(() => {
    carregarPlanos()
  }, [])

  useEffect(() => {
    carregarEmpresas()
  }, [page, status, plano, search])

  const carregarPlanos = async () => {
    try {
      const response = await api.get('/planos', { params: { limit: 100 } })
      setPlanos(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    }
  }

  const carregarEmpresas = async () => {
    try {
      setLoading(true)
      const response = await api.get('/empresas', {
        params: {
          page,
          limit: 10,
          status: status !== 'todos' ? status : undefined,
          planoId: plano !== 'todos' ? plano : undefined,
          search: search || undefined
        }
      })
      setEmpresas(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as empresas',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarEmpresas()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/empresas/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Empresa excluída com sucesso'
      })
      carregarEmpresas()
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a empresa',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    }
  }

  const handleStatusChange = async (id: number, novoStatus: string) => {
    try {
      await api.patch(`/empresas/${id}/status`, { status: novoStatus })
      toast({
        title: 'Sucesso',
        description: `Status alterado para ${novoStatus}`
      })
      carregarEmpresas()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    }
  }

  const getStatusBadge = (status: string, diasAtraso: number) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>
      case 'atrasado':
        return (
          <Badge className="bg-red-100 text-red-800">
            {diasAtraso} dias em atraso
          </Badge>
        )
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Empresas</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por nome, CNPJ ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="atrasado">Em atraso</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={plano} onValueChange={setPlano}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os planos</SelectItem>
                {planos.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarEmpresas}>
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
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Equipamentos</TableHead>
                  <TableHead>Data Cadastro</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : empresas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  empresas.map((empresa) => (
                    <TableRow key={empresa.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(empresa.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{empresa.nome}</p>
                            <p className="text-xs text-muted-foreground">{empresa.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{empresa.cnpj}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{empresa.plano.nome}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(empresa.status, empresa.diasAtraso)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{empresa.usuarios}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Truck className="h-4 w-4 text-muted-foreground" />
                          <span>{empresa.equipamentos}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(empresa.dataCadastro).toLocaleDateString('pt-BR')}
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
                              setSelectedEmpresa(empresa)
                              setShowDetails(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedEmpresa(empresa)
                              setShowForm(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(empresa.id, 'ativo')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Ativar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(empresa.id, 'inativo')}>
                              <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                              Inativar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(empresa.id, 'cancelado')}>
                              <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                              Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(empresa.id)}
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
        <EmpresaForm
          open={showForm}
          onOpenChange={setShowForm}
          empresa={selectedEmpresa}
          onSuccess={() => {
            setShowForm(false)
            setSelectedEmpresa(null)
            carregarEmpresas()
          }}
        />
      )}

      {showDetails && selectedEmpresa && (
        <EmpresaDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          empresaId={selectedEmpresa.id}
        />
      )}
    </>
  )
}