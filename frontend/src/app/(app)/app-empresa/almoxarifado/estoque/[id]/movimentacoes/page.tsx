'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Package,
  Plus,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
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

interface Movimentacao {
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
  estoque: {
    id: number
    nome: string
    codigo: string
    unidade: string
  }
}

export default function MovimentacoesItemPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [novaMovimentacaoOpen, setNovaMovimentacaoOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Formulário de nova movimentação
  const [formData, setFormData] = useState({
    tipo: 'entrada',
    quantidade: 1,
    valorUnitario: '',
    equipamentoId: '',
    observacao: ''
  })

  useEffect(() => {
    carregarMovimentacoes()
  }, [params.id, page, tipoFiltro, dataInicio, dataFim])

  const carregarMovimentacoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/movimentacoes', {
        params: {
          page,
          limit: 10,
          itemId: params.id,
          tipo: tipoFiltro !== 'todos' ? tipoFiltro : undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined
        }
      })
      setMovimentacoes(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar movimentações',
        description: 'Não foi possível carregar as movimentações.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNovaMovimentacao = async () => {
    try {
      setSaving(true)
      
      await api.post(`/almoxarifado/${params.id}/movimentacoes`, {
        tipo: formData.tipo,
        quantidade: formData.quantidade,
        valorUnitario: formData.valorUnitario ? parseFloat(formData.valorUnitario) : undefined,
        equipamentoId: formData.equipamentoId ? parseInt(formData.equipamentoId) : undefined,
        observacao: formData.observacao
      })

      toast({
        title: 'Movimentação registrada',
        description: 'A movimentação foi registrada com sucesso.'
      })

      setNovaMovimentacaoOpen(false)
      setFormData({
        tipo: 'entrada',
        quantidade: 1,
        valorUnitario: '',
        equipamentoId: '',
        observacao: ''
      })
      carregarMovimentacoes()
    } catch (error: any) {
      toast({
        title: 'Erro ao registrar',
        description: error.response?.data?.error || 'Não foi possível registrar a movimentação.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      entrada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      saida: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      ajuste: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return variants[tipo as keyof typeof variants] || ''
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Movimentações do Item" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href={`/app-empresa/almoxarifado/estoque/${params.id}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o item
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Movimentações
              </h1>
              <p className="text-muted-foreground mt-1">
                Histórico de movimentações do item
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Button onClick={() => setNovaMovimentacaoOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Movimentação
              </Button>
            )}
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="entrada">Entrada</SelectItem>
                    <SelectItem value="saida">Saída</SelectItem>
                    <SelectItem value="ajuste">Ajuste</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Data inicial"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-[180px]"
                />

                <Input
                  type="date"
                  placeholder="Data final"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-[180px]"
                />

                <Button variant="outline" onClick={carregarMovimentacoes}>
                  <RefreshCw className="h-4 w-4" />
                </Button>

                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Movimentações */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : movimentacoes.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma movimentação encontrada
                </p>
              ) : (
                <div className="space-y-4">
                  {movimentacoes.map((mov, index) => (
                    <motion.div
                      key={mov.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={getTipoBadge(mov.tipo)}>
                            {mov.tipo.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDateTime(mov.data)}
                          </span>
                        </div>
                        <span className={`text-lg font-bold ${
                          mov.tipo === 'entrada' ? 'text-green-600' :
                          mov.tipo === 'saida' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {mov.tipo === 'entrada' ? '+' : mov.tipo === 'saida' ? '-' : '±'} 
                          {mov.quantidade} {mov.estoque.unidade}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {mov.valorUnitario && (
                          <div>
                            <span className="text-muted-foreground">Valor unitário:</span>
                            <p className="font-medium">{formatCurrency(mov.valorUnitario)}</p>
                          </div>
                        )}
                        {mov.valorTotal && (
                          <div>
                            <span className="text-muted-foreground">Valor total:</span>
                            <p className="font-medium">{formatCurrency(mov.valorTotal)}</p>
                          </div>
                        )}
                        {mov.equipamento && (
                          <div>
                            <span className="text-muted-foreground">Equipamento:</span>
                            <Link 
                              href={`/app-empresa/equipamentos/${mov.equipamento.id}`}
                              className="font-medium text-primary hover:underline"
                            >
                              {mov.equipamento.tag}
                            </Link>
                          </div>
                        )}
                      </div>

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

      {/* Modal Nova Movimentação */}
      <Dialog open={novaMovimentacaoOpen} onOpenChange={setNovaMovimentacaoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Movimentação</DialogTitle>
            <DialogDescription>
              Registre uma entrada, saída ou ajuste no estoque
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantidade</label>
              <Input
                type="number"
                min="1"
                value={formData.quantidade}
                onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valor Unitário (opcional)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.valorUnitario}
                onChange={(e) => setFormData({ ...formData, valorUnitario: e.target.value })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Equipamento (opcional)</label>
              <Input
                placeholder="ID do equipamento"
                value={formData.equipamentoId}
                onChange={(e) => setFormData({ ...formData, equipamentoId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Observação</label>
              <Input
                value={formData.observacao}
                onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                placeholder="Motivo da movimentação..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaMovimentacaoOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNovaMovimentacao} disabled={saving}>
              {saving ? 'Registrando...' : 'Registrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}