'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  TrendingUp
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
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
  alerta?: 'critico' | 'atencao' | 'normal' | null
  percentual?: number
}

export default function EstoquePage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [items, setItems] = useState<ItemEstoque[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todas')
  const [estoqueBaixoFiltro, setEstoqueBaixoFiltro] = useState<boolean>(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedItem, setSelectedItem] = useState<ItemEstoque | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [categorias, setCategorias] = useState<string[]>([])

  useEffect(() => {
    carregarItems()
    carregarCategorias()
  }, [page, categoriaFiltro, estoqueBaixoFiltro, searchTerm])

  const carregarItems = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado', {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
          categoria: categoriaFiltro !== 'todas' ? categoriaFiltro : undefined,
          estoqueBaixo: estoqueBaixoFiltro || undefined
        }
      })
      setItems(response.data.items)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar estoque',
        description: 'Não foi possível carregar os itens do estoque.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/almoxarifado/categorias')
      setCategorias(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const handleDelete = async () => {
    if (!selectedItem) return

    try {
      setDeleting(true)
      await api.delete(`/almoxarifado/${selectedItem.id}`)
      
      toast({
        title: 'Item excluído',
        description: 'O item foi excluído com sucesso.'
      })

      carregarItems()
      setDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.response?.data?.error || 'Não foi possível excluir o item.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setSelectedItem(null)
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
      return <AlertCircle className="h-4 w-4 text-red-600" />
    }
    if (alerta === 'atencao') {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />
    }
    return <CheckCircle2 className="h-4 w-4 text-green-600" />
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

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Estoque" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/almoxarifado"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Almoxarifado
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Estoque
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie todos os itens do estoque
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Link href="/app-empresa/almoxarifado/estoque/novo">
                <Button className="group">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Novo Item
                </Button>
              </Link>
            )}
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      {categorias.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant={estoqueBaixoFiltro ? 'default' : 'outline'}
                    onClick={() => setEstoqueBaixoFiltro(!estoqueBaixoFiltro)}
                    className="whitespace-nowrap"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Estoque Baixo
                  </Button>

                  <Button variant="outline" onClick={carregarItems}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Itens */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Mínimo</TableHead>
                    <TableHead>Máximo</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-32 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-8 w-24 bg-muted rounded animate-pulse ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-12">
                        <div className="flex flex-col items-center">
                          <Package className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">
                            Nenhum item encontrado
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {searchTerm || categoriaFiltro !== 'todas' || estoqueBaixoFiltro
                              ? 'Tente ajustar os filtros'
                              : 'Comece adicionando itens ao estoque'}
                          </p>
                          {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                            <Link href="/app-empresa/almoxarifado/estoque/novo">
                              <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Item
                              </Button>
                            </Link>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-muted/50 transition-colors"
                      >
                        <TableCell>
                          <span className="font-mono text-sm">{item.codigo}</span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.nome}</div>
                            {item.descricao && (
                              <div className="text-xs text-muted-foreground line-clamp-1">
                                {item.descricao}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.categoria}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.estoqueAtual}</span>
                            <span className="text-xs text-muted-foreground">
                              {getUnidadeLabel(item.unidade)}
                            </span>
                          </div>
                          {item.percentual !== undefined && (
                            <div className="w-20 h-1 bg-muted rounded-full mt-1">
                              <div 
                                className={`h-full rounded-full ${
                                  item.estoqueAtual <= item.estoqueMinimo ? 'bg-red-500' :
                                  item.estoqueAtual >= item.estoqueMaximo ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(100, item.percentual)}%` }}
                              />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{item.estoqueMinimo}</TableCell>
                        <TableCell>{item.estoqueMaximo}</TableCell>
                        <TableCell>
                          {item.valorUnitario ? formatCurrency(item.valorUnitario) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getAlertaIcon(item.alerta || null)}
                            {getAlertaBadge(item.alerta || null)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/app-empresa/almoxarifado/estoque/${item.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>

                            <Link href={`/app-empresa/almoxarifado/estoque/${item.id}/movimentacoes`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <TrendingUp className="h-4 w-4" />
                              </Button>
                            </Link>

                            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                              <>
                                <Link href={`/app-empresa/almoxarifado/estoque/${item.id}/editar`}>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>

                                {user?.tipo === 'adm_empresa' && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => {
                                      setSelectedItem(item)
                                      setDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
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

      {/* Modal de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir item</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o item "{selectedItem?.nome}"?
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