'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  History,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Progress } from '@/components/ui/Progress'
import { EstoqueForm } from './EstoqueForm'
import { EstoqueDetails } from './EstoqueDetails'
import { EstoqueMovimentoForm } from './EstoqueMovimentoForm'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EstoqueItem {
  id: string
  codigo: string
  nome: string
  descricao: string
  categoria: string
  unidade: string
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo: number
  valorUnitario: number
  localizacao: string
  ultimaMovimento: string
  status: 'normal' | 'baixo' | 'critico' | 'excesso'
}

export function EstoqueList() {
  const [itens, setItens] = useState<EstoqueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [status, setStatus] = useState('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedItem, setSelectedItem] = useState<EstoqueItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showMovimento, setShowMovimento] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    carregarItens()
  }, [page, categoria, status])

  const carregarItens = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/estoque', {
        params: {
          page,
          limit: 10,
          categoria: categoria !== 'todas' ? categoria : undefined,
          status: status !== 'todos' ? status : undefined,
          search: search || undefined
        }
      })
      setItens(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os itens',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarItens()
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/almoxarifado/estoque/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Item excluído com sucesso'
      })
      carregarItens()
    } catch (error) {
      console.error('Erro ao excluir item:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o item',
        variant: 'destructive'
      })
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'critico':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Crítico' }
      case 'baixo':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Baixo' }
      case 'excesso':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Excesso' }
      default:
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Normal' }
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestão de Estoque</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por nome ou código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                <SelectItem value="ferramentas">Ferramentas</SelectItem>
                <SelectItem value="pecas">Peças</SelectItem>
                <SelectItem value="insumos">Insumos</SelectItem>
                <SelectItem value="equipamentos">Equipamentos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="baixo">Abaixo do mínimo</SelectItem>
                <SelectItem value="critico">Crítico</SelectItem>
                <SelectItem value="excesso">Acima do máximo</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarItens}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Mín/Máx</TableHead>
                  <TableHead>Valor Unit.</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Nenhum item encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  itens.map((item) => {
                    const statusConfig = getStatusConfig(item.status)
                    const valorTotal = item.estoqueAtual * item.valorUnitario
                    const percentualMinMax = (item.estoqueAtual / item.estoqueMaximo) * 100

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs">{item.codigo}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.nome}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {item.descricao}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{item.categoria}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{item.estoqueAtual} {item.unidade}</span>
                              <span className="text-xs text-muted-foreground">
                                {Math.round(percentualMinMax)}%
                              </span>
                            </div>
                            <Progress 
                              value={percentualMinMax}
                              className="h-1.5"
                              indicatorClassName={
                                item.status === 'critico' ? 'bg-red-500' :
                                item.status === 'baixo' ? 'bg-yellow-500' :
                                item.status === 'excesso' ? 'bg-blue-500' :
                                'bg-green-500'
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.estoqueMinimo} / {item.estoqueMaximo} {item.unidade}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(item.valorUnitario)}
                        </TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          }).format(valorTotal)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.localizacao}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => {
                                setSelectedItem(item)
                                setShowDetails(true)
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedItem(item)
                                setShowMovimento(true)
                              }}>
                                <History className="h-4 w-4 mr-2" />
                                Movimentar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedItem(item)
                                setShowForm(true)
                              }}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      {showForm && (
        <EstoqueForm
          open={showForm}
          onOpenChange={setShowForm}
          item={selectedItem}
          onSuccess={() => {
            setShowForm(false)
            setSelectedItem(null)
            carregarItens()
          }}
        />
      )}

      {showDetails && selectedItem && (
        <EstoqueDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          item={selectedItem}
        />
      )}

      {showMovimento && selectedItem && (
        <EstoqueMovimentoForm
          open={showMovimento}
          onOpenChange={setShowMovimento}
          item={selectedItem}
          onSuccess={() => {
            setShowMovimento(false)
            carregarItens()
          }}
        />
      )}
    </>
  )
}