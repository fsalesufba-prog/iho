'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
<<<<<<< HEAD
=======
import { Badge } from '../ui/Badge'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { api } from '@/lib/api'

interface AnalyticsData {
  turnover: {
    geral: number
    porCategoria: Array<{
      categoria: string
      taxa: number
      dias: number
    }>
  }
  custos: {
    total: number
    porPeriodo: Array<{
      periodo: string
      entradas: number
      saidas: number
      saldo: number
    }>
  }
  topItens: Array<{
    id: string
    nome: string
    quantidade: number
    valor: number
    movimentacoes: number
  }>
  previsao: Array<{
    item: string
    atual: number
    previsao30: number
    previsao60: number
    previsao90: number
  }>
}

export function InventoryAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const [activeTab, setActiveTab] = useState('turnover')

  useEffect(() => {
    carregarAnalytics()
  }, [periodo])

  const carregarAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/analytics', {
        params: { periodo }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Análises de Estoque</h1>
            <p className="text-muted-foreground">
              Métricas, indicadores e previsões
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="180d">Últimos 180 dias</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={carregarAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Giro de Estoque</p>
                <p className="text-2xl font-bold">{data.turnover.geral.toFixed(2)}x</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(data.custos.total)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dias em Estoque</p>
                <p className="text-2xl font-bold">
                  {Math.round(365 / data.turnover.geral)} dias
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="turnover" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="turnover">Giro de Estoque</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
          <TabsTrigger value="top">Top Itens</TabsTrigger>
          <TabsTrigger value="previsao">Previsão</TabsTrigger>
        </TabsList>

        <TabsContent value="turnover" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Giro de Estoque por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Taxa de Giro</TableHead>
                    <TableHead>Dias em Estoque</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.turnover.porCategoria.map((cat) => (
                    <TableRow key={cat.categoria}>
                      <TableCell className="font-medium">{cat.categoria}</TableCell>
                      <TableCell>{cat.taxa.toFixed(2)}x</TableCell>
                      <TableCell>{cat.dias} dias</TableCell>
                      <TableCell>
                        {cat.taxa > data.turnover.geral ? (
                          <span className="flex items-center text-green-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Acima da média
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            Abaixo da média
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Entradas</TableHead>
                    <TableHead>Saídas</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Variação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.custos.porPeriodo.map((periodo) => (
                    <TableRow key={periodo.periodo}>
                      <TableCell>{periodo.periodo}</TableCell>
                      <TableCell className="text-green-600">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(periodo.entradas)}
                      </TableCell>
                      <TableCell className="text-red-600">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(periodo.saidas)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(periodo.saldo)}
                      </TableCell>
                      <TableCell>
                        {periodo.saldo > 0 ? (
                          <span className="text-green-600">+{((periodo.saldo / periodo.entradas) * 100).toFixed(1)}%</span>
                        ) : (
                          <span className="text-red-600">{((periodo.saldo / periodo.entradas) * 100).toFixed(1)}%</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Itens por Movimentação</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantidade em Estoque</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Movimentações</TableHead>
                    <TableHead>Média por Dia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topItens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nome}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(item.valor)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {item.movimentacoes} mov.
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(item.movimentacoes / 30).toFixed(1)}/dia
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="previsao" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Previsão de Consumo</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Previsão 30 dias</TableHead>
                    <TableHead>Previsão 60 dias</TableHead>
                    <TableHead>Previsão 90 dias</TableHead>
                    <TableHead>Necessidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.previsao.map((item) => {
                    const necessidade = item.previsao30 - item.atual
                    return (
                      <TableRow key={item.item}>
                        <TableCell className="font-medium">{item.item}</TableCell>
                        <TableCell>{item.atual}</TableCell>
                        <TableCell>{item.previsao30}</TableCell>
                        <TableCell>{item.previsao60}</TableCell>
                        <TableCell>{item.previsao90}</TableCell>
                        <TableCell>
                          {necessidade > 0 ? (
                            <span className="text-yellow-600">
                              Comprar {necessidade}
                            </span>
                          ) : (
                            <span className="text-green-600">
                              Suficiente
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}