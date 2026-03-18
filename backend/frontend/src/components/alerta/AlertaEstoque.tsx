'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  RefreshCw,
  Download
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
import { api } from '@/lib/api'

interface ItemEstoque {
  id: string
  codigo: string
  nome: string
  categoria: string
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo: number
  unidade: string
  valorUnitario: number
  localizacao: string
  ultimaMovimento: string
}

interface MovimentoEstoque {
  id: string
  data: string
  tipo: 'entrada' | 'saida' | 'ajuste'
  item: string
  quantidade: number
  valor: number
  responsavel: string
  observacao: string
}

export function AlertaEstoque() {
  const [itens, setItens] = useState<ItemEstoque[]>([])
  const [movimentos, setMovimentos] = useState<MovimentoEstoque[]>([])
  const [alertas, setAlertas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [itensRes, movRes, alertasRes] = await Promise.all([
        api.get('/almoxarifado/estoque'),
        api.get('/almoxarifado/movimentos', { params: { limit: 20 } }),
        api.get('/alertas', { params: { tipo: 'estoque' } })
      ])
      
      setItens(itensRes.data)
      setMovimentos(movRes.data)
      setAlertas(alertasRes.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusEstoque = (item: ItemEstoque) => {
    if (item.estoqueAtual <= 0) return 'critico'
    if (item.estoqueAtual < item.estoqueMinimo) return 'baixo'
    if (item.estoqueAtual > item.estoqueMaximo) return 'excesso'
    return 'normal'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico': return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'baixo': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'excesso': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      default: return 'text-green-600 bg-green-100 dark:bg-green-900/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critico': return <AlertTriangle className="h-4 w-4" />
      case 'baixo': return <TrendingDown className="h-4 w-4" />
      case 'excesso': return <TrendingUp className="h-4 w-4" />
      default: return <Minus className="h-4 w-4" />
    }
  }

  const itensCriticos = itens.filter(i => getStatusEstoque(i) === 'critico').length
  const itensBaixos = itens.filter(i => getStatusEstoque(i) === 'baixo').length
  const valorTotalEstoque = itens.reduce((acc, item) => 
    acc + (item.estoqueAtual * item.valorUnitario), 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Almoxarifado - Alertas</h1>
            <p className="text-muted-foreground">
              Monitore estoque mínimo, máximo e alertas de reposição
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
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
                <p className="text-sm text-muted-foreground">Itens em Estoque</p>
                <p className="text-2xl font-bold">{itens.length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos (Zero)</p>
                <p className="text-2xl font-bold text-red-600">{itensCriticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Abaixo do Mínimo</p>
                <p className="text-2xl font-bold text-yellow-600">{itensBaixos}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotalEstoque)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="estoque">
        <TabsList>
          <TabsTrigger value="estoque">Situação do Estoque</TabsTrigger>
          <TabsTrigger value="alertas">Alertas Ativos</TabsTrigger>
          <TabsTrigger value="movimentos">Últimos Movimentos</TabsTrigger>
          <TabsTrigger value="reposicao">Sugestões de Reposição</TabsTrigger>
        </TabsList>

        <TabsContent value="estoque" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Situação do Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Mín/Máx</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Localização</TableHead>
                    <TableHead>Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item) => {
                    const status = getStatusEstoque(item)
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">{item.codigo}</TableCell>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>
                          <div>
                            <div className="flex items-center justify-between">
                              <span>{item.estoqueAtual} {item.unidade}</span>
                              <span className="text-xs text-muted-foreground">
                                {Math.round((item.estoqueAtual / item.estoqueMaximo) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={(item.estoqueAtual / item.estoqueMaximo) * 100}
                              className="h-1 mt-1"
                              indicatorClassName={
                                status === 'critico' ? 'bg-red-500' :
                                status === 'baixo' ? 'bg-yellow-500' :
                                status === 'excesso' ? 'bg-blue-500' :
                                'bg-green-500'
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.estoqueMinimo} / {item.estoqueMaximo} {item.unidade}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(status)}>
                            <span className="flex items-center space-x-1">
                              {getStatusIcon(status)}
                              <span className="capitalize">{status}</span>
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell>{item.localizacao}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            item.estoqueAtual * item.valorUnitario
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

        <TabsContent value="alertas" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Estoque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertas.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum alerta de estoque ativo
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

        <TabsContent value="movimentos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimos Movimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimentos.map((mov) => (
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
                          {mov.tipo === 'entrada' && <Plus className="h-3 w-3 mr-1" />}
                          {mov.tipo === 'saida' && <Minus className="h-3 w-3 mr-1" />}
                          {mov.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{mov.item}</TableCell>
                      <TableCell>{mov.quantidade}</TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(mov.valor)}
                      </TableCell>
                      <TableCell>{mov.responsavel}</TableCell>
                      <TableCell className="max-w-xs truncate">{mov.observacao}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reposicao" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sugestões de Reposição</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Estoque Atual</TableHead>
                    <TableHead>Estoque Mínimo</TableHead>
                    <TableHead>Quantidade Sugerida</TableHead>
                    <TableHead>Valor Estimado</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens
                    .filter(i => i.estoqueAtual <= i.estoqueMinimo)
                    .sort((a, b) => (a.estoqueAtual / a.estoqueMinimo) - (b.estoqueAtual / b.estoqueMinimo))
                    .map((item) => {
                      const quantidadeSugerida = item.estoqueMaximo - item.estoqueAtual
                      const prioridade = 
                        item.estoqueAtual === 0 ? 'critica' :
                        item.estoqueAtual < item.estoqueMinimo * 0.5 ? 'alta' :
                        'media'

                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.nome}</TableCell>
                          <TableCell>
                            <span className={
                              item.estoqueAtual === 0 ? 'text-red-600 font-bold' :
                              item.estoqueAtual < item.estoqueMinimo * 0.5 ? 'text-orange-600' :
                              'text-yellow-600'
                            }>
                              {item.estoqueAtual} {item.unidade}
                            </span>
                          </TableCell>
                          <TableCell>{item.estoqueMinimo} {item.unidade}</TableCell>
                          <TableCell>{quantidadeSugerida} {item.unidade}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                              quantidadeSugerida * item.valorUnitario
                            )}
                          </TableCell>
                          <TableCell>
                            <AlertaPriority prioridade={prioridade as any} />
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              Gerar Pedido
                            </Button>
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