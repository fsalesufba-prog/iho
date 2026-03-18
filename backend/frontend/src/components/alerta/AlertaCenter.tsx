'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  AlertTriangle, 
  Fuel, 
  Wrench, 
  Package, 
  X,
  CheckCircle,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { AlertaCard } from './AlertaCard'
import { AlertaFilters } from './AlertaFilters'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

interface Alerta {
  id: string
  tipo: 'combustivel' | 'manutencao' | 'estoque' | 'sistema'
  titulo: string
  descricao: string
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'novo' | 'lido' | 'resolvido' | 'ignorado'
  data: string
  equipamentoId?: string
  equipamentoNome?: string
  valor?: number
  limite?: number
  acoes?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'destructive' | 'outline'
  }>
}

export function AlertaCenter() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    tipo: 'todos',
    prioridade: 'todos',
    status: 'todos'
  })
  const [activeTab, setActiveTab] = useState('todos')
  const { toast } = useToast()

  useEffect(() => {
    carregarAlertas()
    
    // Configurar SSE para alertas em tempo real
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/alertas/stream`)
    
    eventSource.onmessage = (event) => {
      const novoAlerta = JSON.parse(event.data)
      setAlertas(prev => [novoAlerta, ...prev])
      
      // Mostrar toast para alertas críticos
      if (novoAlerta.prioridade === 'critica') {
        toast({
          title: '🔴 Alerta Crítico',
          description: novoAlerta.titulo,
          variant: 'destructive'
        })
      }
    }

    return () => eventSource.close()
  }, [])

  const carregarAlertas = async () => {
    try {
      setLoading(true)
      const response = await api.get('/alertas')
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

  const marcarComoLido = async (id: string) => {
    try {
      await api.patch(`/alertas/${id}/lido`)
      setAlertas(prev =>
        prev.map(alerta =>
          alerta.id === id ? { ...alerta, status: 'lido' } : alerta
        )
      )
    } catch (error) {
      console.error('Erro ao marcar alerta como lido:', error)
    }
  }

  const resolverAlerta = async (id: string) => {
    try {
      await api.patch(`/alertas/${id}/resolver`)
      setAlertas(prev =>
        prev.map(alerta =>
          alerta.id === id ? { ...alerta, status: 'resolvido' } : alerta
        )
      )
      toast({
        title: 'Alerta resolvido',
        description: 'O alerta foi marcado como resolvido'
      })
    } catch (error) {
      console.error('Erro ao resolver alerta:', error)
    }
  }

  const ignorarAlerta = async (id: string) => {
    try {
      await api.patch(`/alertas/${id}/ignorar`)
      setAlertas(prev =>
        prev.map(alerta =>
          alerta.id === id ? { ...alerta, status: 'ignorado' } : alerta
        )
      )
    } catch (error) {
      console.error('Erro ao ignorar alerta:', error)
    }
  }

  const getAlertasFiltrados = () => {
    let filtered = alertas

    // Filtrar por tab
    if (activeTab === 'nao-lidos') {
      filtered = filtered.filter(a => a.status === 'novo')
    } else if (activeTab === 'criticos') {
      filtered = filtered.filter(a => a.prioridade === 'critica')
    }

    // Aplicar filtros
    if (filters.tipo !== 'todos') {
      filtered = filtered.filter(a => a.tipo === filters.tipo)
    }
    if (filters.prioridade !== 'todos') {
      filtered = filtered.filter(a => a.prioridade === filters.prioridade)
    }
    if (filters.status !== 'todos') {
      filtered = filtered.filter(a => a.status === filters.status)
    }

    // Ordenar por data e prioridade
    return filtered.sort((a, b) => {
      const prioridadeOrder = { critica: 0, alta: 1, media: 2, baixa: 3 }
      if (a.prioridade !== b.prioridade) {
        return prioridadeOrder[a.prioridade] - prioridadeOrder[b.prioridade]
      }
      return new Date(b.data).getTime() - new Date(a.data).getTime()
    })
  }

  const alertasFiltrados = getAlertasFiltrados()
  const naoLidos = alertas.filter(a => a.status === 'novo').length
  const criticos = alertas.filter(a => a.prioridade === 'critica').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="h-8 w-8 text-primary" />
            {naoLidos > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              >
                {naoLidos}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Central de Alertas</h1>
            <p className="text-muted-foreground">
              Monitore e gerencie todos os alertas do sistema
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={carregarAlertas}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{alertas.length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Não lidos</p>
                <p className="text-2xl font-bold text-yellow-600">{naoLidos}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
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
                <p className="text-sm text-muted-foreground">Resolvidos</p>
                <p className="text-2xl font-bold text-green-600">
                  {alertas.filter(a => a.status === 'resolvido').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs e Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="todos">
                  Todos
                  <Badge variant="secondary" className="ml-2">
                    {alertas.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="nao-lidos">
                  Não lidos
                  {naoLidos > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {naoLidos}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="criticos">
                  Críticos
                  {criticos > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {criticos}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <AlertaFilters filters={filters} onFilterChange={setFilters} />
            </div>

            <TabsContent value="todos" className="mt-0">
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : alertasFiltrados.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum alerta encontrado
                    </div>
                  ) : (
                    alertasFiltrados.map((alerta) => (
                      <React.Fragment key={alerta.id}>
                        <AlertaCard
                          alerta={alerta}
                          onMarcarLido={() => marcarComoLido(alerta.id)}
                          onResolver={() => resolverAlerta(alerta.id)}
                          onIgnorar={() => ignorarAlerta(alerta.id)}
                        />
                        <Separator />
                      </React.Fragment>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="nao-lidos" className="mt-0">
              {/* Conteúdo similar */}
            </TabsContent>

            <TabsContent value="criticos" className="mt-0">
              {/* Conteúdo similar */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}