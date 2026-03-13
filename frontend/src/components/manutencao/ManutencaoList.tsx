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
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle
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
import { ManutencaoForm } from './ManutencaoForm'
import { ManutencaoDetails } from './ManutencaoDetails'
import { ManutencaoStatus } from './ManutencaoStatus'
import { ManutencaoPriority } from './ManutencaoPriority'
import { ManutencaoType } from './ManutencaoType'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Manutencao {
  id: number
  equipamentoId: number
  equipamentoNome: string
  equipamentoTag: string
  tipo: 'preventiva' | 'corretiva' | 'preditiva'
  descricao: string
  dataProgramada?: string
  dataRealizada?: string
  horasEquipamento: number
  custo?: number
  status: 'programada' | 'em_andamento' | 'concluida' | 'cancelada'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  observacoes?: string
  createdAt: string
}

interface ManutencaoListProps {
  equipamentoId?: number
}

export function ManutencaoList({ equipamentoId }: ManutencaoListProps) {
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [prioridade, setPrioridade] = useState('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedManutencao, setSelectedManutencao] = useState<Manutencao | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    carregarManutencoes()
  }, [page, tipo, status, prioridade, search, equipamentoId])

  const carregarManutencoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/manutencao', {
        params: {
          empresaId: user?.empresaId,
          page,
          limit: 10,
          equipamentoId,
          tipo: tipo !== 'todos' ? tipo : undefined,
          status: status !== 'todos' ? status : undefined,
          prioridade: prioridade !== 'todos' ? prioridade : undefined,
          search: search || undefined
        }
      })
      setManutencoes(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar manutenções:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as manutenções',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarManutencoes()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/manutencao/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Manutenção excluída com sucesso'
      })
      carregarManutencoes()
    } catch (error) {
      console.error('Erro ao excluir manutenção:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a manutenção',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'programada':
        return <Badge className="bg-blue-100 text-blue-800">Programada</Badge>
      case 'em_andamento':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>
      case 'concluida':
        return <Badge className="bg-green-100 text-green-800">Concluída</Badge>
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isAtrasada = (dataProgramada?: string, status?: string) => {
    if (!dataProgramada || status === 'concluida' || status === 'cancelada') return false
    return new Date(dataProgramada) < new Date()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manutenções</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Manutenção
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por descrição ou equipamento..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="preventiva">Preventiva</SelectItem>
                <SelectItem value="corretiva">Corretiva</SelectItem>
                <SelectItem value="preditiva">Preditiva</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="programada">Programada</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluida">Concluída</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={prioridade} onValueChange={setPrioridade}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarManutencoes}>
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
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Programada</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Custo</TableHead>
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
                ) : manutencoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhuma manutenção encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  manutencoes.map((manutencao) => {
                    const atrasada = isAtrasada(manutencao.dataProgramada, manutencao.status)
                    return (
                      <TableRow key={manutencao.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{manutencao.equipamentoNome}</p>
                            <p className="text-xs text-muted-foreground">{manutencao.equipamentoTag}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {manutencao.descricao}
                        </TableCell>
                        <TableCell>
                          <ManutencaoType tipo={manutencao.tipo} />
                        </TableCell>
                        <TableCell>
                          <ManutencaoPriority prioridade={manutencao.prioridade} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(manutencao.status)}
                            {atrasada && (
                              <AlertTriangle className="h-4 w-4 text-red-600" title="Atrasada" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {manutencao.dataProgramada ? (
                            <div>
                              <p>{format(new Date(manutencao.dataProgramada), "dd/MM/yyyy")}</p>
                              {atrasada && (
                                <p className="text-xs text-red-600">Atrasada</p>
                              )}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{manutencao.horasEquipamento}h</TableCell>
                        <TableCell>
                          {manutencao.custo ? (
                            new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(manutencao.custo)
                          ) : '-'}
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
                                setSelectedManutencao(manutencao)
                                setShowDetails(true)
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedManutencao(manutencao)
                                setShowForm(true)
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(manutencao.id)}
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
        <ManutencaoForm
          open={showForm}
          onOpenChange={setShowForm}
          manutencao={selectedManutencao}
          onSuccess={() => {
            setShowForm(false)
            setSelectedManutencao(null)
            carregarManutencoes()
          }}
        />
      )}

      {showDetails && selectedManutencao && (
        <ManutencaoDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          manutencaoId={selectedManutencao.id}
        />
      )}
    </>
  )
}