'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface AlertaEstoque {
  id: string
  tipo: 'critico' | 'baixo' | 'excesso'
  item: string
  codigo: string
  atual: number
  minimo: number
  maximo: number
  unidade: string
  recomendacao: string
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
}

export function EstoqueAlerts() {
  const [alertas, setAlertas] = useState<AlertaEstoque[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('todos')
  const { toast } = useToast()

  useEffect(() => {
    carregarAlertas()
  }, [])

  const carregarAlertas = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/alertas')
      setAlertas(response.data)
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os alertas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const resolverAlerta = async (id: string) => {
    try {
      await api.post(`/almoxarifado/alertas/${id}/resolver`)
      setAlertas(prev => prev.filter(a => a.id !== id))
      toast({
        title: 'Sucesso',
        description: 'Alerta resolvido'
      })
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
    }
  }

  const getAlertasFiltrados = () => {
    if (activeTab === 'todos') return alertas
    return alertas.filter(a => a.tipo === activeTab)
  }

  const getTipoConfig = (tipo: string) => {
    switch (tipo) {
      case 'critico':
        return { 
          icon: AlertTriangle, 
          color: 'text-red-600',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          label: 'Crítico'
        }
      case 'baixo':
        return { 
          icon: TrendingDown, 
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          label: 'Abaixo do Mínimo'
        }
      case 'excesso':
        return { 
          icon: TrendingUp, 
          color: 'text-blue-600',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          label: 'Acima do Máximo'
        }
      default:
        return { 
          icon: Package, 
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: tipo
        }
    }
  }

  const alertasFiltrados = getAlertasFiltrados()
  const criticos = alertas.filter(a => a.tipo === 'critico').length
  const baixos = alertas.filter(a => a.tipo === 'baixo').length
  const excesso = alertas.filter(a => a.tipo === 'excesso').length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-bold text-red-600">{criticos}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{baixos}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Acima do Máximo</p>
                <p className="text-2xl font-bold text-blue-600">{excesso}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alertas de Estoque</CardTitle>
            <Button variant="outline" size="sm" onClick={carregarAlertas}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="todos">
                Todos
                <Badge variant="secondary" className="ml-2">
                  {alertas.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="critico">
                Críticos
                {criticos > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {criticos}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="baixo">
                Baixos
                {baixos > 0 && (
                  <Badge variant="warning" className="ml-2">
                    {baixos}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="excesso">
                Excesso
                {excesso > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {excesso}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : alertasFiltrados.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum alerta encontrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertasFiltrados.map((alerta) => {
                    const config = getTipoConfig(alerta.tipo)
                    const Icon = config.icon

                    return (
                      <Card key={alerta.id} className="border-l-4 border-l-current" style={{ borderLeftColor: `var(--${alerta.tipo})` }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className={`mt-1 ${config.color}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold">{alerta.item}</h4>
                                  <Badge className={config.bgColor}>
                                    {config.label}
                                  </Badge>
                                  <Badge variant={
                                    alerta.prioridade === 'critica' ? 'destructive' :
                                    alerta.prioridade === 'alta' ? 'warning' :
                                    'secondary'
                                  }>
                                    {alerta.prioridade}
                                  </Badge>
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">
                                  {alerta.recomendacao}
                                </p>
                                
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Atual:</span>
                                    <span className="ml-2 font-medium">
                                      {alerta.atual} {alerta.unidade}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Mínimo:</span>
                                    <span className="ml-2 font-medium">
                                      {alerta.minimo} {alerta.unidade}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Máximo:</span>
                                    <span className="ml-2 font-medium">
                                      {alerta.maximo} {alerta.unidade}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <Progress 
                                    value={(alerta.atual / alerta.maximo) * 100}
                                    className="h-2"
                                    indicatorClassName={
                                      alerta.tipo === 'critico' ? 'bg-red-500' :
                                      alerta.tipo === 'baixo' ? 'bg-yellow-500' :
                                      alerta.tipo === 'excesso' ? 'bg-blue-500' :
                                      'bg-green-500'
                                    }
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resolverAlerta(alerta.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolver
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}