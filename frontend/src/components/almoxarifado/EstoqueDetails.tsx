'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  MapPin,
  Calendar,
  User,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  Download
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
import { Progress } from '@/components/ui/Progress'
import { Separator } from '@/components/ui/Separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EstoqueDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
}

export function EstoqueDetails({ open, onOpenChange, item }: EstoqueDetailsProps) {
  const [movimentos, setMovimentos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && item) {
      carregarMovimentos()
    }
  }, [open, item])

  const carregarMovimentos = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/almoxarifado/estoque/${item.id}/movimentos`, {
        params: { limit: 10 }
      })
      setMovimentos(response.data)
    } catch (error) {
      console.error('Erro ao carregar movimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!item) return null

  const valorTotal = item.estoqueAtual * item.valorUnitario
  const percentualMinMax = (item.estoqueAtual / item.estoqueMaximo) * 100

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'critico':
        return { color: 'bg-red-100 text-red-800', label: 'Crítico' }
      case 'baixo':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Baixo' }
      case 'excesso':
        return { color: 'bg-blue-100 text-blue-800', label: 'Excesso' }
      default:
        return { color: 'bg-green-100 text-green-800', label: 'Normal' }
    }
  }

  const statusConfig = getStatusConfig(item.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <span>Detalhes do Item</span>
          </DialogTitle>
          <DialogDescription>
            Informações completas e histórico de movimentações
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{item.nome}</h2>
              <p className="text-sm text-muted-foreground">
                Código: {item.codigo} | Categoria: {item.categoria}
              </p>
            </div>
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Estoque Atual</p>
                  <p className="text-3xl font-bold">
                    {item.estoqueAtual} {item.unidade}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-3xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(valorTotal)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Valor Unitário</p>
                  <p className="text-3xl font-bold">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(item.valorUnitario)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Níveis de Estoque */}
          <Card>
            <CardHeader>
              <CardTitle>Níveis de Estoque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Utilização</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(percentualMinMax)}% da capacidade máxima
                  </span>
                </div>
                <Progress 
                  value={percentualMinMax}
                  className="h-3"
                  indicatorClassName={
                    item.status === 'critico' ? 'bg-red-500' :
                    item.status === 'baixo' ? 'bg-yellow-500' :
                    item.status === 'excesso' ? 'bg-blue-500' :
                    'bg-green-500'
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Mínimo</p>
                  <p className="text-lg font-semibold">
                    {item.estoqueMinimo} {item.unidade}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Atual</p>
                  <p className="text-lg font-semibold">
                    {item.estoqueAtual} {item.unidade}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Máximo</p>
                  <p className="text-lg font-semibold">
                    {item.estoqueMaximo} {item.unidade}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{item.localizacao || 'Não definida'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Última Movimentação</CardTitle>
              </CardHeader>
              <CardContent>
                {item.ultimaMovimento ? (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(item.ultimaMovimento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma movimentação</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Descrição */}
          {item.descricao && (
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.descricao}</p>
              </CardContent>
            </Card>
          )}

          {/* Histórico de Movimentações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Histórico de Movimentações</span>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : movimentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        Nenhuma movimentação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    movimentos.map((mov: any) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {format(new Date(mov.data), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            mov.tipo === 'entrada' ? 'success' :
                            mov.tipo === 'saida' ? 'destructive' :
                            'secondary'
                          }>
                            {mov.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={
                            mov.tipo === 'entrada' ? 'text-green-600' :
                            mov.tipo === 'saida' ? 'text-red-600' :
                            ''
                          }>
                            {mov.tipo === 'entrada' ? '+' : ''}
                            {mov.tipo === 'saida' ? '-' : ''}
                            {mov.quantidade} {item.unidade}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(mov.valor)}
                        </TableCell>
                        <TableCell>{mov.responsavel}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {mov.observacao}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}