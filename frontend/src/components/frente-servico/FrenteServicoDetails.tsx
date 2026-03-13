'use client'

import React, { useState, useEffect } from 'react'
import {
  FolderTree,
  Clock,
  Fuel,
  FileText,
  TrendingUp,
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
import { ApontamentoChart } from './ApontamentoChart'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FrenteServicoDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  frenteId: number
}

export function FrenteServicoDetails({ open, onOpenChange, frenteId }: FrenteServicoDetailsProps) {
  const [frente, setFrente] = useState<any>(null)
  const [apontamentos, setApontamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      carregarDados()
    }
  }, [open, frenteId])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [frenteRes, apontamentosRes] = await Promise.all([
        api.get(`/frentes-servico/${frenteId}`),
        api.get(`/frentes-servico/${frenteId}/apontamentos`, {
          params: { limit: 20 }
        })
      ])
      
      setFrente(frenteRes.data)
      setApontamentos(apontamentosRes.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da frente',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativa':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>
      case 'inativa':
        return <Badge variant="secondary">Inativa</Badge>
      case 'concluida':
        return <Badge variant="outline">Concluída</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}min`
  }

  if (loading || !frente) {
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

  const totalHoras = apontamentos.reduce((acc, curr) => acc + curr.horasTrabalhadas, 0)
  const totalCombustivel = apontamentos.reduce((acc, curr) => acc + (curr.combustivelLitros || 0), 0)
  const produtividadeMedia = apontamentos.length > 0 
    ? (totalHoras / (apontamentos.length * 8)) * 100 
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            <span>{frente.nome}</span>
            {getStatusBadge(frente.status)}
          </DialogTitle>
          <DialogDescription>
            Obra: {frente.obra?.nome} | Criada em {format(new Date(frente.createdAt), "dd/MM/yyyy", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Descrição */}
          {frente.descricao && (
            <Card>
              <CardHeader>
                <CardTitle>Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{frente.descricao}</p>
              </CardContent>
            </Card>
          )}

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Horas</p>
                    <p className="text-2xl font-bold">{formatHours(totalHoras)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Combustível</p>
                    <p className="text-2xl font-bold">{totalCombustivel.toFixed(1)} L</p>
                  </div>
                  <Fuel className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Produtividade</p>
                    <p className="text-2xl font-bold">{produtividadeMedia.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Apontamentos</p>
                    <p className="text-2xl font-bold">{apontamentos.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Horas por Dia</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ApontamentoChart 
                  data={apontamentos.map(a => ({
                    date: format(new Date(a.data), 'dd/MM'),
                    horas: a.horasTrabalhadas
                  }))}
                  type="line"
                  dataKey="horas"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consumo de Combustível</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ApontamentoChart 
                  data={apontamentos
                    .filter(a => a.combustivelLitros)
                    .map(a => ({
                      date: format(new Date(a.data), 'dd/MM'),
                      combustivel: a.combustivelLitros
                    }))}
                  type="bar"
                  dataKey="combustivel"
                />
              </CardContent>
            </Card>
          </div>

          {/* Últimos Apontamentos */}
          <Card>
            <CardHeader>
              <CardTitle>Últimos Apontamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Combustível</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apontamentos.slice(0, 5).map((ap) => (
                    <TableRow key={ap.id}>
                      <TableCell>
                        {format(new Date(ap.data), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{ap.equipamento?.nome || '-'}</TableCell>
                      <TableCell>{ap.operador?.nome || '-'}</TableCell>
                      <TableCell>{ap.horasTrabalhadas}h</TableCell>
                      <TableCell>{ap.combustivelLitros ? `${ap.combustivelLitros} L` : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Equipamentos Alocados */}
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
                    <TableHead>Horas Totais</TableHead>
                    <TableHead>Último Apontamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Implementar lista de equipamentos alocados */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}