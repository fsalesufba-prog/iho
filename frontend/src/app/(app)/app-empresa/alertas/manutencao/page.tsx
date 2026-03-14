'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Wrench,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react'

import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
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
import { formatDateTime, formatDate } from '@/lib/utils'

interface AlertaManutencao {
  id: number
  titulo: string
  descricao: string
  gravidade: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'resolvido' | 'ignorado'
  diasRestantes?: number
  diasAtraso?: number
  dataReferencia?: string
  createdAt: string
  equipamento: {
    id: number
    tag: string
    nome: string
    modelo: string
  }
}

export default function AlertasManutencaoPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [alertas, setAlertas] = useState<AlertaManutencao[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAlerta, setSelectedAlerta] = useState<AlertaManutencao | null>(null)
  const [resolucaoDialogOpen, setResolucaoDialogOpen] = useState(false)
  const [ignorarDialogOpen, setIgnorarDialogOpen] = useState(false)
  const [observacao, setObservacao] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    carregarAlertas()
  }, [page])

  const carregarAlertas = async () => {
    try {
      setLoading(true)
      const response = await api.get('/alertas/manutencao', {
        params: { page, limit: 10 }
      })
      setAlertas(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar alertas',
        description: 'Não foi possível carregar os alertas de manutenção.',
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
        return <Wrench className="h-4 w-4" />
    }
  }

  return (
    <>

      
      <main className="flex-1 overflow-y-auto bg-background">
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/alertas"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Alertas
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Alertas de Manutenção
              </h1>
              <p className="text-muted-foreground mt-1">
                Monitore manutenções programadas e atrasadas
              </p>
            </div>

            <Button variant="outline" onClick={carregarAlertas} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Lista de Alertas */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas Pendentes</CardTitle>
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
                  <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum alerta de manutenção
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Não há alertas de manutenção no momento
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
                              <Wrench className="h-4 w-4" />
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
                            <div className="grid grid-cols-2 gap-4 mb-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Equipamento:</span>
                                <span className="ml-2 font-medium">{alerta.equipamento.tag}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Modelo:</span>
                                <span className="ml-2">{alerta.equipamento.modelo}</span>
                              </div>
                              {alerta.dataReferencia && (
                                <div>
                                  <span className="text-muted-foreground">Data:</span>
                                  <span className="ml-2">{formatDate(alerta.dataReferencia, 'dd/MM/yyyy')}</span>
                                </div>
                              )}
                              {alerta.diasRestantes !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">Dias restantes:</span>
                                  <span className="ml-2 font-bold text-yellow-600">{alerta.diasRestantes}</span>
                                </div>
                              )}
                              {alerta.diasAtraso !== undefined && (
                                <div>
                                  <span className="text-muted-foreground">Dias atrasado:</span>
                                  <span className="ml-2 font-bold text-red-600">{alerta.diasAtraso}</span>
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(alerta.createdAt)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/app-empresa/alertas/manutencao/${alerta.id}`}>
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
        </Container>
      </main>

      {/* Modal de Resolução */}
      <Dialog open={resolucaoDialogOpen} onOpenChange={setResolucaoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolver Alerta de Manutenção</DialogTitle>
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
            <DialogTitle>Ignorar Alerta de Manutenção</DialogTitle>
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