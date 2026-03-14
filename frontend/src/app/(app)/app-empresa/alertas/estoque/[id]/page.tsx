'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Package,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Check,
  X,
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
import { formatDateTime } from '@/lib/utils'

interface AlertaEstoque {
  id: number
  titulo: string
  descricao: string
  gravidade: 'baixa' | 'media' | 'alta'
  status: 'pendente' | 'resolvido' | 'ignorado'
  valor?: number
  limite?: number
  createdAt: string
  resolvidoEm?: string
  observacaoResolucao?: string
  itemEstoque: {
    id: number
    nome: string
    codigo: string
    categoria: string
    estoqueAtual: number
    estoqueMinimo: number
    unidade: string
  }
}

export default function DetalheAlertaEstoquePage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [alerta, setAlerta] = useState<AlertaEstoque | null>(null)
  const [loading, setLoading] = useState(true)
  const [resolucaoDialogOpen, setResolucaoDialogOpen] = useState(false)
  const [ignorarDialogOpen, setIgnorarDialogOpen] = useState(false)
  const [observacao, setObservacao] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    carregarAlerta()
  }, [params.id])

  const carregarAlerta = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/alertas/${params.id}`)
      setAlerta(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar alerta',
        description: 'Não foi possível carregar os dados do alerta.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolver = async () => {
    if (!alerta) return

    try {
      setProcessing(true)
      await api.patch(`/alertas/${alerta.id}/status`, {
        status: 'resolvido',
        observacao
      })

      toast({
        title: 'Alerta resolvido',
        description: 'O alerta foi marcado como resolvido.'
      })

      carregarAlerta()
      setResolucaoDialogOpen(false)
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
    if (!alerta) return

    try {
      setProcessing(true)
      await api.post(`/alertas/${alerta.id}/ignorar`, {
        motivo: observacao
      })

      toast({
        title: 'Alerta ignorado',
        description: 'O alerta foi ignorado.'
      })

      carregarAlerta()
      setIgnorarDialogOpen(false)
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
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case 'resolvido':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'ignorado':
        return <XCircle className="h-5 w-5 text-gray-600" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <>

        <main className="flex-1 overflow-y-auto bg-background">

          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </Container>
        </main>
      </>
    )
  }

  if (!alerta) {
    return (
      <>

        <main className="flex-1 overflow-y-auto bg-background">

          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Alerta não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O alerta que você está procurando não existe.
              </p>
              <Link href="/app-empresa/alertas/estoque">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para alertas
                </Button>
              </Link>
            </div>
          </Container>
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title={`Alerta #${alerta.id}`} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/alertas/estoque"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para alertas
            </Link>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {getStatusIcon(alerta.status)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{alerta.titulo}</h1>
                        <Badge className={getGravidadeBadge(alerta.gravidade)}>
                          {alerta.gravidade}
                        </Badge>
                        <Badge className={getStatusBadge(alerta.status)}>
                          {alerta.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{alerta.descricao}</p>
                    </div>
                  </div>
                  
                  {alerta.status === 'pendente' && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => setResolucaoDialogOpen(true)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Resolver
                      </Button>
                      <Button
                        variant="outline"
                        className="text-gray-600 border-gray-600 hover:bg-gray-50"
                        onClick={() => setIgnorarDialogOpen(true)}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Ignorar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Alerta */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Alerta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Criado em</p>
                    <p className="font-medium">{formatDateTime(alerta.createdAt)}</p>
                  </div>
                  {alerta.resolvidoEm && (
                    <div>
                      <p className="text-sm text-muted-foreground">Resolvido em</p>
                      <p className="font-medium">{formatDateTime(alerta.resolvidoEm)}</p>
                    </div>
                  )}
                </div>

                {alerta.valor !== undefined && alerta.limite !== undefined && (
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Situação do Estoque</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Atual:</span>
                      <span className="text-lg font-bold text-red-600">
                        {alerta.valor} {alerta.itemEstoque.unidade}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-muted-foreground">Mínimo:</span>
                      <span className="text-lg font-bold">
                        {alerta.limite} {alerta.itemEstoque.unidade}
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500"
                        style={{ width: `${(alerta.valor / alerta.limite) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {alerta.observacaoResolucao && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Observação</p>
                    <p className="p-3 bg-muted/30 rounded-lg">{alerta.observacaoResolucao}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações do Item */}
            <Card>
              <CardHeader>
                <CardTitle>Item de Estoque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Package className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{alerta.itemEstoque.nome}</p>
                    <p className="text-sm text-muted-foreground">{alerta.itemEstoque.codigo}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Categoria</p>
                    <p className="font-medium">{alerta.itemEstoque.categoria}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unidade</p>
                    <p className="font-medium">{alerta.itemEstoque.unidade}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Estoque Atual</p>
                    <p className="text-xl font-bold text-red-600">
                      {alerta.itemEstoque.estoqueAtual} {alerta.itemEstoque.unidade}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estoque Mínimo</p>
                    <p className="text-xl font-bold">
                      {alerta.itemEstoque.estoqueMinimo} {alerta.itemEstoque.unidade}
                    </p>
                  </div>
                </div>

                <Link href={`/app-empresa/almoxarifado/estoque/${alerta.itemEstoque.id}`}>
                  <Button variant="outline" className="w-full">
                    Ver detalhes do item
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
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