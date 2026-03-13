'use client'

import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  Calendar,
  Building2,
  CreditCard,
  QrCode,
  Barcode,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Printer,
  RefreshCw,
  FileText,
  Mail,
  Share2
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { PagamentoStatus } from './PagamentoStatus'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PagamentoDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pagamentoId: number
}

export function PagamentoDetails({ open, onOpenChange, pagamentoId }: PagamentoDetailsProps) {
  const [pagamento, setPagamento] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [reenviando, setReenviando] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      carregarPagamento()
    }
  }, [open, pagamentoId])

  const carregarPagamento = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/pagamentos/${pagamentoId}`)
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

  const handleReenviarEmail = async () => {
    try {
      setReenviando(true)
      await api.post(`/pagamentos/${pagamentoId}/reenviar-email`)
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
    } finally {
      setReenviando(false)
    }
  }

  const handleBaixarComprovante = async () => {
    try {
      const response = await api.get(`/pagamentos/${pagamentoId}/comprovante`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `comprovante-${pagamentoId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast({
        title: 'Sucesso',
        description: 'Comprovante baixado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao baixar comprovante:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o comprovante',
        variant: 'destructive'
      })
    }
  }

  const getMetodoIcon = (metodo?: string) => {
    switch (metodo) {
      case 'cartao':
        return <CreditCard className="h-4 w-4" />
      case 'pix':
        return <QrCode className="h-4 w-4" />
      case 'boleto':
        return <Barcode className="h-4 w-4" />
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

  const calcularDiasAtraso = () => {
    if (pagamento?.status === 'pago' || pagamento?.status === 'cancelado') return 0
    
    const hoje = new Date()
    const vencimento = new Date(pagamento?.dataVencimento)
    const diffTime = hoje.getTime() - vencimento.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  if (loading || !pagamento) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-96">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const diasAtraso = calcularDiasAtraso()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <span>Detalhes do Pagamento</span>
            <PagamentoStatus status={pagamento.status} />
          </DialogTitle>
          <DialogDescription>
            ID: {pagamento.id} | Criado em {format(new Date(pagamento.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Empresa:</span>
                  <span className="text-sm">{pagamento.empresa?.nome}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Tipo:</span>
                  <Badge variant="outline">
                    {pagamento.tipo === 'implantacao' ? 'Implantação' : 'Mensalidade'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Valor:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(pagamento.valor)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Vencimento:</span>
                  <span className="text-sm">
                    {format(new Date(pagamento.dataVencimento), "dd/MM/yyyy")}
                  </span>
                </div>

                {pagamento.dataPagamento && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Data Pagamento:</span>
                    <span className="text-sm">
                      {format(new Date(pagamento.dataPagamento), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pagamento.formaPagamento ? (
                  <>
                    <div className="flex items-center gap-2">
                      {getMetodoIcon(pagamento.formaPagamento)}
                      <span className="text-sm font-medium capitalize">
                        {pagamento.formaPagamento}
                      </span>
                    </div>

                    {pagamento.transacaoId && (
                      <div>
                        <p className="text-sm text-muted-foreground">ID da Transação:</p>
                        <p className="text-sm font-mono">{pagamento.transacaoId}</p>
                      </div>
                    )}

                    {pagamento.reciboUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBaixarComprovante}
                        className="mt-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Comprovante
                      </Button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Forma de pagamento não definida
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Status e Alertas */}
          {diasAtraso > 0 && pagamento.status !== 'pago' && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">
                    Pagamento atrasado há {diasAtraso} {diasAtraso === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {pagamento.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{pagamento.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Histórico de Status */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico do Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium">Pagamento criado</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(pagamento.createdAt), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                {pagamento.status === 'pago' && pagamento.dataPagamento && (
                  <div className="flex items-start gap-4">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Pagamento confirmado</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(pagamento.dataPagamento), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                )}

                {pagamento.status === 'cancelado' && (
                  <div className="flex items-start gap-4">
                    <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Pagamento cancelado</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(pagamento.updatedAt), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={handleReenviarEmail} disabled={reenviando}>
              <Mail className="h-4 w-4 mr-2" />
              {reenviando ? 'Enviando...' : 'Reenviar E-mail'}
            </Button>
            
            <Button variant="outline" onClick={handleBaixarComprovante}>
              <Download className="h-4 w-4 mr-2" />
              Comprovante
            </Button>
            
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}