'use client'

import React, { useState, useEffect } from 'react'
import {
  Wrench,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
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
import { AlertaCard } from './AlertaCard'
import { AlertaPriority } from './AlertaPriority'
import { api } from '@/lib/api'
import { format, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ManutencaoPendente {
  id: string
  equipamento: string
  tipo: 'preventiva' | 'corretiva' | 'preditiva'
  descricao: string
  dataProgramada: string
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  horasEquipamento: number
  horasProxima: number
  status: 'programada' | 'em_andamento' | 'atrasada'
}

interface IndicadorManutencao {
  label: string
  valor: number
  unidade: string
  tendencia: 'up' | 'down' | 'stable'
  alerta?: boolean
}

export function AlertaManutencao() {
  const [manutencoes, setManutencoes] = useState<ManutencaoPendente[]>([])
  const [indicadores, setIndicadores] = useState<IndicadorManutencao[]>([])
  const [alertas, setAlertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [manutRes, indicRes, alertasRes] = await Promise.all([
        api.get('/manutencao/pendentes'),
        api.get('/manutencao/indicadores'),
        api.get('/alertas', { params: { tipo: 'manutencao' } })
      ])
      
      setManutencoes(manutRes.data)
      setIndicadores(indicRes.data)
      setAlertas(alertasRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'programada': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'atrasada': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'preventiva': return <Calendar className="h-4 w-4 text-blue-500" />
      case 'corretiva': return <Wrench className="h-4 w-4 text-red-500" />
      case 'preditiva': return <Clock className="h-4 w-4 text-purple-500" />
      default: return null
    }
  }

  const manutencoesCriticas = manutencoes.filter(
    m => m.prioridade === 'critica' && m.status === 'atrasada'
  ).length

  const manutencoesHoje = manutencoes.filter(m => {
    const hoje = new Date()
    const dataProg = new Date(m.dataProgramada)
    return dataProg.toDateString() === hoje.toDateString()
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Wrench className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Manutenção - Alertas</h1>
            <p className="text-muted-foreground">
              Acompanhe manutenções programadas e alertas críticos
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={carregarDados}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Manutenções Pendentes</p>
                <p className="text-2xl font-bold">{manutencoes.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticas Atrasadas</p>
                <p className="text-2xl font-bold text-red-600">{manutencoesCriticas}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programadas p/ Hoje</p>
                <p className="text-2xl font-bold text-yellow-600">{manutencoesHoje}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MTBF</p>
                <p className="text-2xl font-bold">245h</p>
                <p className="text-xs text-green-600">↑ 12%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MTTR</p>
                <p className="text-2xl font-bold">4.5h</p>
                <p className="text-xs text-red-600">↑ 8%</p>
              </div>
              <Clock className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Manutenções Pendentes</TabsTrigger>
          <TabsTrigger value="alertas">Alertas Ativos</TabsTrigger>
          <TabsTrigger value="calendario">Calendário</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Manutenções Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Data Programada</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manutencoes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTipoIcon(item.tipo)}
                          <span className="capitalize">{item.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.equipamento}</TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell>
                        {format(new Date(item.dataProgramada), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{item.horasEquipamento}h</div>
                          <Progress 
                            value={(item.horasEquipamento / item.horasProxima) * 100} 
                            className="h-1 mt-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <AlertaPriority prioridade={item.prioridade} />
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alertas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Manutenção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum alerta de manutenção ativo
                  </p>
                ) : (
                  alertas.map((alerta) => (
                    <AlertaCard
                      key={alerta.id}
                      alerta={alerta}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendario" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Manutenções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-muted rounded">
                Calendário de Manutenções
                {/* Implementar componente de calendário */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicadores" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Manutenção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {indicadores.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold">
                          {item.valor} {item.unidade}
                        </span>
                        {item.tendencia === 'up' && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                        {item.tendencia === 'down' && (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        {item.alerta && (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted rounded">
                  Gráfico de Distribuição
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}