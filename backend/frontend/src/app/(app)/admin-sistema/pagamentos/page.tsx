'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  DollarSign,
  Search,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  QrCode,
  Scan,
  FileText,
  Mail,
  TrendingUp,
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

import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Pagamento {
  id: number
  empresaId: number
  empresaNome: string
  empresaCnpj: string
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
  updatedAt: string
}

export default function PagamentosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [tipo, setTipo] = useState('todos')
  const [periodo, setPeriodo] = useState('todos')
  const [empresa, setEmpresa] = useState('todas')
  const [empresas, setEmpresas] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    recebido: 0,
    pendente: 0,
    atrasado: 0,
    cancelado: 0,
    faturamentoMes: 0,
    faturamentoAno: 0
  })

  useEffect(() => {
    carregarEmpresas()
    carregarPagamentos()
    carregarStats()
  }, [page, status, tipo, periodo, empresa, search])

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
      const response = await api.get('/pagamentos', {
        params: {
          page,
          limit: 10,
          status: status !== 'todos' ? status : undefined,
          tipo: tipo !== 'todos' ? tipo : undefined,
          empresaId: empresa !== 'todas' ? empresa : undefined,
          periodo: periodo !== 'todos' ? periodo : undefined,
          search: search || undefined
        }
      })
      setPagamentos(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os pagamentos',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarStats = async () => {
    try {
      const response = await api.get('/pagamentos/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarPagamentos()
  }

  const handleDelete = async () => {
    if (!selectedPagamento) return

    try {
      await api.delete(`/pagamentos/${selectedPagamento.id}`)
      toast({
        title: 'Sucesso',
        description: 'Pagamento excluído com sucesso'
      })
      setShowDeleteDialog(false)
      setSelectedPagamento(null)
      carregarPagamentos()
      carregarStats()
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o pagamento',
        variant: 'error'
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
      carregarStats()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'error'
      })
    }
  }

  const handleReenviarEmail = async (id: number) => {
    try {
      await api.post(`/pagamentos/${id}/reenviar-email`)
      toast({
        title: 'Sucesso',
        description: 'E-mail reenviado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao reenviar e-mail:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível reenviar o e-mail',
        variant: 'error'
      })
    }
  }

  const getStatusBadge = (pagamento: Pagamento) => {
    const hoje = new Date()
    const vencimento = new Date(pagamento.dataVencimento)
    const diasAtraso = Math.floor((hoje.getTime() - vencimento.getTime()) / (1000 * 60 * 60 * 24))

    switch (pagamento.status) {
      case 'pago':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </Badge>
        )
      case 'pendente':
        if (diasAtraso > 0) {
          return (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {diasAtraso} dias atrasado
            </Badge>
          )
        }
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      case 'atrasado':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Atrasado
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{pagamento.status}</Badge>
    }
  }

  const getMetodoIcon = (metodo?: string) => {
    switch (metodo) {
      case 'cartao':
        return <CreditCard className="h-4 w-4" />
      case 'pix':
        return <QrCode className="h-4 w-4" />
      case 'boleto':
        return <Scan className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
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
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Pagamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os pagamentos do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Recebido</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.recebido)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.pendente)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats.atrasado)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Mês</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.faturamentoMes)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa ou transação..."
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

            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todo período</SelectItem>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="12m">Últimos 12 meses</SelectItem>
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
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
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
                  <TableHead>Transação</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : pagamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  pagamentos.map((pagamento) => (
                    <TableRow
                      key={pagamento.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin-sistema/pagamentos/${pagamento.id}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(pagamento.empresaNome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{pagamento.empresaNome}</p>
                            <p className="text-xs text-muted-foreground">{pagamento.empresaCnpj}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {pagamento.tipo === 'implantacao' ? 'Implantação' : 'Mensalidade'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(pagamento.valor)}
                      </TableCell>
                      <TableCell>{formatDate(pagamento.dataVencimento)}</TableCell>
                      <TableCell>{pagamento.dataPagamento ? formatDate(pagamento.dataPagamento) : '-'}</TableCell>
                      <TableCell>
                        {pagamento.formaPagamento ? (
                          <div className="flex items-center gap-1">
                            {getMetodoIcon(pagamento.formaPagamento)}
                            <span className="text-xs capitalize">{pagamento.formaPagamento}</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(pagamento)}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {pagamento.transacaoId ? pagamento.transacaoId.substring(0, 8) + '...' : '-'}
                      </TableCell>
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
                              onClick={() => router.push(`/admin-sistema/pagamentos/${pagamento.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            {pagamento.status === 'pendente' && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(pagamento.id, 'pago')}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                  Marcar como Pago
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(pagamento.id, 'cancelado')}>
                                  <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                  Cancelar
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleReenviarEmail(pagamento.id)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Reenviar E-mail
                            </DropdownMenuItem>
                            {pagamento.reciboUrl && (
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Ver Recibo
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPagamento(pagamento)
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
              Tem certeza que deseja excluir este pagamento?
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