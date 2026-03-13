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
  Clock,
  Users,
  Truck
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
import { FrenteServicoForm } from './FrenteServicoForm'
import { FrenteServicoDetails } from './FrenteServicoDetails'
import { ApontamentoForm } from './ApontamentoForm'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface FrenteServico {
  id: number
  nome: string
  descricao?: string
  obraId: number
  obraNome: string
  status: 'ativa' | 'inativa' | 'concluida'
  createdAt: string
  updatedAt: string
  apontamentos: number
  equipamentos: number
  horasTrabalhadas: number
  consumoCombustivel: number
}

interface FrenteServicoListProps {
  obraId?: number
}

export function FrenteServicoList({ obraId }: FrenteServicoListProps) {
  const [frentes, setFrentes] = useState<FrenteServico[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todas')
  const [obraFiltro, setObraFiltro] = useState<string>(obraId?.toString() || 'todas')
  const [obras, setObras] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedFrente, setSelectedFrente] = useState<FrenteServico | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showApontamento, setShowApontamento] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.empresaId) {
      carregarObras()
    }
  }, [user?.empresaId])

  useEffect(() => {
    carregarFrentes()
  }, [page, status, obraFiltro, search, user?.empresaId])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { 
          empresaId: user?.empresaId,
          limit: 100 
        }
      })
      setObras(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const carregarFrentes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/frentes-servico', {
        params: {
          empresaId: user?.empresaId,
          page,
          limit: 10,
          obraId: obraFiltro !== 'todas' ? obraFiltro : undefined,
          status: status !== 'todas' ? status : undefined,
          search: search || undefined
        }
      })
      setFrentes(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar frentes de serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as frentes de serviço',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarFrentes()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/frentes-servico/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Frente de serviço excluída com sucesso'
      })
      carregarFrentes()
    } catch (error) {
      console.error('Erro ao excluir frente de serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a frente de serviço',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>
      case 'inativa':
        return <Badge variant="secondary">Inativa</Badge>
      case 'concluida':
        return <Badge variant="outline">Concluída</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}min`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Frentes de Serviço</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Frente
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
                <SelectItem value="todas">Todos</SelectItem>
                <SelectItem value="ativa">Ativa</SelectItem>
                <SelectItem value="inativa">Inativa</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarFrentes}>
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Apontamentos</TableHead>
                  <TableHead>Equipamentos</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : frentes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhuma frente de serviço encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  frentes.map((frente) => {
                    const progresso = (frente.horasTrabalhadas / 200) * 100 // Exemplo: meta de 200h
                    return (
                      <TableRow key={frente.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{frente.nome}</p>
                            {frente.descricao && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {frente.descricao}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{frente.obraNome}</TableCell>
                        <TableCell>{getStatusBadge(frente.status)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{frente.apontamentos}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span>{frente.equipamentos}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatHours(frente.horasTrabalhadas)}</TableCell>
                        <TableCell>{frente.consumoCombustivel.toFixed(1)} L</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Progress value={progresso} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              {progresso.toFixed(0)}%
                            </p>
                          </div>
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
                                setSelectedFrente(frente)
                                setShowDetails(true)
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedFrente(frente)
                                setShowApontamento(true)
                              }}>
                                <Clock className="h-4 w-4 mr-2" />
                                Novo Apontamento
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedFrente(frente)
                                setShowForm(true)
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(frente.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
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
        <FrenteServicoForm
          open={showForm}
          onOpenChange={setShowForm}
          frente={selectedFrente}
          onSuccess={() => {
            setShowForm(false)
            setSelectedFrente(null)
            carregarFrentes()
          }}
        />
      )}

      {showDetails && selectedFrente && (
        <FrenteServicoDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          frenteId={selectedFrente.id}
        />
      )}

      {showApontamento && selectedFrente && (
        <ApontamentoForm
          open={showApontamento}
          onOpenChange={setShowApontamento}
          frenteId={selectedFrente.id}
          frenteNome={selectedFrente.nome}
          onSuccess={() => {
            setShowApontamento(false)
            carregarFrentes()
          }}
        />
      )}
    </>
  )
}