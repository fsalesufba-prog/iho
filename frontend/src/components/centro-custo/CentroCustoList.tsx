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
  Star,
  BarChart3
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
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
import { CentroCustoForm } from './CentroCustoForm'
import { CentroCustoDetails } from './CentroCustoDetails'
import { AvaliacaoForm } from './AvaliacaoForm'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface CentroCusto {
  id: number
  nome: string
  codigo: string
  obraId?: number
  obraNome?: string
  contato?: string
  telefone?: string
  email?: string
  status: 'ativo' | 'inativo'
  avaliacoes: {
    total: number
    ultima: string
    media: number
    categorias: Record<string, number>
  }
}

interface CentroCustoListProps {
  obraId?: number
}

export function CentroCustoList({ obraId }: CentroCustoListProps) {
  const [centros, setCentros] = useState<CentroCusto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [obraFiltro, setObraFiltro] = useState<string>(obraId?.toString() || 'todas')
  const [obras, setObras] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedCentro, setSelectedCentro] = useState<CentroCusto | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showAvaliacao, setShowAvaliacao] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    carregarObras()
  }, [])

  useEffect(() => {
    carregarCentros()
  }, [page, status, obraFiltro, search])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', { params: { limit: 100 } })
      setObras(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const carregarCentros = async () => {
    try {
      setLoading(true)
      const response = await api.get('/centros-custo', {
        params: {
          page,
          limit: 10,
          obraId: obraFiltro !== 'todas' ? obraFiltro : undefined,
          status: status !== 'todos' ? status : undefined,
          search: search || undefined
        }
      })
      setCentros(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os centros de custo',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarCentros()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/centros-custo/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Centro de custo excluído com sucesso'
      })
      carregarCentros()
    } catch (error) {
      console.error('Erro ao excluir centro de custo:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o centro de custo',
        variant: 'destructive'
      })
    }
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600'
    if (nota >= 3.5) return 'text-blue-600'
    if (nota >= 2.5) return 'text-yellow-600'
    if (nota >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStatusBadge = (status: string) => {
    return status === 'ativo' 
      ? <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      : <Badge variant="secondary">Inativo</Badge>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Centros de Custo</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Centro de Custo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por nome ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={obraFiltro} onValueChange={setObraFiltro}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas as obras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as obras</SelectItem>
                {obras.map((obra) => (
                  <SelectItem key={obra.id} value={obra.id.toString()}>
                    {obra.nome}
                  </SelectItem>
                ))}
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

            <Button variant="outline" onClick={carregarCentros}>
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Média</TableHead>
                  <TableHead>Avaliações</TableHead>
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
                ) : centros.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum centro de custo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  centros.map((centro) => (
                    <TableRow key={centro.id}>
                      <TableCell className="font-mono text-xs">{centro.codigo}</TableCell>
                      <TableCell className="font-medium">{centro.nome}</TableCell>
                      <TableCell>{centro.obraNome || '-'}</TableCell>
                      <TableCell>
                        {centro.contato && (
                          <div className="text-sm">
                            <p>{centro.contato}</p>
                            <p className="text-xs text-muted-foreground">{centro.telefone}</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${getNotaColor(centro.avaliacoes.media)}`}>
                            {centro.avaliacoes.media.toFixed(1)}
                          </span>
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {centro.avaliacoes.total} avaliações
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(centro.status)}</TableCell>
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
                              setSelectedCentro(centro)
                              setShowDetails(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedCentro(centro)
                              setShowAvaliacao(true)
                            }}>
                              <Star className="h-4 w-4 mr-2" />
                              Avaliar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedCentro(centro)
                              setShowForm(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(centro.id)}
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
        <CentroCustoForm
          open={showForm}
          onOpenChange={setShowForm}
          centro={selectedCentro}
          onSuccess={() => {
            setShowForm(false)
            setSelectedCentro(null)
            carregarCentros()
          }}
        />
      )}

      {showDetails && selectedCentro && (
        <CentroCustoDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          centroId={selectedCentro.id}
        />
      )}

      {showAvaliacao && selectedCentro && (
        <AvaliacaoForm
          open={showAvaliacao}
          onOpenChange={setShowAvaliacao}
          centroId={selectedCentro.id}
          centroNome={selectedCentro.nome}
          onSuccess={() => {
            setShowAvaliacao(false)
            carregarCentros()
          }}
        />
      )}
    </>
  )
}