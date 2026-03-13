'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Wrench,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  Package,
  FileText,
  Tag,
  Activity,
  Play,
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

interface Manutencao {
  id: number
  tipo: 'preventiva' | 'corretiva' | 'preditiva'
  dataProgramada: string
  dataRealizada?: string
  descricao: string
  observacoes?: string
  horasEquipamento: number
  custo?: number
  status: 'programada' | 'em_andamento' | 'concluida' | 'cancelada'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  equipamento: {
    id: number
    tag: string
    nome: string
    modelo: string
    marca: string
    horaAtual: number
    status: string
    obra?: {
      id: number
      nome: string
    }
  }
  itens: Array<{
    id: number
    descricao: string
    quantidade: number
    valorUnitario?: number
    tipo: 'servico' | 'peca' | 'insumo'
  }>
  createdAt: string
  updatedAt: string
}

export default function DetalheManutencaoPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [manutencao, setManutencao] = useState<Manutencao | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    carregarManutencao()
  }, [params.id])

  const carregarManutencao = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/manutencoes/${params.id}`)
      setManutencao(response.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar manutenção',
        description: 'Não foi possível carregar os dados da manutenção.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!manutencao) return

    try {
      setDeleting(true)
      await api.delete(`/manutencoes/${manutencao.id}`)
      
      toast({
        title: 'Manutenção excluída',
        description: 'A manutenção foi excluída com sucesso.'
      })

      window.location.href = '/app-empresa/manutencao'
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a manutenção.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleStatusChange = async (novoStatus: string) => {
    if (!manutencao) return

    try {
      setUpdatingStatus(true)
      await api.patch(`/manutencoes/${manutencao.id}/status`, { status: novoStatus })
      
      toast({
        title: 'Status atualizado',
        description: `Status alterado para ${novoStatus}.`
      })

      carregarManutencao()
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Não foi possível atualizar o status.',
        variant: 'destructive'
      })
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      preventiva: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      corretiva: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      preditiva: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
    }
    return variants[tipo as keyof typeof variants] || ''
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      programada: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      em_andamento: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      concluida: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelada: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  const getPrioridadeBadge = (prioridade: string) => {
    const variants = {
      baixa: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      critica: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 animate-pulse'
    }
    return variants[prioridade as keyof typeof variants] || ''
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-gray-600" />
      case 'em_andamento':
        return <Activity className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'preventiva':
        return <Calendar className="h-5 w-5 text-blue-600" />
      case 'corretiva':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'preditiva':
        return <TrendingUp className="h-5 w-5 text-purple-600" />
      default:
        return <Wrench className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Carregando..." />
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

  if (!manutencao) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Manutenção não encontrada" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Manutenção não encontrada</h2>
              <p className="text-muted-foreground mb-6">
                A manutenção que você está procurando não existe ou foi removida.
              </p>
              <Link href="/app-empresa/manutencao">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para manutenções
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
        <Header title={`Manutenção #${manutencao.id}`} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb e ações */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link
              href="/app-empresa/manutencao"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para manutenções
            </Link>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <div className="flex gap-2">
                {manutencao.status === 'programada' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('em_andamento')}
                    disabled={updatingStatus}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar
                  </Button>
                )}

                {manutencao.status === 'em_andamento' && (
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange('concluida')}
                    disabled={updatingStatus}
                    className="text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Concluir
                  </Button>
                )}

                <Link href={`/app-empresa/manutencao/${manutencao.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </Link>

                <Link href={`/app-empresa/manutencao/${manutencao.id}/itens`}>
                  <Button variant="outline">
                    <Package className="mr-2 h-4 w-4" />
                    Itens
                  </Button>
                </Link>

                {user?.tipo === 'adm_empresa' && (
                  <Button
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="overflow-hidden">
              <div className={`h-32 ${
                manutencao.tipo === 'preventiva' ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20' :
                manutencao.tipo === 'corretiva' ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20' :
                'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
              }`} />
              <CardContent className="relative p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className={`h-20 w-20 rounded-full ${
                    manutencao.tipo === 'preventiva' ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' :
                    manutencao.tipo === 'corretiva' ? 'bg-gradient-to-br from-red-500/20 to-orange-500/20' :
                    'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
                  } flex items-center justify-center -mt-12 border-4 border-background`}>
                    {getTipoIcon(manutencao.tipo)}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div>
                        <h1 className="text-3xl font-bold">
                          {manutencao.tipo === 'preventiva' ? 'Manutenção Preventiva' :
                           manutencao.tipo === 'corretiva' ? 'Manutenção Corretiva' :
                           'Manutenção Preditiva'}
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getTipoBadge(manutencao.tipo)}>
                            {manutencao.tipo.charAt(0).toUpperCase() + manutencao.tipo.slice(1)}
                          </Badge>
                          <Badge className={getStatusBadge(manutencao.status)}>
                            {manutencao.status === 'em_andamento' ? 'Em Andamento' : 
                             manutencao.status.charAt(0).toUpperCase() + manutencao.status.slice(1)}
                          </Badge>
                          <Badge className={getPrioridadeBadge(manutencao.prioridade)}>
                            Prioridade {manutencao.prioridade}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      <FileText className="h-4 w-4 inline mr-1" />
                      ID: #{manutencao.id}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Criada em: {formatDate(manutencao.createdAt, 'dd/MM/yyyy')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList>
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="itens">Itens</TabsTrigger>
              <TabsTrigger value="equipamento">Equipamento</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes da Manutenção</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Data Programada
                        </label>
                        <p className="text-lg">{formatDate(manutencao.dataProgramada, 'dd/MM/yyyy')}</p>
                      </div>
                      {manutencao.dataRealizada && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Data Realizada
                          </label>
                          <p className="text-lg">{formatDate(manutencao.dataRealizada, 'dd/MM/yyyy')}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Horas do Equipamento
                        </label>
                        <p className="text-lg">{manutencao.horasEquipamento} h</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Custo Total
                        </label>
                        <p className="text-lg font-bold text-primary">
                          {manutencao.custo ? formatCurrency(manutencao.custo) : 'Não informado'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Descrição
                      </label>
                      <p className="mt-1 p-3 bg-muted/30 rounded-lg">{manutencao.descricao}</p>
                    </div>

                    {manutencao.observacoes && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Observações
                        </label>
                        <p className="mt-1 p-3 bg-muted/30 rounded-lg">{manutencao.observacoes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Histórico</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Criado em
                      </label>
                      <p>{formatDateTime(manutencao.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Última atualização
                      </label>
                      <p>{formatDateTime(manutencao.updatedAt)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="itens">
              <Card>
                <CardHeader>
                  <CardTitle>Itens da Manutenção</CardTitle>
                </CardHeader>
                <CardContent>
                  {manutencao.itens.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum item registrado
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {manutencao.itens.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.descricao}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantidade}x {item.tipo}
                            </p>
                          </div>
                          {item.valorUnitario && (
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">
                                Unit: {formatCurrency(item.valorUnitario)}
                              </p>
                              <p className="font-bold">
                                Total: {formatCurrency(item.valorUnitario * item.quantidade)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      {manutencao.custo && (
                        <div className="pt-4 mt-4 border-t flex justify-between items-center">
                          <span className="text-lg font-medium">Custo Total</span>
                          <span className="text-2xl font-bold text-primary">
                            {formatCurrency(manutencao.custo)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equipamento">
              <Card>
                <CardHeader>
                  <CardTitle>Dados do Equipamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-4">
                        <Tag className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-mono">{manutencao.equipamento.tag}</p>
                          <p className="text-sm text-muted-foreground">
                            {manutencao.equipamento.nome}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Marca</label>
                          <p>{manutencao.equipamento.marca}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Modelo</label>
                          <p>{manutencao.equipamento.modelo}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Horas Atuais</label>
                          <p className="text-lg font-bold">{manutencao.equipamento.horaAtual} h</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <Badge>{manutencao.equipamento.status}</Badge>
                        </div>
                      </div>

                      {manutencao.equipamento.obra && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-muted-foreground">Obra</label>
                          <p className="font-medium">{manutencao.equipamento.obra.nome}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-center">
                      <Link href={`/app-empresa/equipamentos/${manutencao.equipamento.id}`}>
                        <Button size="lg">
                          Ver detalhes do equipamento
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Container>
      </main>

      {/* Modal de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir manutenção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta manutenção?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}