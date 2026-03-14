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
  CheckCircle,
  XCircle,
  Clock,
  FileText,
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
import { MedicaoForm } from './MedicaoForm'
import { MedicaoDetails } from './MedicaoDetails'

import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'

interface Medicao {
  id: number
  obraId: number
  obraNome: string
  titulo: string
  descricao?: string
  periodoInicio: string
  periodoFim: string
  valorTotal: number
  status: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado'
  responsavel?: string
  createdAt: string
}

interface MedicaoListProps {
  medições?: Medicao[]
  simple?: boolean
  obraId?: number
}

export function MedicaoList({ medições: initialMedicoes, simple, obraId }: MedicaoListProps) {
  const [medicoes, setMedicoes] = useState<Medicao[]>(initialMedicoes || [])
  const [loading, setLoading] = useState(!initialMedicoes)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedMedicao, setSelectedMedicao] = useState<Medicao | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!initialMedicoes) {
      carregarMedicoes()
    }
  }, [page, status, search, obraId])

  const carregarMedicoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/medicao', {
        params: {
          empresaId: user?.empresaId,
          page,
          limit: simple ? 5 : 10,
          obraId,
          status: status !== 'todos' ? status : undefined,
          search: search || undefined
        }
      })
      setMedicoes(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar medições:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as medições',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarMedicoes()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/medicao/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Medição excluída com sucesso'
      })
      carregarMedicoes()
    } catch (error) {
      console.error('Erro ao excluir medição:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a medição',
        variant: 'destructive'
      })
    }
  }

  const handleStatusChange = async (id: number, novoStatus: string) => {
    try {
      await api.patch(`/medicao/${id}/status`, { status: novoStatus })
      toast({
        title: 'Sucesso',
        description: `Status alterado para ${novoStatus}`
      })
      carregarMedicoes()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'em_analise':
        return <Badge className="bg-blue-100 text-blue-800">Em Análise</Badge>
      case 'aprovado':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>
      case 'rejeitado':
        return <Badge variant="destructive">Rejeitado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (simple) {
    return (
      <div className="space-y-4">
        {medicoes.map((medicao) => (
          <div
            key={medicao.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => {
              setSelectedMedicao(medicao)
              setShowDetails(true)
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{medicao.titulo}</span>
                {getStatusBadge(medicao.status)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {medicao.obraNome} • {format(new Date(medicao.periodoInicio), "dd/MM")} a {format(new Date(medicao.periodoFim), "dd/MM/yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">{formatCurrency(medicao.valorTotal)}</p>
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
            <CardTitle>Medições</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Medição
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por título ou obra..."
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
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_analise">Em Análise</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarMedicoes}>
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
                  <TableHead>Título</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : medicoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma medição encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  medicoes.map((medicao) => (
                    <TableRow key={medicao.id}>
                      <TableCell className="font-medium">{medicao.titulo}</TableCell>
                      <TableCell>{medicao.obraNome}</TableCell>
                      <TableCell>
                        {format(new Date(medicao.periodoInicio), "dd/MM/yy")} - {format(new Date(medicao.periodoFim), "dd/MM/yy")}
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(medicao.valorTotal)}
                      </TableCell>
                      <TableCell>{getStatusBadge(medicao.status)}</TableCell>
                      <TableCell>
                        {format(new Date(medicao.createdAt), "dd/MM/yyyy")}
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
                              setSelectedMedicao(medicao)
                              setShowDetails(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedMedicao(medicao)
                              setShowForm(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(medicao.id, 'em_analise')}>
                              <Clock className="h-4 w-4 mr-2" />
                              Em Análise
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(medicao.id, 'aprovado')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Aprovar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(medicao.id, 'rejeitado')}>
                              <XCircle className="h-4 w-4 mr-2 text-red-600" />
                              Rejeitar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(medicao.id)}
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
        <MedicaoForm
          open={showForm}
          onOpenChange={setShowForm}
          medicao={selectedMedicao}
          onSuccess={() => {
            setShowForm(false)
            setSelectedMedicao(null)
            carregarMedicoes()
          }}
        />
      )}

      {showDetails && selectedMedicao && (
        <MedicaoDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          medicaoId={selectedMedicao.id}
        />
      )}
    </>
  )
}