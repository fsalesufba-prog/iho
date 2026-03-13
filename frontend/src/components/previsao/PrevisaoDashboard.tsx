'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Activity
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { PrevisaoUso } from './PrevisaoUso'
import { PrevisaoManutencao } from './PrevisaoManutencao'
import { PrevisaoCustos } from './PrevisaoCustos'
import { PrevisaoChart } from './PrevisaoChart'
import { PrevisaoAlerta } from './PrevisaoAlerta'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    confiabilidade: number
    precisao: number
    horizonte: number
    cenarios: number
  }
  alertas: {
    criticos: number
    atencao: number
    oportunidade: number
  }
  tendencias: {
    uso: Array<{ periodo: string; valor: number; previsto: number }>
    manutencao: Array<{ periodo: string; valor: number; previsto: number }>
    custos: Array<{ periodo: string; valor: number; previsto: number }>
  }
  recomendacoes: Array<any>
}

export function PrevisaoDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('12m')
  const [horizonte, setHorizonte] = useState('3m')
  const [activeTab, setActiveTab] = useState('uso')

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    carregarDashboard()
  }, [periodo, horizonte])

  const carregarDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/previsao/dashboard', {
        params: {
          empresaId: user?.empresaId,
          periodo,
          horizonte
        }
      })
      setData(response.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o dashboard de previsão',
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
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Previsão</h1>
            <p className="text-muted-foreground">
              Análise preditiva de uso, manutenção e custos
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período base" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6m">Últimos 6 meses</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
              <SelectItem value="24m">Últimos 24 meses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={horizonte} onValueChange={setHorizonte}>
            <SelectTrigger className="w-[150px]">
              <Target className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Horizonte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Próximo mês</SelectItem>
              <SelectItem value="3m">Próximos 3 meses</SelectItem>
              <SelectItem value="6m">Próximos 6 meses</SelectItem>
              <SelectItem value="12m">Próximo ano</SelectItem>
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

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confiabilidade</p>
                <p className="text-2xl font-bold text-green-600">{data.resumo.confiabilidade}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Modelo treinado com dados históricos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Precisão</p>
                <p className="text-2xl font-bold text-blue-600">{data.resumo.precisao}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Margem de erro média
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Horizonte</p>
                <p className="text-2xl font-bold text-purple-600">{data.resumo.horizonte} meses</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Período da previsão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cenários</p>
                <p className="text-2xl font-bold text-orange-600">{data.resumo.cenarios}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Simulações disponíveis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Recomendações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <PrevisaoAlerta alertas={data.recomendacoes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Críticos</span>
                <Badge variant="destructive">{data.alertas.criticos}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Atenção</span>
                <Badge className="bg-yellow-100 text-yellow-800">{data.alertas.atencao}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Oportunidades</span>
                <Badge className="bg-green-100 text-green-800">{data.alertas.oportunidade}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Previsão */}
      <Tabs defaultValue="uso" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="uso">Uso de Equipamentos</TabsTrigger>
          <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
        </TabsList>

        <TabsContent value="uso" className="mt-4">
          <PrevisaoUso 
            dados={data.tendencias.uso}
            horizonte={horizonte}
          />
        </TabsContent>

        <TabsContent value="manutencao" className="mt-4">
          <PrevisaoManutencao 
            dados={data.tendencias.manutencao}
            horizonte={horizonte}
          />
        </TabsContent>

        <TabsContent value="custos" className="mt-4">
          <PrevisaoCustos 
            dados={data.tendencias.custos}
            horizonte={horizonte}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}