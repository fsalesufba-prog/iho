'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Truck,
  RefreshCw,
  Edit,
  Download,
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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
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

interface ObraDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  obraId: number
}

export function ObraDetails({ open, onOpenChange, obraId }: ObraDetailsProps) {
  const [obra, setObra] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      carregarObra()
    }
  }, [open, obraId])

  const carregarObra = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/obras/${obraId}`)
      setObra(response.data)
    } catch (error) {
      console.error('Erro ao carregar obra:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da obra',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>
      case 'paralisada':
        return <Badge className="bg-yellow-100 text-yellow-800">Paralisada</Badge>
      case 'concluida':
        return <Badge className="bg-blue-100 text-blue-800">Concluída</Badge>
      case 'cancelada':
        return <Badge variant="destructive">Cancelada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading || !obra) {
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
            <Building2 className="h-5 w-5" />
            <span>{obra.nome}</span>
            {getStatusBadge(obra.status)}
          </DialogTitle>
          <DialogDescription>
            Código: {obra.codigo} | CNPJ: {obra.cnpj}
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
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{obra.endereco}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{obra.cidade}/{obra.estado} - CEP: {obra.cep}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Início:</span>
                  <span className="text-sm">
                    {obra.dataInicio ? format(new Date(obra.dataInicio), "dd/MM/yyyy") : 'Não informado'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Previsão Término:</span>
                  <span className="text-sm">
                    {obra.dataPrevisaoTermino ? format(new Date(obra.dataPrevisaoTermino), "dd/MM/yyyy") : 'Não informado'}
                  </span>
                </div>
                {obra.dataTermino && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Concluída em:</span>
                    <span className="text-sm">{format(new Date(obra.dataTermino), "dd/MM/yyyy")}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valores e Progresso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Valor da Obra</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(obra.valor)}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-muted-foreground">Progresso</p>
                    <span className="text-sm font-medium">{obra.progresso || 0}%</span>
                  </div>
                  <Progress value={obra.progresso || 0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Frentes de Serviço</p>
                    <p className="text-2xl font-bold">{obra._count?.frenteServicos || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Equipamentos</p>
                    <p className="text-2xl font-bold">{obra._count?.equipamentos || 0}</p>
                  </div>
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Centros de Custo</p>
                    <p className="text-2xl font-bold">{obra._count?.centrosCusto || 0}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="frentes">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="frentes">Frentes de Serviço</TabsTrigger>
              <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
              <TabsTrigger value="documentos">Documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="frentes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Frentes de Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Apontamentos</TableHead>
                        <TableHead>Equipamentos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {obra.frenteServicos?.map((frente: any) => (
                        <TableRow key={frente.id}>
                          <TableCell className="font-medium">{frente.nome}</TableCell>
                          <TableCell>
                            <Badge variant={frente.status === 'ativa' ? 'success' : 'secondary'}>
                              {frente.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{frente._count?.apontamentos || 0}</TableCell>
                          <TableCell>{frente._count?.equipamentos || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipamentos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Equipamentos Alocados</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Equipamento</TableHead>
                        <TableHead>Tag</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {obra.equipamentos?.map((eq: any) => (
                        <TableRow key={eq.id}>
                          <TableCell className="font-medium">{eq.nome}</TableCell>
                          <TableCell>{eq.tag}</TableCell>
                          <TableCell>{eq.tipo}</TableCell>
                          <TableCell>
                            <Badge variant={
                              eq.status === 'disponivel' ? 'success' :
                              eq.status === 'em_uso' ? 'warning' :
                              eq.status === 'manutencao' ? 'destructive' : 'secondary'
                            }>
                              {eq.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documentos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum documento anexado
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Observações */}
          {obra.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{obra.observacoes}</p>
              </CardContent>
            </Card>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar Dados
            </Button>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar Obra
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}