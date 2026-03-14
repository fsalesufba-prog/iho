'use client'

import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  Calendar,
  RefreshCw,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

import { Progress } from '@/components/ui/Progress'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { PagamentoList } from './PagamentoList'
import { PagamentoGrafico } from './PagamentoGrafico'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    total: number
    recebido: number
    pendente: number
    atrasado: number
    faturamentoMes: number
    faturamentoAno: number
    ticketMedio: number
    inadimplencia: number
  }
  porStatus: {
    pago: number
    pendente: number
    atrasado: number
    cancelado: number
  }
  porMetodo: Array<{
    metodo: string
    valor: number
    percentual: number
  }>
  recentes: Array<any>
}

export function PagamentoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')
  const [empresaId, setEmpresaId] = useState<string>('todas')
  const [empresas, setEmpresas] = useState<any[]>([])

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.tipo === 'adm_sistema') {
      carregarEmpresas()
    }
    carregarDashboard()
  }, [periodo, empresaId])

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/empresas', { params: { limit: 100 } })
      setEmpresas(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const params: any = { periodo }
      
      if (user?.tipo === 'adm_sistema') {
        if (empresaId !== 'todas') {
          params.empresaId = empresaId
        }
      } else {
        params.empresaId = user?.empresaId
      }

      const response = await api.get('/pagamentos/dashboard', { params })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard',
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
          <DollarSign className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Pagamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os pagamentos do sistema
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {user?.tipo === 'adm_sistema' && (
            <Select value={empresaId} onValueChange={setEmpresaId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas as empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as empresas</SelectItem>
                {empresas.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={carregarDashboard}>
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
                <p className="text-sm text-muted-foreground">Total de Pagamentos</p>
                <p className="text-2xl font-bold">{data.resumo.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recebido</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(data.resumo.recebido)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(data.resumo.pendente)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atrasado</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(data.resumo.atrasado)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faturamento e Inadimplência */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento do Mês</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(data.resumo.faturamentoMes)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento do Ano</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(data.resumo.faturamentoAno)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(data.resumo.ticketMedio)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inadimplência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-5xl font-bold text-red-600">
                {data.resumo.inadimplencia}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Taxa de inadimplência
              </p>
            </div>
            <Progress value={data.resumo.inadimplencia} className="h-3" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>0%</span>
              <span>Meta: 5%</span>
              <span>10%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por Status e Método */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Pago</span>
                  <span className="text-sm font-medium">
                    {data.porStatus.pago} ({((data.porStatus.pago / data.resumo.total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porStatus.pago / data.resumo.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-green-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Pendente</span>
                  <span className="text-sm font-medium">
                    {data.porStatus.pendente} ({((data.porStatus.pendente / data.resumo.total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porStatus.pendente / data.resumo.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-yellow-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Atrasado</span>
                  <span className="text-sm font-medium">
                    {data.porStatus.atrasado} ({((data.porStatus.atrasado / data.resumo.total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porStatus.atrasado / data.resumo.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-red-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Cancelado</span>
                  <span className="text-sm font-medium">
                    {data.porStatus.cancelado} ({((data.porStatus.cancelado / data.resumo.total) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress 
                  value={(data.porStatus.cancelado / data.resumo.total) * 100} 
                  className="h-2"
                  indicatorClassName="bg-gray-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valores por Método de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.porMetodo.map((metodo, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm capitalize">{metodo.metodo}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatCurrency(metodo.valor)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {metodo.percentual}%
                      </span>
                    </div>
                  </div>
                  <Progress value={metodo.percentual} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Evolução de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <PagamentoGrafico 
              data={[]}
              type="line"
              dataKey="valor"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pagamentos por Método</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <PagamentoGrafico 
              data={data.porMetodo}
              type="pie"
              dataKey="valor"
              nameKey="metodo"
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pagamentos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <PagamentoList 
            pagamentos={data.recentes}
            simple
          />
        </CardContent>
      </Card>
    </div>
  )
}