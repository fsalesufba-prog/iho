'use client'

import React, { useState, useEffect } from 'react'
import { CreditCard, CheckCircle, RefreshCw } from 'lucide-react'

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
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'

interface PlanoDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  planoId: number
}

export function PlanoDetails({ open, onOpenChange, planoId }: PlanoDetailsProps) {
  const [plano, setPlano] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      carregarPlano()
    }
  }, [open, planoId])

  const carregarPlano = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/planos/${planoId}`)
      setPlano(response.data)
    } catch (error) {
      console.error('Erro ao carregar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do plano',
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

  const getStatusBadge = (status: string) => {
    return status === 'ativo' 
      ? <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      : <Badge variant="secondary">Inativo</Badge>
  }

  if (loading || !plano) {
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

  const recursos = JSON.parse(plano.recursos || '[]')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            <span>{plano.nome}</span>
            {getStatusBadge(plano.status)}
          </DialogTitle>
          <DialogDescription>
            {plano.descricao}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cards de Valores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Valores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Implantação</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(plano.valorImplantacao)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mensalidade</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(plano.valorMensal)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Limites</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Administradores:</span>
                    <span className="font-medium">{plano.limiteAdm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Controladores:</span>
                    <span className="font-medium">{plano.limiteControlador}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Apontadores:</span>
                    <span className="font-medium">{plano.limiteApontador}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Equipamentos:</span>
                    <span className="font-medium">{plano.limiteEquipamentos}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recursos */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Inclusos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recursos.map((recurso: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{recurso}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Empresas no Plano */}
          <Card>
            <CardHeader>
              <CardTitle>Empresas neste Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usuários</TableHead>
                    <TableHead>Equipamentos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plano.empresas?.map((empresa: any) => (
                    <TableRow key={empresa.id}>
                      <TableCell className="font-medium">{empresa.nome}</TableCell>
                      <TableCell>
                        <Badge variant={empresa.status === 'ativo' ? 'success' : 'secondary'}>
                          {empresa.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{empresa._count?.usuarios || 0}</TableCell>
                      <TableCell>{empresa._count?.equipamentos || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="font-medium">{plano.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Criado em:</span>
                  <p className="font-medium">
                    {format(new Date(plano.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Atualizado em:</span>
                  <p className="font-medium">
                    {format(new Date(plano.updatedAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}