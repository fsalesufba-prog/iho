'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Package,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  X,
  Save,
  Wrench
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
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
import { formatCurrency } from '@/lib/utils'

interface ManutencaoItem {
  id: number
  descricao: string
  quantidade: number
  valorUnitario?: number
  tipo: 'servico' | 'peca' | 'insumo'
  createdAt: string
}

interface Manutencao {
  id: number
  tipo: string
  descricao: string
  equipamento: {
    tag: string
    nome: string
  }
  custo?: number
}

export default function ItensManutencaoPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [manutencao, setManutencao] = useState<Manutencao | null>(null)
  const [itens, setItens] = useState<ManutencaoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<ManutencaoItem | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ManutencaoItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Formulário de item
  const [itemForm, setItemForm] = useState({
    descricao: '',
    quantidade: 1,
    valorUnitario: '',
    tipo: 'servico' as 'servico' | 'peca' | 'insumo'
  })

  useEffect(() => {
    carregarDados()
  }, [params.id])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [manutencaoRes, itensRes] = await Promise.all([
        api.get(`/manutencoes/${params.id}`),
        api.get(`/manutencoes/${params.id}/itens`)
      ])
      setManutencao(manutencaoRes.data)
      setItens(itensRes.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os itens da manutenção.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitItem = async () => {
    if (!itemForm.descricao || !itemForm.quantidade) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha a descrição e quantidade do item.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      
      const data = {
        descricao: itemForm.descricao,
        quantidade: itemForm.quantidade,
        valorUnitario: itemForm.valorUnitario ? parseFloat(itemForm.valorUnitario) : null,
        tipo: itemForm.tipo
      }

      if (editItem) {
        // Atualizar item existente
        await api.put(`/manutencoes/${params.id}/itens/${editItem.id}`, data)
        toast({
          title: 'Item atualizado',
          description: 'O item foi atualizado com sucesso.'
        })
      } else {
        // Criar novo item
        await api.post(`/manutencoes/${params.id}/itens`, data)
        toast({
          title: 'Item adicionado',
          description: 'O item foi adicionado com sucesso.'
        })
      }

      setItemDialogOpen(false)
      setEditItem(null)
      setItemForm({
        descricao: '',
        quantidade: 1,
        valorUnitario: '',
        tipo: 'servico'
      })
      carregarDados()
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o item.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return

    try {
      setDeleting(true)
      await api.delete(`/manutencoes/${params.id}/itens/${selectedItem.id}`)
      
      toast({
        title: 'Item excluído',
        description: 'O item foi excluído com sucesso.'
      })

      carregarDados()
      setDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o item.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setSelectedItem(null)
    }
  }

  const openEditDialog = (item: ManutencaoItem) => {
    setEditItem(item)
    setItemForm({
      descricao: item.descricao,
      quantidade: item.quantidade,
      valorUnitario: item.valorUnitario?.toString() || '',
      tipo: item.tipo
    })
    setItemDialogOpen(true)
  }

  const calcularCustoTotal = () => {
    return itens.reduce((total, item) => {
      return total + (item.valorUnitario || 0) * item.quantidade
    }, 0)
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      servico: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      peca: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      insumo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return variants[tipo as keyof typeof variants] || ''
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Itens da Manutenção" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href={`/app-empresa/manutencao/${params.id}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para manutenção
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm">Itens</span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Itens da Manutenção
              </h1>
              {manutencao && (
                <p className="text-muted-foreground mt-1">
                  {manutencao.equipamento.tag} - {manutencao.descricao.substring(0, 50)}...
                </p>
              )}
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Button onClick={() => {
                setEditItem(null)
                setItemForm({
                  descricao: '',
                  quantidade: 1,
                  valorUnitario: '',
                  tipo: 'servico'
                })
                setItemDialogOpen(true)
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Item
              </Button>
            )}
          </div>

          {/* Lista de Itens */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : itens.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum item cadastrado
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione peças, serviços ou insumos utilizados nesta manutenção.
                </p>
                {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                  <Button onClick={() => setItemDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Item
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {itens.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTipoBadge(item.tipo)}>
                              {item.tipo === 'servico' ? 'Serviço' :
                               item.tipo === 'peca' ? 'Peça' : 'Insumo'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {item.quantidade}x
                            </span>
                          </div>
                          <p className="font-medium">{item.descricao}</p>
                          {item.valorUnitario && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Unitário: {formatCurrency(item.valorUnitario)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {item.valorUnitario && (
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(item.valorUnitario * item.quantidade)}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => {
                                setSelectedItem(item)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Total */}
              <Card className="bg-primary/5 border-primary">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Custo Total da Manutenção
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(calcularCustoTotal())}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-primary/30" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </Container>
      </main>

      {/* Modal de Item */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Editar Item' : 'Novo Item'}
            </DialogTitle>
            <DialogDescription>
              {editItem 
                ? 'Edite os dados do item da manutenção.'
                : 'Adicione um novo item à manutenção.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={itemForm.tipo}
                onValueChange={(value: any) => setItemForm({ ...itemForm, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="servico">Serviço</SelectItem>
                  <SelectItem value="peca">Peça</SelectItem>
                  <SelectItem value="insumo">Insumo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={itemForm.descricao}
                onChange={(e) => setItemForm({ ...itemForm, descricao: e.target.value })}
                placeholder="Ex: Troca de óleo, Filtro de ar, Mão de obra..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={itemForm.quantidade}
                  onChange={(e) => setItemForm({ ...itemForm, quantidade: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                <Input
                  id="valorUnitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.valorUnitario}
                  onChange={(e) => setItemForm({ ...itemForm, valorUnitario: e.target.value })}
                  placeholder="0,00"
                />
              </div>
            </div>

            {itemForm.valorUnitario && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span className="font-bold">
                    {formatCurrency(parseFloat(itemForm.valorUnitario) * itemForm.quantidade)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitItem} disabled={saving}>
              {saving ? 'Salvando...' : (editItem ? 'Salvar' : 'Adicionar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir item</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este item?
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