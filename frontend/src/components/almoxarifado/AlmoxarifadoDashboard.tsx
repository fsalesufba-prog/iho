'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  RefreshCw,
  Download,
  Filter,
  Boxes,
  ArrowUpDown,
  History
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
import { EstoqueList } from './EstoqueList'
import { EstoqueMovimentoList } from './EstoqueMovimentoList'
import { EstoqueAlerts } from './EstoqueAlerts'
import { InventoryAnalytics } from './InventoryAnalytics'
import { api } from '@/lib/api'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardData {
  resumo: {
    totalItens: number
    valorTotal: number
    itensCriticos: number
    itensBaixos: number
    itensExcesso: number
    movimentosHoje: number
  }
  categorias: Array<{
    nome: string
    quantidade: number
    valor: number
    percentual: number
  }>
  topMovimentos: Array<{
    id: string
    data: string
    tipo: 'entrada' | 'saida' | 'ajuste'
    item: string
    quantidade: number
    responsavel: string
  }>
  alertas: Array<any>
}

export function AlmoxarifadoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('7d')
  const [activeTab, setActiveTab] = useState('resumo')

  useEffect(() => {
    carregarDados()
  }, [periodo])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/dashboard', {
        params: { periodo }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
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
            <h1 className="text-3xl font-bold">Almoxarifado</h1>
            <p className="text-muted-foreground">
              Gestão completa de estoque, movimentações e alertas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
          </select>
          <Button variant="outline" size="sm" onClick={carregarDados}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Itens</p>
                <p className="text-2xl font-bold">{data.resumo.totalItens}</p>
              </div>
              <Boxes className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor em Estoque</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(data.resumo.valorTotal)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Itens Críticos</p>
                <p className="text-2xl font-bold text-red-600">{data.resumo.itensCriticos}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Movimentos Hoje</p>
                <p className="text-2xl font-bold">{data.resumo.movimentosHoje}</p>
              </div>
              <History className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Secundários */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Itens Abaixo do Mínimo</span>
              <Badge variant="warning">{data.resumo.itensBaixos}</Badge>
            </div>
            <Progress value={(data.resumo.itensBaixos / data.resumo.totalItens) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Itens Acima do Máximo</span>
              <Badge variant="secondary">{data.resumo.itensExcesso}</Badge>
            </div>
            <Progress value={(data.resumo.itensExcesso / data.resumo.totalItens) * 100} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Itens Normais</span>
              <Badge variant="success">
                {data.resumo.totalItens - data.resumo.itensCriticos - data.resumo.itensBaixos - data.resumo.itensExcesso}
              </Badge>
            </div>
            <Progress 
              value={((data.resumo.totalItens - data.resumo.itensCriticos - data.resumo.itensBaixos - data.resumo.itensExcesso) / data.resumo.totalItens) * 100} 
              className="h-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumo" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="estoque">Estoque</TabsTrigger>
          <TabsTrigger value="movimentos">Movimentos</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Gráfico de Categorias */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.categorias.map((cat) => (
                    <div key={cat.nome}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{cat.nome}</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(cat.valor)}
                        </span>
                      </div>
                      <Progress value={cat.percentual} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {cat.quantidade} itens
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Últimos Movimentos */}
            <Card>
              <CardHeader>
                <CardTitle>Últimos Movimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.topMovimentos.map((mov) => (
                    <div key={mov.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant={
                          mov.tipo === 'entrada' ? 'success' :
                          mov.tipo === 'saida' ? 'destructive' :
                          'secondary'
                        }>
                          {mov.tipo}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{mov.item}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(mov.data), "dd/MM/yyyy HH:mm")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{mov.quantidade}</p>
                        <p className="text-xs text-muted-foreground">{mov.responsavel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Itens por Valor */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top 5 Itens por Valor em Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor Unitário</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Dados seriam carregados da API */}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="estoque" className="mt-4">
          <EstoqueList />
        </TabsContent>

        <TabsContent value="movimentos" className="mt-4">
          <EstoqueMovimentoList />
        </TabsContent>

        <TabsContent value="alertas" className="mt-4">
          <EstoqueAlerts />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <InventoryAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  )
}