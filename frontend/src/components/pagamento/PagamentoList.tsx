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
  CreditCard,
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
import { PagamentoForm } from './PagamentoForm'
import { PagamentoDetails } from './PagamentoDetails'

import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'

interface Pagamento {
  id: number
  empresaId: number
  empresaNome: string
  tipo: 'implantacao' | 'mensalidade'
  valor: number
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado'
  dataVencimento: string
  dataPagamento?: string
  formaPagamento?: 'cartao' | 'pix' | 'boleto'
  transacaoId?: string
  reciboUrl?: string
  observacoes?: string
  createdAt: string
}

interface PagamentoListProps {
  pagamentos?: Pagamento[]
  simple?: boolean
  empresaId?: number
}

export function PagamentoList({ pagamentos: initialPagamentos, simple, empresaId }: PagamentoListProps) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>(initialPagamentos || [])
  const [loading, setLoading] = useState(!initialPagamentos)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [tipo, setTipo] = useState('todos')
  const [empresaFiltro, setEmpresaFiltro] = useState<string>(empresaId?.toString() || 'todas')
  const [empresas, setEmpresas] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.tipo === 'adm_sistema') {
      carregarEmpresas()
    }
    if (!initialPagamentos) {
      carregarPagamentos()
    }
  }, [page, status, tipo, empresaFiltro, search])

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/empresas', { params: { limit: 100 } })
      setEmpresas(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const carregarPagamentos = async () => {
    try {
      setLoading(true)
      const params: any = {
        page,
        limit: simple ? 5 : 10,
        search: search || undefined,
        status: status !== 'todos' ? status : undefined,
        tipo: tipo !== 'todos' ? tipo : undefined
      }

      if (user?.tipo === 'adm_sistema') {
        if (empresaFiltro !== 'todas') {
          params.empresaId = empresaFiltro
        }
      } else {
        params.empresaId = user?.empresaId
      }

      const response = await api.get('/pagamentos', { params })
      setPagamentos(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pagamentos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarPagamentos()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/pagamentos/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Pagamento excluído com sucesso'
      })
      carregarPagamentos()
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o pagamento',
        variant: 'destructive'
      })
    }
  }

  const handleStatusChange = async (id: number, novoStatus: string) => {
    try {
      await api.patch(`/pagamentos/${id}/status`, { status: novoStatus })
      toast({
        title: 'Sucesso',
        description: `Status alterado para ${novoStatus}`
      })
      carregarPagamentos()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string, dataVencimento: string) => {
    const hoje = new Date()
    const vencimento = new Date(dataVencimento)
    const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24))

    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800">Pago</Badge>
      case 'pendente':
        if (diasAtraso > 0) {
          return <Badge className="bg-red-100 text-red-800">{diasAtraso} dias atrasado</Badge>
        }
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      case 'atrasado':
        return <Badge className="bg-red-100 text-red-800">Atrasado</Badge>
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>
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
        {pagamentos.map((pagamento) => (
          <div
            key={pagamento.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => {
              setSelectedPagamento(pagamento)
              setShowDetails(true)
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{pagamento.empresaNome}</span>
                {getStatusBadge(pagamento.status, pagamento.dataVencimento)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {pagamento.tipo === 'implantacao' ? 'Implantação' : 'Mensalidade'} • 
                Vencimento: {format(new Date(pagamento.dataVencimento), "dd/MM/yyyy")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">{formatCurrency(pagamento.valor)}</p>
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
            <CardTitle>Pagamentos</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por empresa ou transação..."
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

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="implantacao">Implantação</SelectItem>
                <SelectItem value="mensalidade">Mensalidade</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarPagamentos}>
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
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Forma</TableHead>
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
                ) : pagamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  pagamentos.map((pagamento) => (
                    <TableRow key={pagamento.id}>
                      <TableCell className="font-medium">{pagamento.empresaNome}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {pagamento.tipo === 'implantacao' ? 'Implantação' : 'Mensalidade'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-green-600">
                        {formatCurrency(pagamento.valor)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(pagamento.dataVencimento), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {pagamento.dataPagamento 
                          ? format(new Date(pagamento.dataPagamento), "dd/MM/yyyy")
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {pagamento.formaPagamento ? (
                          <Badge variant="secondary" className="capitalize">
                            {pagamento.formaPagamento}
                          </Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(pagamento.status, pagamento.dataVencimento)}
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
                              setSelectedPagamento(pagamento)
                              setShowDetails(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedPagamento(pagamento)
                              setShowForm(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleStatusChange(pagamento.id, 'pago')}>
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Marcar como Pago
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(pagamento.id, 'cancelado')}>
                              <XCircle className="h-4 w-4 mr-2 text-red-600" />
                              Cancelar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(pagamento.id)}
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
        <PagamentoForm
          open={showForm}
          onOpenChange={setShowForm}
          pagamento={selectedPagamento}
          onSuccess={() => {
            setShowForm(false)
            setSelectedPagamento(null)
            carregarPagamentos()
          }}
        />
      )}

      {showDetails && selectedPagamento && (
        <PagamentoDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          pagamentoId={selectedPagamento.id}
        />
      )}
    </>
  )
}