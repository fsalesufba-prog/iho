'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Printer,
  RefreshCw
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
import { Textarea } from '@/components/ui/Textarea'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MedicaoDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicaoId: number
}

export function MedicaoDetails({ open, onOpenChange, medicaoId }: MedicaoDetailsProps) {
  const [medicao, setMedicao] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      carregarMedicao()
    }
  }, [open, medicaoId])

  const carregarMedicao = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/medicao/${medicaoId}`)
      setMedicao(response.data)
    } catch (error) {
      console.error('Erro ao carregar medição:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da medição',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAprovar = async () => {
    try {
      setEnviando(true)
      await api.patch(`/medicao/${medicaoId}/status`, {
        status: 'aprovado',
        comentario
      })
      toast({
        title: 'Sucesso',
        description: 'Medição aprovada com sucesso'
      })
      carregarMedicao()
      setComentario('')
    } catch (error) {
      console.error('Erro ao aprovar medição:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível aprovar a medição',
        variant: 'destructive'
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleRejeitar = async () => {
    if (!comentario) {
      toast({
        title: 'Atenção',
        description: 'Adicione um comentário explicando o motivo da rejeição',
        variant: 'destructive'
      })
      return
    }

    try {
      setEnviando(true)
      await api.patch(`/medicao/${medicaoId}/status`, {
        status: 'rejeitado',
        comentario
      })
      toast({
        title: 'Sucesso',
        description: 'Medição rejeitada'
      })
      carregarMedicao()
      setComentario('')
    } catch (error) {
      console.error('Erro ao rejeitar medição:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível rejeitar a medição',
        variant: 'destructive'
      })
    } finally {
      setEnviando(false)
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

  if (loading || !medicao) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <span>Detalhes da Medição</span>
            {getStatusBadge(medicao.status)}
          </DialogTitle>
          <DialogDescription>
            ID: {medicao.id} | Criada em {format(new Date(medicao.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Obra:</span>
                  <span className="text-sm">{medicao.obra?.nome}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Título:</span>
                  <span className="text-sm">{medicao.titulo}</span>
                </div>

                {medicao.descricao && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Descrição:</span>
                      <p className="text-sm mt-1">{medicao.descricao}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Período:</span>
                  <span className="text-sm">
                    {format(new Date(medicao.periodoInicio), "dd/MM/yyyy")} a {format(new Date(medicao.periodoFim), "dd/MM/yyyy")}
                  </span>
                </div>

                {medicao.responsavel && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Responsável:</span>
                    <span className="text-sm">{medicao.responsavel}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(medicao.valorTotal)}
                </div>

                <Separator />

                                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantidade de Itens:</span>
                    <span className="font-medium">{medicao.itens?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Média por Item:</span>
                    <span className="font-medium">
                      {formatCurrency(medicao.valorTotal / (medicao.itens?.length || 1))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Itens da Medição */}
          <Card>
            <CardHeader>
              <CardTitle>Itens da Medição</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                    <TableHead>Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicao.itens?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell>{item.unidade}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
                      <TableCell>{formatCurrency(item.quantidade * item.valorUnitario)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell colSpan={4} className="text-right">Total:</TableCell>
                    <TableCell>{formatCurrency(medicao.valorTotal)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Observações */}
          {medicao.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{medicao.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Aprovação/Rejeição (se estiver pendente ou em análise) */}
          {(medicao.status === 'pendente' || medicao.status === 'em_analise') && (
            <Card>
              <CardHeader>
                <CardTitle>Ação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Adicione um comentário (obrigatório para rejeição)"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={3}
                />

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAprovar}
                    disabled={enviando}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar Medição
                  </Button>
                  <Button
                    onClick={handleRejeitar}
                    disabled={enviando}
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar Medição
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}