'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Package,
  Edit,
  Trash2,
  Wrench,
  History,
  Clock,
  DollarSign,
  Activity,
  Truck,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

interface Equipamento {
  id: number
  tag: string
  nome: string
  tipo: string
  marca: string
  modelo: string
  anoFabricacao: number
  numeroSerie: string
  placa?: string
  horaAtual: number
  kmAtual?: number
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'inativo'
  obra?: {
    id: number
    nome: string
    codigo: string
  }
  frenteServico?: {
    id: number
    nome: string
  }
  centroCusto?: {
    id: number
    nome: string
    codigo: string
  }
  valorAquisicao?: number
  valorDepreciacaoAnual?: number
  dataAquisicao?: string
  vidaUtilAnos?: number
  valorResidual?: number
  valorLocacaoDiaria?: number
  valorLocacaoMensal?: number
  comOperador: boolean
  planoManutencao?: string
  manutencoes: any[]
  apontamentos: any[]
  historico: any[]
  createdAt: string
  updatedAt: string
}

export default function EquipamentoDetalhePage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [equipamento, setEquipamento] = useState<Equipamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [novoStatus, setNovoStatus] = useState<string>('')
  const [observacao, setObservacao] = useState('')

  useEffect(() => {
    carregarEquipamento()
  }, [params.id])

  const carregarEquipamento = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/equipamentos/${params.id}`)
      setEquipamento(response.data)
      setNovoStatus(response.data.status)
    } catch (error) {
      toast({
        title: 'Erro ao carregar equipamento',
        description: 'Não foi possível carregar os dados do equipamento.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!equipamento || !novoStatus || novoStatus === equipamento.status) {
      setStatusDialogOpen(false)
      return
    }

    try {
      setUpdatingStatus(true)
      await api.patch(`/equipamentos/${equipamento.id}/status`, {
        status: novoStatus,
        observacao
      })

      toast({
        title: 'Status atualizado',
        description: `Status alterado para ${getStatusLabel(novoStatus)}.`
      })

      carregarEquipamento()
      setStatusDialogOpen(false)
      setObservacao('')
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

  const handleDelete = async () => {
    if (!equipamento) return

    try {
      setDeleting(true)
      await api.delete(`/equipamentos/${equipamento.id}`)
      
      toast({
        title: 'Equipamento excluído',
        description: 'O equipamento foi excluído com sucesso.'
      })

      window.location.href = '/app-empresa/equipamentos'
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.response?.data?.error || 'Não foi possível excluir o equipamento.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      disponivel: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      em_uso: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      manutencao: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      inativo: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      disponivel: 'Disponível',
      em_uso: 'Em Uso',
      manutencao: 'Em Manutenção',
      inativo: 'Inativo'
    }
    return labels[status as keyof typeof labels] || status
  }


  const calcularDepreciacaoMensal = () => {
    if (!equipamento?.valorAquisicao || !equipamento?.vidaUtilAnos) return 0
    const valorDepreciavel = equipamento.valorAquisicao - (equipamento.valorResidual || 0)
    return valorDepreciavel / (equipamento.vidaUtilAnos * 12)
  }

  const calcularDepreciacaoAcumulada = () => {
    if (!equipamento?.dataAquisicao || !equipamento?.vidaUtilAnos) return 0
    const meses = Math.floor((new Date().getTime() - new Date(equipamento.dataAquisicao).getTime()) / (1000 * 60 * 60 * 24 * 30))
    return calcularDepreciacaoMensal() * Math.min(meses, equipamento.vidaUtilAnos * 12)
  }

  const calcularValorAtual = () => {
    if (!equipamento?.valorAquisicao) return 0
    return equipamento.valorAquisicao - calcularDepreciacaoAcumulada()
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
              <div className="h-32 bg-muted rounded-lg animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </Container>
        </main>
      </>
    )
  }

  if (!equipamento) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Equipamento não encontrado" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Equipamento não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O equipamento que você está procurando não existe ou foi removido.
              </p>
              <Link href="/app-empresa/equipamentos">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para equipamentos
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
        <Header title={equipamento.nome} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb e ações */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link
              href="/app-empresa/equipamentos"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para equipamentos
            </Link>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStatusDialogOpen(true)}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Alterar Status
                </Button>

                <Link href={`/app-empresa/equipamentos/${equipamento.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
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

          {/* Header do equipamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20" />
              <CardContent className="relative p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center -mt-12 border-4 border-background">
                    <Package className="h-10 w-10 text-primary" />
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div>
                        <h1 className="text-3xl font-bold">{equipamento.nome}</h1>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusBadge(equipamento.status)}>
                            {getStatusLabel(equipamento.status)}
                          </Badge>
                          <Badge variant="outline" className="font-mono">
                            {equipamento.tag}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      {equipamento.horaAtual.toLocaleString()} h
                    </div>
                    {equipamento.kmAtual && (
                      <div className="text-sm text-muted-foreground mt-1">
                        <Truck className="h-4 w-4 inline mr-1" />
                        {equipamento.kmAtual.toLocaleString()} km
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList>
              <TabsTrigger value="info">
                <Package className="h-4 w-4 mr-2" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="manutencoes">
                <Wrench className="h-4 w-4 mr-2" />
                Manutenções
              </TabsTrigger>
              <TabsTrigger value="historico">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="financeiro">
                <DollarSign className="h-4 w-4 mr-2" />
                Financeiro
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Dados do Equipamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Tag
                        </label>
                        <p className="font-mono">{equipamento.tag}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Número de Série
                        </label>
                        <p className="font-mono">{equipamento.numeroSerie}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Tipo
                        </label>
                        <p>{equipamento.tipo}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Marca/Modelo
                        </label>
                        <p>{equipamento.marca} {equipamento.modelo}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Ano de Fabricação
                        </label>
                        <p>{equipamento.anoFabricacao}</p>
                      </div>
                      {equipamento.placa && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Placa
                          </label>
                          <p className="font-mono">{equipamento.placa}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Localização</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {equipamento.obra ? (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Obra
                        </label>
                        <p className="font-medium">{equipamento.obra.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Código: {equipamento.obra.codigo}
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Não alocado</p>
                    )}

                    {equipamento.frenteServico && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Frente de Serviço
                        </label>
                        <p>{equipamento.frenteServico.nome}</p>
                      </div>
                    )}

                    {equipamento.centroCusto && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Centro de Custo
                        </label>
                        <p>{equipamento.centroCusto.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          Código: {equipamento.centroCusto.codigo}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="manutencoes">
              <Card>
                <CardHeader>
                  <CardTitle>Manutenções</CardTitle>
                </CardHeader>
                <CardContent>
                  {equipamento.manutencoes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma manutenção registrada
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {equipamento.manutencoes.map((manutencao, index) => (
                        <motion.div
                          key={manutencao.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-lg border hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Wrench className="h-4 w-4 text-primary" />
                              <span className="font-medium">{manutencao.tipo}</span>
                              <Badge variant="outline">{manutencao.status}</Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(manutencao.dataProgramada, 'dd/MM/yyyy')}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {manutencao.descricao}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historico">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico do Equipamento</CardTitle>
                </CardHeader>
                <CardContent>
                  {equipamento.historico.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum histórico registrado
                    </p>
                  ) : (
                    <div className="relative pl-8 space-y-4">
                      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary to-accent" />
                      {equipamento.historico.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative"
                        >
                          <div className="absolute -left-8 top-2 w-4 h-4 rounded-full bg-primary" />
                          <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{item.tipo}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDateTime(item.data)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.descricao}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Por: {item.usuario?.nome}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="financeiro">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Valores</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor de Aquisição</span>
                      <span className="font-medium">{formatCurrency(equipamento.valorAquisicao || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor Residual</span>
                      <span className="font-medium">{formatCurrency(equipamento.valorResidual || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vida Útil</span>
                      <span className="font-medium">{equipamento.vidaUtilAnos} anos</span>
                    </div>
                    <div className="flex justify-between pt-4 border-t">
                      <span className="font-medium">Valor Atual</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(calcularValorAtual())}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Locação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {equipamento.valorLocacaoDiaria && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Diária</span>
                        <span className="font-medium">{formatCurrency(equipamento.valorLocacaoDiaria)}</span>
                      </div>
                    )}
                    {equipamento.valorLocacaoMensal && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mensal</span>
                        <span className="font-medium">{formatCurrency(equipamento.valorLocacaoMensal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Com Operador</span>
                      <Badge variant={equipamento.comOperador ? 'default' : 'secondary'}>
                        {equipamento.comOperador ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </main>

      {/* Modal de alteração de status */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status do Equipamento</DialogTitle>
            <DialogDescription>
              Selecione o novo status para o equipamento {equipamento.tag}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={novoStatus} onValueChange={setNovoStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponivel">Disponível</SelectItem>
                  <SelectItem value="em_uso">Em Uso</SelectItem>
                  <SelectItem value="manutencao">Em Manutenção</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observação (opcional)</label>
              <textarea
                className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                placeholder="Motivo da alteração de status..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={updatingStatus || !novoStatus || novoStatus === equipamento.status}
            >
              {updatingStatus ? 'Atualizando...' : 'Atualizar Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Equipamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o equipamento {equipamento.tag} - {equipamento.nome}?
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