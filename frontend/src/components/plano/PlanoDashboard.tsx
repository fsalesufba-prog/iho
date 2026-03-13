'use client'

import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Download,
  Building2,
  DollarSign,
  CheckCircle,
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
import { PlanoList } from './PlanoList'
import { PlanoGrafico } from './PlanoGrafico'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    totalPlanos: number
    planosAtivos: number
    planosInativos: number
    totalEmpresas: number
    faturamentoMensal: number
    faturamentoAnual: number
    ticketMedio: number
    crescimento: number
  }
  distribuicao: Array<{
    nome: string
    empresas: number
    faturamento: number
    percentual: number
  }>
  recentes: Array<any>
}

export function PlanoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30d')

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    carregarDashboard()
  }, [periodo])

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/planos/dashboard', { params: { periodo } })
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
          <CreditCard className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Planos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os planos do sistema
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
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
                <p className="text-sm text-muted-foreground">Total de Planos</p>
                <p className="text-2xl font-bold">{data.resumo.totalPlanos}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Planos Ativos</p>
                <p className="text-2xl font-bold text-green-600">{data.resumo.planosAtivos}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Empresas</p>
                <p className="text-2xl font-bold text-blue-600">{data.resumo.totalEmpresas}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(data.resumo.ticketMedio)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faturamento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Mensal</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(data.resumo.faturamentoMensal)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Anual</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(data.resumo.faturamentoAnual)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {data.resumo.crescimento >= 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600">
                      Crescimento de {data.resumo.crescimento}% em relação ao período anterior
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-600">
                      Queda de {Math.abs(data.resumo.crescimento)}% em relação ao período anterior
                    </span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.distribuicao.map((plano, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{plano.nome}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {plano.empresas} empresas
                      </span>
                      <span className="text-xs font-medium">
                        {plano.percentual}%
                      </span>
                    </div>
                  </div>
                  <Progress value={plano.percentual} className="h-2" />
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
            <CardTitle>Faturamento por Plano</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <PlanoGrafico 
              data={data.distribuicao}
              type="pie"
              dataKey="faturamento"
              nameKey="nome"
              format="currency"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Empresas por Plano</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <PlanoGrafico 
              data={data.distribuicao}
              type="bar"
              dataKey="empresas"
              nameKey="nome"
            />
          </CardContent>
        </Card>
      </div>

      {/* Lista de Planos */}
      <Card>
        <CardHeader>
          <CardTitle>Planos</CardTitle>
        </CardHeader>
        <CardContent>
          <PlanoList />
        </CardContent>
      </Card>
    </div>
  )
}