'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Calendar,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Shield,
  Key
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
import { UsuarioList } from './UsuarioList'
import { UsuarioActivity } from './UsuarioActivity'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

interface DashboardData {
  resumo: {
    total: number
    ativos: number
    inativos: number
    bloqueados: number
    novosMes: number
    crescimento: number
  }
  porTipo: {
    admSistema: number
    admEmpresa: number
    controlador: number
    apontador: number
  }
  acesso: {
    hoje: number
    semana: number
    mes: number
    mediaDiaria: number
  }
  recentes: Array<any>
}

export function UsuarioDashboard() {
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
      
      if (user?.tipo === 'adm_sistema' && empresaId !== 'todas') {
        params.empresaId = empresaId
      }

      const response = await api.get('/usuarios/dashboard', { params })
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
          <Users className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Usuários</h1>
            <p className="text-muted-foreground">
              Gerencie todos os usuários do sistema
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
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
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
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{data.resumo.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold text-green-600">{data.resumo.ativos}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inativos</p>
                <p className="text-2xl font-bold text-yellow-600">{data.resumo.inativos}</p>
              </div>
              <UserX className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bloqueados</p>
                <p className="text-2xl font-bold text-red-600">{data.resumo.bloqueados}</p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Novos Usuários e Crescimento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Novos Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{data.resumo.novosMes}</div>
            <p className="text-sm text-muted-foreground mt-1">no último mês</p>
            <div className="flex items-center gap-2 mt-4">
              {data.resumo.crescimento >= 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    +{data.resumo.crescimento}% em relação ao mês anterior
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    {data.resumo.crescimento}% em relação ao mês anterior
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Admin Sistema</span>
                  <span className="font-medium">{data.porTipo.admSistema}</span>
                </div>
                <Progress value={(data.porTipo.admSistema / data.resumo.total) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Admin Empresa</span>
                  <span className="font-medium">{data.porTipo.admEmpresa}</span>
                </div>
                <Progress value={(data.porTipo.admEmpresa / data.resumo.total) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Controladores</span>
                  <span className="font-medium">{data.porTipo.controlador}</span>
                </div>
                <Progress value={(data.porTipo.controlador / data.resumo.total) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Apontadores</span>
                  <span className="font-medium">{data.porTipo.apontador}</span>
                </div>
                <Progress value={(data.porTipo.apontador / data.resumo.total) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acessos */}
      <Card>
        <CardHeader>
          <CardTitle>Acessos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{data.acesso.hoje}</p>
              <p className="text-sm text-muted-foreground">Hoje</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{data.acesso.semana}</p>
              <p className="text-sm text-muted-foreground">Esta semana</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{data.acesso.mes}</p>
              <p className="text-sm text-muted-foreground">Este mês</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">{data.acesso.mediaDiaria}</p>
              <p className="text-sm text-muted-foreground">Média diária</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="lista">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lista">Lista de Usuários</TabsTrigger>
          <TabsTrigger value="atividade">Atividades Recentes</TabsTrigger>
          <TabsTrigger value="acessos">Histórico de Acessos</TabsTrigger>
        </TabsList>

        <TabsContent value="lista" className="mt-4">
          <UsuarioList 
            empresaId={empresaId !== 'todas' ? parseInt(empresaId) : undefined}
          />
        </TabsContent>

        <TabsContent value="atividade" className="mt-4">
          <UsuarioActivity recentes={data.recentes} />
        </TabsContent>

        <TabsContent value="acessos" className="mt-4">
          <UsuarioActivity type="acessos" />
        </TabsContent>
      </Tabs>
    </div>
  )
}