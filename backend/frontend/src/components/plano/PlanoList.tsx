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
  Copy,
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
import { PlanoForm } from './PlanoForm'
import { PlanoDetails } from './PlanoDetails'

import { api } from '@/lib/api'

import { useToast } from '@/components/hooks/useToast'

interface Plano {
  id: number
  nome: string
  descricao: string
  valorImplantacao: number
  valorMensal: number
  limiteAdm: number
  limiteControlador: number
  limiteApontador: number
  limiteEquipamentos: number
  recursos: string[]
  empresas: number
  status: 'ativo' | 'inativo'
  createdAt: string
}

export function PlanoList() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    carregarPlanos()
  }, [page, status, search])

  const carregarPlanos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/planos', {
        params: {
          page,
          limit: 10,
          status: status !== 'todos' ? status : undefined,
          search: search || undefined
        }
      })
      setPlanos(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os planos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarPlanos()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/planos/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Plano excluído com sucesso'
      })
      carregarPlanos()
    } catch (error) {
      console.error('Erro ao excluir plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o plano',
        variant: 'destructive'
      })
    }
  }

  const handleDuplicar = async (plano: Plano) => {
    try {
      const { id, empresas, createdAt, ...planoData } = plano
      await api.post('/planos', {
        ...planoData,
        nome: `${plano.nome} (cópia)`
      })
      toast({
        title: 'Sucesso',
        description: 'Plano duplicado com sucesso'
      })
      carregarPlanos()
    } catch (error) {
      console.error('Erro ao duplicar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar o plano',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'ativo' 
      ? <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      : <Badge variant="secondary">Inativo</Badge>
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Planos</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por nome..."
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
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarPlanos}>
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
                  <TableHead>Plano</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Implantação</TableHead>
                  <TableHead>Mensalidade</TableHead>
                  <TableHead>Limites</TableHead>
                  <TableHead>Empresas</TableHead>
                  <TableHead>Status</TableHead>
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
                ) : planos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum plano encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  planos.map((plano) => (
                    <TableRow key={plano.id}>
                      <TableCell className="font-medium">{plano.nome}</TableCell>
                      <TableCell className="max-w-xs truncate">{plano.descricao}</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(plano.valorImplantacao)}
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {formatCurrency(plano.valorMensal)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="secondary" className="mr-1">
                            Adm: {plano.limiteAdm}
                          </Badge>
                          <Badge variant="secondary" className="mr-1">
                            Cont: {plano.limiteControlador}
                          </Badge>
                          <Badge variant="secondary" className="mr-1">
                            Apont: {plano.limiteApontador}
                          </Badge>
                          <Badge variant="secondary">
                            Equip: {plano.limiteEquipamentos}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{plano.empresas}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(plano.status)}</TableCell>
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
                              setSelectedPlano(plano)
                              setShowDetails(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedPlano(plano)
                              setShowForm(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicar(plano)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(plano.id)}
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
        <PlanoForm
          open={showForm}
          onOpenChange={setShowForm}
          plano={selectedPlano}
          onSuccess={() => {
            setShowForm(false)
            setSelectedPlano(null)
            carregarPlanos()
          }}
        />
      )}

      {showDetails && selectedPlano && (
        <PlanoDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          planoId={selectedPlano.id}
        />
      )}
    </>
  )
}