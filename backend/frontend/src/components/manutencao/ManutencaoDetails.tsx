'use client'

import React, { useState, useEffect } from 'react'
import {
  Wrench,
  Calendar,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { ManutencaoStatus } from './ManutencaoStatus'
import { ManutencaoPriority } from './ManutencaoPriority'
import { ManutencaoType } from './ManutencaoType'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'

interface ManutencaoDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  manutencaoId: number
}

export function ManutencaoDetails({ open, onOpenChange, manutencaoId }: ManutencaoDetailsProps) {
  const [manutencao, setManutencao] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      carregarManutencao()
    }
  }, [open, manutencaoId])

  const carregarManutencao = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/manutencao/${manutencaoId}`)
      setManutencao(response.data)
    } catch (error) {
      console.error('Erro ao carregar manutenção:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da manutenção',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading || !manutencao) {
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

  const isAtrasada = () => {
    if (!manutencao.dataProgramada || manutencao.status === 'concluida' || manutencao.status === 'cancelada') return false
    return new Date(manutencao.dataProgramada) < new Date()
  }

  const atrasada = isAtrasada()
  const custoTotal = manutencao.itens?.reduce((acc: number, item: any) => 
    acc + (item.quantidade * item.valorUnitario), 0) || manutencao.custo || 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            <span>Detalhes da Manutenção</span>
            {atrasada && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Atrasada
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            ID: {manutencao.id} | {manutencao.equipamento?.nome} - {manutencao.equipamento?.tag}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status e Prioridade */}
          <div className="flex items-center gap-4">
            <ManutencaoStatus status={manutencao.status} />
            <ManutencaoPriority prioridade={manutencao.prioridade} />
            <ManutencaoType tipo={manutencao.tipo} />
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Data Programada:</span>
                  <span className="text-sm">
                    {manutencao.dataProgramada 
                      ? format(new Date(manutencao.dataProgramada), "dd/MM/yyyy")
                      : 'Não definida'}
                  </span>
                </div>

                {manutencao.dataRealizada && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Data Realizada:</span>
                    <span className="text-sm">
                      {format(new Date(manutencao.dataRealizada), "dd/MM/yyyy HH:mm")}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Horas do Equipamento:</span>
                  <span className="text-sm">{manutencao.horasEquipamento}h</span>
                </div>

                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Custo Total:</span>
                  <span className="text-sm font-bold text-green-600">
                    {formatCurrency(custoTotal)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Equipamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">{manutencao.equipamento?.nome}</p>
                  <p className="text-xs text-muted-foreground">Tag: {manutencao.equipamento?.tag}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marca/Modelo:</p>
                  <p className="text-sm">{manutencao.equipamento?.marca} {manutencao.equipamento?.modelo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localização:</p>
                  <p className="text-sm">{manutencao.equipamento?.obra?.nome || 'Não alocado'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{manutencao.descricao}</p>
            </CardContent>
          </Card>

          {/* Itens e Serviços */}
          {manutencao.itens && manutencao.itens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Itens e Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor Unit.</TableHead>
                      <TableHead>Valor Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manutencao.itens.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{item.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell>{formatCurrency(item.valorUnitario)}</TableCell>
                        <TableCell>{formatCurrency(item.quantidade * item.valorUnitario)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold">
                      <TableCell colSpan={4} className="text-right">Total:</TableCell>
                      <TableCell>{formatCurrency(custoTotal)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {manutencao.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{manutencao.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Histórico de Status */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{format(new Date(manutencao.createdAt), "dd/MM/yyyy HH:mm")}</span>
                </div>
                {manutencao.updatedAt && manutencao.updatedAt !== manutencao.createdAt && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Atualizado em:</span>
                    <span>{format(new Date(manutencao.updatedAt), "dd/MM/yyyy HH:mm")}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}