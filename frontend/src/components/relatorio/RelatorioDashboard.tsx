'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Calendar,
  RefreshCw,
  Download,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  Truck,
  DollarSign
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { RelatorioList } from './RelatorioList'
import { RelatorioGrafico } from './RelatorioGrafico'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    totalRelatorios: number
    relatoriosGerados: number
    relatoriosAgendados: number
    templates: number
  }
  recentes: Array<any>
  maisUsados: Array<{
    id: number
    nome: string
    tipo: string
    visualizacoes: number
  }>
}

export function RelatorioDashboard() {
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
      const response = await api.get('/relatorios/dashboard', {
        params: { periodo }
      })
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
          <FileText className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">
              Gere e gerencie relatórios do sistema
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
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={carregarDashboard}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Relatórios</p>
                <p className="text-2xl font-bold">{data.resumo.totalRelatorios}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gerados no Período</p>
                <p className="text-2xl font-bold text-green-600">{data.resumo.relatoriosGerados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold text-blue-600">{data.resumo.relatoriosAgendados}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates</p>
                <p className="text-2xl font-bold text-purple-600">{data.resumo.templates}</p>
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
            <CardTitle>Relatórios por Tipo</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <RelatorioGrafico 
              data={[]}
              type="pie"
              dataKey="quantidade"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geração por Período</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <RelatorioGrafico 
              data={[]}
              type="line"
              dataKey="quantidade"
            />
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Mais Usados */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Mais Utilizados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.maisUsados.map((relatorio, index) => (
              <div key={relatorio.id} className="flex items-center gap-4">
                <span className="text-lg font-bold text-muted-foreground w-8">
                  #{index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{relatorio.nome}</span>
                    <span className="text-sm text-muted-foreground">
                      {relatorio.visualizacoes} visualizações
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ 
                        width: `${(relatorio.visualizacoes / data.maisUsados[0].visualizacoes) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <RelatorioList 
            relatorios={data.recentes}
            simple
          />
        </CardContent>
      </Card>
    </div>
  )
}