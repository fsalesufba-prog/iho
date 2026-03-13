'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  XCircle,
  Fuel,
  Wrench,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  X,
} from 'lucide-react'


import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'

interface Alerta {
  id: number
  tipo: 'combustivel' | 'manutencao' | 'estoque'
  gravidade: 'baixa' | 'media' | 'alta'
  titulo: string
  descricao: string
  status: 'pendente' | 'resolvido' | 'ignorado'
  valor?: number
  limite?: number
  diasRestantes?: number
  diasAtraso?: number
  createdAt: string
  equipamento?: {
    id: number
    tag: string
    nome: string
  }
  itemEstoque?: {
    id: number
    nome: string
    codigo: string
  }
}

interface DashboardData {
  totais: Array<{
    status: string
    _count: number
  }>
  porGravidade: Array<{
    gravidade: string
    _count: number
  }>
  porTipo: Array<{
    tipo: string
    _count: number
  }>
  recentes: Alerta[]
}

export default function AlertasPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [data, setData] = useState<DashboardData | null>(null)
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null)
  const [resolucaoDialogOpen, setResolucaoDialogOpen] = useState(false)
  const [ignorarDialogOpen, setIgnorarDialogOpen] = useState(false)
  const [observacao, setObservacao] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    carregarDashboard()
    carregarAlertas()
  }, [page])

  const carregarDashboard = async () => {
    try {
      const response = await api.get('/alertas/dashboard')
      setData(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    }
  }

  const carregarAlertas = async () => {
    try {
      setLoading(true)
      const response = await api.get('/alertas', {
        params: { page, limit: 10 }
      })
      setAlertas(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar alertas',
        description: 'Não foi possível carregar a lista de alertas.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolver = async () => {
    if (!selectedAlerta) return

    try {
      setProcessing(true)
      await api.patch(`/alertas/${selectedAlerta.id}/status`, {
        status: 'resolvido',
        observacao
      })

      toast({
        title: 'Alerta resolvido',
        description: 'O alerta foi marcado como resolvido.'
      })

      carregarDashboard()
      carregarAlertas()
      setResolucaoDialogOpen(false)
      setSelectedAlerta(null)
      setObservacao('')
    } catch (error) {
      toast({
        title: 'Erro ao resolver',
        description: 'Não foi possível resolver o alerta.',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleIgnorar = async () => {
    if (!selectedAlerta) return

    try {
      setProcessing(true)
      await api.post(`/alertas/${selectedAlerta.id}/ignorar`, {
        motivo: observacao
      })

      toast({
        title: 'Alerta ignorado',
        description: 'O alerta foi ignorado.'
      })

      carregarDashboard()
      carregarAlertas()
      setIgnorarDialogOpen(false)
      setSelectedAlerta(null)
      setObservacao('')
    } catch (error) {
      toast({
        title: 'Erro ao ignorar',
        description: 'Não foi possível ignorar o alerta.',
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'combustivel':
        return <Fuel className="h-4 w-4" />
      case 'manutencao':
        return <Wrench className="h-4 w-4" />
      case 'estoque':
        return <Package className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getGravidadeBadge = (gravidade: string) => {
    const variants = {
      alta: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      baixa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
    return variants[gravidade as keyof typeof variants] || ''
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      resolvido: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      ignorado: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'resolvido':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'ignorado':
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const totalPendentes = data?.totais.find(t => t.status === 'pendente')?._count || 0

  return (
    <>

      
      <main className="flex-1 overflow-y-auto bg-background">

        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Alertas
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitore e gerencie alertas do sistema
              </p>
            </div>

            <Link href="/app-empresa/alertas/configuracoes">
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
            </Link>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pendentes</p>
                    <p className="text-2xl font-bold text-red-600">{totalPendentes}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600/30" />
                </div>
              </CardContent>
            </Card>

            {data?.porGravidade.map((item) => (
              <Card key={item.gravidade}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground capitalize">{item.gravidade}</p>
                      <p className="text-2xl font-bold">{item._count}</p>
                    </div>
                    <AlertTriangle className={`h-8 w-8 ${
                      item.gravidade === 'alta' ? 'text-red-600/30' :
                      item.gravidade === 'media' ? 'text-yellow-600/30' :
                      'text-green-600/30'
                    }`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="todos" className="space-y-6">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="combustivel">Combustível</TabsTrigger>
              <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
              <TabsTrigger value="estoque">Estoque</TabsTrigger>
            </TabsList>

            <TabsContent value="todos">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Alertas</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                      ))}
                    </div>
                  ) : alertas.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Nenhum alerta encontrado
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Não há alertas no momento
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {alertas.map((alerta, index) => (
                        <motion.div
                          key={alerta.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-lg border hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {getStatusIcon(alerta.status)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getTipoIcon(alerta.tipo)}
                                  <h3 className="font-semibold">{alerta.titulo}</h3>
                                  <Badge className={getGravidadeBadge(alerta.gravidade)}>
                                    {alerta.gravidade}
                                  </Badge>
                                  <Badge className={getStatusBadge(alerta.status)}>
                                    {alerta.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {alerta.descricao}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{formatDateTime(alerta.createdAt)}</span>
                                  {alerta.equipamento && (
                                    <span>Equipamento: {alerta.equipamento.tag}</span>
                                  )}
                                  {alerta.itemEstoque && (
                                    <span>Item: {alerta.itemEstoque.nome}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/app-empresa/alertas/${alerta.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              
                              {alerta.status === 'pendente' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-green-600"
                                    onClick={() => {
                                      setSelectedAlerta(alerta)
                                      setResolucaoDialogOpen(true)
                                    }}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-600"
                                    onClick={() => {
                                      setSelectedAlerta(alerta)
                                      setIgnorarDialogOpen(true)
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Página {page} de {totalPages}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="combustivel">
              <Card>
                <CardHeader>
                  <CardTitle>Alertas de Combustível</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href="/app-empresa/alertas/combustivel">
                    <Button variant="outline" className="w-full">
                      Ver todos os alertas de combustível
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manutencao">
              <Card>
                <CardHeader>
                  <CardTitle>Alertas de Manutenção</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href="/app-empresa/alertas/manutencao">
                    <Button variant="outline" className="w-full">
                      Ver todos os alertas de manutenção
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="estoque">
              <Card>
                <CardHeader>
                  <CardTitle>Alertas de Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href="/app-empresa/alertas/estoque">
                    <Button variant="outline" className="w-full">
                      Ver todos os alertas de estoque
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </main>

      {/* Modal de Resolução */}
      <Dialog open={resolucaoDialogOpen} onOpenChange={setResolucaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta</DialogTitle>
            <DialogDescription>
              Adicione uma observação sobre como o alerta foi resolvido.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Observação (opcional)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setResolucaoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleResolver} disabled={processing}>
              {processing ? 'Resolvendo...' : 'Resolver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Ignorar */}
      <Dialog open={ignorarDialogOpen} onOpenChange={setIgnorarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ignorar Alerta</DialogTitle>
            <DialogDescription>
              Adicione um motivo para ignorar este alerta.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Motivo (opcional)"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIgnorarDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={handleIgnorar} disabled={processing}>
              {processing ? 'Ignorando...' : 'Ignorar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}