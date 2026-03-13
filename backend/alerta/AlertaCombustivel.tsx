'use client'

import React, { useState, useEffect } from 'react'
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { AlertaCard } from './AlertaCard'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface ConsumoEquipamento {
  id: string
  nome: string
  tipo: string
  consumoMedio: number
  consumoEsperado: number
  variacao: number
  ultimaMedicao: string
  alerta: boolean
}

interface Abastecimento {
  id: string
  data: string
  equipamento: string
  quantidade: number
  valor: number
  odometro: number
  motorista: string
}

export function AlertaCombustivel() {
  const [consumos, setConsumos] = useState<ConsumoEquipamento[]>([])
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([])
  const [alertas, setAlertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('7d')

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [consumosRes, abastRes, alertasRes] = await Promise.all([
        api.get('/monitoramento/combustivel/consumo', { params: { periodo } }),
        api.get('/monitoramento/combustivel/abastecimentos', { params: { periodo } }),
        api.get('/alertas', { params: { tipo: 'combustivel', periodo } })
      ])
      
      setConsumos(consumosRes.data)
      setAbastecimentos(abastRes.data)
      setAlertas(alertasRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getVariacaoColor = (variacao: number) => {
    if (variacao > 20) return 'text-red-600'
    if (variacao > 10) return 'text-yellow-600'
    if (variacao < -10) return 'text-green-600'
    return 'text-muted-foreground'
  }

  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 0) return <TrendingUp className="h-4 w-4 text-red-600" />
    if (variacao < 0) return <TrendingDown className="h-4 w-4 text-green-600" />
    return null
  }

  const alertasCriticos = alertas.filter(a => a.prioridade === 'critica').length
  const consumoMedioGeral = consumos.reduce((acc, curr) => acc + curr.consumoMedio, 0) / consumos.length
  const totalAbastecimentos = abastecimentos.reduce((acc, curr) => acc + curr.valor, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Fuel className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Monitoramento de Combustível</h1>
            <p className="text-muted-foreground">
              Acompanhe consumo e alertas de combustível em tempo real
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {periodo === '7d' ? 'Últimos 7 dias' : 
             periodo === '30d' ? 'Últimos 30 dias' : 
             'Últimos 90 dias'}
          </Button>
          <Button variant="outline" size="sm" onClick={carregarDados}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consumo Médio</p>
                <p className="text-2xl font-bold">{consumoMedioGeral.toFixed(2)} L/h</p>
              </div>
              <Fuel className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Equipamentos com Alerta</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {consumos.filter(c => c.alerta).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertas Críticos</p>
                <p className="text-2xl font-bold text-red-600">{alertasCriticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Abastecimentos</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAbastecimentos)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="consumo">
        <TabsList>
          <TabsTrigger value="consumo">Consumo por Equipamento</TabsTrigger>
          <TabsTrigger value="abastecimentos">Últimos Abastecimentos</TabsTrigger>
          <TabsTrigger value="alertas">Alertas Ativos</TabsTrigger>
          <TabsTrigger value="analise">Análise Detalhada</TabsTrigger>
        </TabsList>

        <TabsContent value="consumo" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Consumo de Combustível por Equipamento</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Consumo Médio (L/h)</TableHead>
                    <TableHead>Consumo Esperado</TableHead>
                    <TableHead>Variação</TableHead>
                    <TableHead>Última Medição</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {consumos.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.consumoMedio.toFixed(2)}</TableCell>
                      <TableCell>{item.consumoEsperado.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className={`flex items-center space-x-1 ${getVariacaoColor(item.variacao)}`}>
                          {getVariacaoIcon(item.variacao)}
                          <span>{item.variacao > 0 ? '+' : ''}{item.variacao.toFixed(1)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(item.ultimaMedicao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {item.alerta ? (
                          <Badge variant="destructive">Alerta</Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="abastecimentos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Abastecimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Quantidade (L)</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Odômetro</TableHead>
                    <TableHead>Motorista</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abastecimentos.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(new Date(item.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">{item.equipamento}</TableCell>
                      <TableCell>{item.quantidade.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor)}
                      </TableCell>
                      <TableCell>{item.odometro.toLocaleString()} km</TableCell>
                      <TableCell>{item.motorista}</TableCell>
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
              <CardTitle>Alertas de Combustível</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum alerta ativo no momento
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

        <TabsContent value="analise" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Consumo por Tipo de Equipamento</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Aqui você pode adicionar um gráfico de pizza/barras */}
                <div className="h-64 flex items-center justify-center bg-muted rounded">
                  Gráfico de Consumo por Tipo
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução do Consumo</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Aqui você pode adicionar um gráfico de linha */}
                <div className="h-64 flex items-center justify-center bg-muted rounded">
                  Gráfico de Evolução
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Equipamentos com Maior Desvio</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Equipamento</TableHead>
                      <TableHead>Consumo Real</TableHead>
                      <TableHead>Consumo Esperado</TableHead>
                      <TableHead>Desvio</TableHead>
                      <TableHead>Impacto Financeiro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {consumos
                      .filter(c => Math.abs(c.variacao) > 10)
                      .sort((a, b) => Math.abs(b.variacao) - Math.abs(a.variacao))
                      .slice(0, 5)
                      .map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.nome}</TableCell>
                          <TableCell>{item.consumoMedio.toFixed(2)} L/h</TableCell>
                          <TableCell>{item.consumoEsperado.toFixed(2)} L/h</TableCell>
                          <TableCell className={getVariacaoColor(item.variacao)}>
                            {item.variacao > 0 ? '+' : ''}{item.variacao.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(Math.abs(item.variacao / 100 * item.consumoEsperado * 1000))}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}