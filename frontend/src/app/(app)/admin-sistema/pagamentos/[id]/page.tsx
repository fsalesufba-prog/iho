'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DollarSign,
  ArrowLeft,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  CreditCard,
  QrCode,
  Barcode,
  FileText,
  Printer,
  Mail,
  Download,
  Copy,
  Eye,
  MoreVertical,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Pagamento {
  id: number
  empresaId: number
  empresa: {
    id: number
    nome: string
    cnpj: string
    email: string
    telefone: string
    endereco: string
    cidade: string
    estado: string
    cep: string
    plano: {
      id: number
      nome: string
    }
  }
  tipo: 'implantacao' | 'mensalidade'
  valor: number
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado'
  dataVencimento: string
  dataPagamento?: string
  formaPagamento?: 'cartao' | 'pix' | 'boleto'
  transacaoId?: string
  reciboUrl?: string
  linkPagamento?: string
  qrCode?: string
  linhaDigitavel?: string
  urlBoleto?: string
  observacoes?: string
  createdAt: string
  updatedAt: string
  logs?: Array<{
    id: number
    acao: string
    usuario: string
    data: string
    ip?: string
  }>
}

export default function PagamentoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [pagamento, setPagamento] = useState<Pagamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('detalhes')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    carregarPagamento()
  }, [id])

  const carregarPagamento = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/pagamentos/${id}`)
      setPagamento(response.data)
    } catch (error) {
      console.error('Erro ao carregar pagamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do pagamento',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (novoStatus: string) => {
    if (!pagamento) return

    try {
      await api.patch(`/pagamentos/${pagamento.id}/status`, { status: novoStatus })
      toast({
        title: 'Sucesso',
        description: `Status alterado para ${novoStatus}`
      })
      carregarPagamento()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async () => {
    if (!pagamento) return

    try {
      await api.delete(`/pagamentos/${pagamento.id}`)
      toast({
        title: 'Sucesso',
        description: 'Pagamento excluído com sucesso'
      })
      router.push('/admin-sistema/pagamentos')
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o pagamento',
        variant: 'destructive'
      })
    }
  }

  const handleReenviarEmail = async () => {
    if (!pagamento) return

    try {
      await api.post(`/pagamentos/${pagamento.id}/reenviar-email`)
      toast({
        title: 'Sucesso',
        description: 'E-mail reenviado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao reenviar e-mail:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível reenviar o e-mail',
        variant: 'destructive'
      })
    }
  }

  const handleCopyPix = () => {
    if (pagamento?.linkPagamento) {
      navigator.clipboard.writeText(pagamento.linkPagamento)
      setCopied(true)
      toast({
        title: 'Copiado!',
        description: 'Código PIX copiado para a área de transferência'
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getStatusBadge = () => {
    if (!pagamento) return null

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
        return <CreditCard className="h-5 w-5" />
      case 'pix':
        return <QrCode className="h-5 w-5" />
      case 'boleto':
        return <Barcode className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
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
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const formatDateShort = (date?: string) => {
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

  if (loading || !pagamento) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">
                Pagamento #{pagamento.id}
              </h1>
              {getStatusBadge()}
            </div>
            <p className="text-muted-foreground">
              {pagamento.empresa.nome} • {pagamento.tipo === 'implantacao' ? 'Implantação' : 'Mensalidade'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pagamento.status === 'pendente' && (
            <>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('pago')}
                className="text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Pago
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusChange('cancelado')}
                className="text-red-600"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>

          <Button variant="outline">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(pagamento.valor)}
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
                <p className="text-sm text-muted-foreground">Vencimento</p>
                <p className="text-xl font-bold">
                  {formatDateShort(pagamento.dataVencimento)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                <div className="flex items-center gap-2 mt-1">
                  {getMetodoIcon(pagamento.formaPagamento)}
                  <span className="text-xl font-semibold capitalize">
                    {pagamento.formaPagamento || 'Não definido'}
                  </span>
                </div>
              </div>
              {pagamento.formaPagamento === 'cartao' && <CreditCard className="h-8 w-8 text-blue-600" />}
              {pagamento.formaPagamento === 'pix' && <QrCode className="h-8 w-8 text-green-600" />}
              {pagamento.formaPagamento === 'boleto' && <Barcode className="h-8 w-8 text-orange-600" />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="logs">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID do Pagamento</p>
                  <p className="font-medium">#{pagamento.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">
                    {pagamento.tipo === 'implantacao' ? 'Taxa de Implantação' : 'Mensalidade'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Vencimento</p>
                  <p className="font-medium">{formatDate(pagamento.dataVencimento)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Pagamento</p>
                  <p className="font-medium">
                    {pagamento.dataPagamento ? formatDate(pagamento.dataPagamento) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium text-green-600">{formatCurrency(pagamento.valor)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forma de Pagamento</p>
                  <p className="font-medium capitalize">{pagamento.formaPagamento || 'Não definido'}</p>
                </div>
              </div>

              {pagamento.transacaoId && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">ID da Transação</p>
                    <p className="font-mono text-sm bg-muted p-2 rounded">{pagamento.transacaoId}</p>
                  </div>
                </>
              )}

              {pagamento.observacoes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Observações</p>
                    <p className="text-sm bg-muted p-3 rounded">{pagamento.observacoes}</p>
                  </div>
                </>
              )}

              {pagamento.formaPagamento === 'pix' && pagamento.linkPagamento && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Código PIX</p>
                    <div className="flex gap-2">
                      <Input
                        value={pagamento.linkPagamento}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyPix}
                      >
                        {copied ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {pagamento.qrCode && (
                      <div className="mt-4 flex justify-center">
                        <img src={pagamento.qrCode} alt="QR Code PIX" className="w-32 h-32" />
                      </div>
                    )}
                  </div>
                </>
              )}

              {pagamento.formaPagamento === 'boleto' && pagamento.linhaDigitavel && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Linha Digitável</p>
                    <div className="flex gap-2">
                      <Input
                        value={pagamento.linhaDigitavel}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(pagamento.linhaDigitavel!)
                          toast({ title: 'Copiado!', description: 'Linha digitável copiada' })
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    {pagamento.urlBoleto && (
                      <Button
                        variant="outline"
                        className="mt-4 w-full"
                        onClick={() => window.open(pagamento.urlBoleto, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Visualizar Boleto
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleReenviarEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Reenviar E-mail
                </Button>

                {pagamento.reciboUrl && (
                  <Button variant="outline" onClick={() => window.open(pagamento.reciboUrl, '_blank')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Ver Recibo
                  </Button>
                )}

                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>

                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(pagamento.empresa.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{pagamento.empresa.nome}</h3>
                  <p className="text-sm text-muted-foreground">{pagamento.empresa.cnpj}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{pagamento.empresa.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{pagamento.empresa.telefone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">
                    {pagamento.empresa.endereco}, {pagamento.empresa.cidade}/{pagamento.empresa.estado} - CEP: {pagamento.empresa.cep}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>
                  <Badge variant="outline">{pagamento.empresa.plano.nome}</Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin-sistema/empresas/${pagamento.empresa.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Empresa
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico do Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamento.logs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.data}</TableCell>
                      <TableCell>{log.acao}</TableCell>
                      <TableCell>{log.usuario}</TableCell>
                      <TableCell>{log.ip || '-'}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>{formatDate(pagamento.createdAt)}</TableCell>
                    <TableCell>Pagamento criado</TableCell>
                    <TableCell>Sistema</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                  {pagamento.dataPagamento && (
                    <TableRow>
                      <TableCell>{formatDate(pagamento.dataPagamento)}</TableCell>
                      <TableCell>Pagamento confirmado</TableCell>
                      <TableCell>Sistema</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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