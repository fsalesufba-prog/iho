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
  TrendingUp,
  AlertCircle,
  CheckCircle2,
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
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface ItemEstoque {
  id: number
  nome: string
  codigo: string
  descricao?: string
  categoria: string
  unidade: 'un' | 'kg' | 'l' | 'm' | 'cx' | 'pc'
  estoqueMinimo: number
  estoqueMaximo: number
  estoqueAtual: number
  valorUnitario?: number
  localizacao?: string
  createdAt: string
  updatedAt: string
  alerta?: string | null
  movimentos: Array<{
    id: number
    tipo: 'entrada' | 'saida' | 'ajuste'
    quantidade: number
    valorUnitario?: number
    valorTotal?: number
    data: string
    observacao?: string
    equipamento?: {
      id: number
      tag: string
      nome: string
    }
    usuario: {
      id: number
      nome: string
    }
  }>
}

export default function DetalheItemPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [item, setItem] = useState<ItemEstoque | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarItem()
  }, [params.id])

  const carregarItem = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/almoxarifado/${params.id}`)
      setItem(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar item',
        description: 'Não foi possível carregar os dados do item.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!item) return

    try {
      setDeleting(true)
      await api.delete(`/almoxarifado/${item.id}`)
      
      toast({
        title: 'Item excluído',
        description: 'O item foi excluído com sucesso.'
      })

      window.location.href = '/app-empresa/almoxarifado/estoque'
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.response?.data?.error || 'Não foi possível excluir o item.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const getAlertaBadge = (alerta: string | null) => {
    if (alerta === 'critico') {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Crítico</Badge>
    }
    if (alerta === 'atencao') {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Atenção</Badge>
    }
    return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Normal</Badge>
  }

  const getAlertaIcon = (alerta: string | null) => {
    if (alerta === 'critico') {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }
    if (alerta === 'atencao') {
      return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
    return <CheckCircle2 className="h-5 w-5 text-green-600" />
  }

  const getUnidadeLabel = (unidade: string) => {
    const labels = {
      un: 'Unidade',
      kg: 'Quilograma',
      l: 'Litro',
      m: 'Metro',
      cx: 'Caixa',
      pc: 'Peça'
    }
    return labels[unidade as keyof typeof labels] || unidade
  }

  const getTipoMovimentacaoBadge = (tipo: string) => {
    const variants = {
      entrada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      saida: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      ajuste: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return variants[tipo as keyof typeof variants] || ''
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

  if (!item) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Item não encontrado" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Item não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O item que você está procurando não existe ou foi removido.
              </p>
              <Link href="/app-empresa/almoxarifado/estoque">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para estoque
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
        <Header title={item.nome} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb e ações */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link
              href="/app-empresa/almoxarifado/estoque"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para estoque
            </Link>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <div className="flex gap-2">
                <Link href={`/app-empresa/almoxarifado/estoque/${item.id}/movimentacoes`}>
                  <Button variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Movimentações
                  </Button>
                </Link>

                <Link href={`/app-empresa/almoxarifado/estoque/${item.id}/editar`}>
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

          {/* Header do Item */}
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
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{item.nome}</h1>
                        {getAlertaBadge(item.alerta || null)}
                      </div>
                      <p className="text-muted-foreground">{item.descricao}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">{item.categoria}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Código: {item.codigo}
                        </span>
                      </div>
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
              <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Detalhes do Item */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Detalhes do Item</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Código</p>
                        <p className="font-mono">{item.codigo}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Categoria</p>
                        <p>{item.categoria}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Unidade</p>
                        <p>{getUnidadeLabel(item.unidade)}</p>
                      </div>
                      {item.localizacao && (
                        <div>
                          <p className="text-sm text-muted-foreground">Localização</p>
                          <p>{item.localizacao}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Unitário</p>
                        <p className="font-bold">
                          {item.valorUnitario ? formatCurrency(item.valorUnitario) : 'Não informado'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Status do Estoque */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status do Estoque</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Estoque Atual</span>
                      <span className="text-2xl font-bold">{item.estoqueAtual} {item.unidade}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Estoque Mínimo</span>
                      <span className="font-medium">{item.estoqueMinimo} {item.unidade}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Estoque Máximo</span>
                      <span className="font-medium">{item.estoqueMaximo} {item.unidade}</span>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2">
                        {getAlertaIcon(item.alerta || null)}
                        <span className="font-medium">Status:</span>
                        {getAlertaBadge(item.alerta || null)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="movimentacoes">
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Movimentações</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.movimentos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma movimentação registrada
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {item.movimentos.map((mov, index) => (
                        <motion.div
                          key={mov.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-lg border"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getTipoMovimentacaoBadge(mov.tipo)}>
                                {mov.tipo.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDateTime(mov.data)}
                              </span>
                            </div>
                            <span className="font-bold">
                              {mov.tipo === 'entrada' ? '+' : '-'} {mov.quantidade} {item.unidade}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            {mov.valorUnitario && (
                              <div>
                                <span className="text-muted-foreground">Valor unitário:</span>
                                <span className="ml-2 font-medium">{formatCurrency(mov.valorUnitario)}</span>
                              </div>
                            )}
                            {mov.valorTotal && (
                              <div>
                                <span className="text-muted-foreground">Valor total:</span>
                                <span className="ml-2 font-medium">{formatCurrency(mov.valorTotal)}</span>
                              </div>
                            )}
                          </div>

                          {mov.equipamento && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Equipamento:</span>
                              <Link 
                                href={`/app-empresa/equipamentos/${mov.equipamento.id}`}
                                className="ml-2 text-primary hover:underline"
                              >
                                {mov.equipamento.tag} - {mov.equipamento.nome}
                              </Link>
                            </div>
                          )}

                          {mov.observacao && (
                            <div className="mt-2 text-sm">
                              <span className="text-muted-foreground">Observação:</span>
                              <p className="mt-1">{mov.observacao}</p>
                            </div>
                          )}

                          <div className="mt-2 text-xs text-muted-foreground">
                            Registrado por: {mov.usuario.nome}
                          </div>
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
                  <CardTitle>Histórico do Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Criado em:</span>
                      <span>{formatDateTime(item.createdAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Última atualização:</span>
                      <span>{formatDateTime(item.updatedAt)}</span>
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
            <DialogTitle>Excluir item</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o item "{item.nome}"?
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