'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Calendar,
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
  estoque: {
    id: number
    nome: string
    codigo: string
    unidade: string
  }
  equipamento?: {
    id: number
    tag: string
    nome: string
  }
  usuario: {
    id: number
    nome: string
  }
}

export default function MovimentacoesPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  useEffect(() => {
    carregarMovimentacoes()
  }, [page, tipoFiltro, dataInicio, dataFim, searchTerm])

  const carregarMovimentacoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/movimentacoes', {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
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
        <Header title="Movimentações" />
        
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
                Movimentações
              </h1>
              <p className="text-muted-foreground mt-1">
                Histórico completo de movimentações do estoque
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Link href="/app-empresa/almoxarifado/movimentacoes/entrada">
                <Button variant="outline" className="mr-2">
                  Entrada
                </Button>
              </Link>
            )}
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por item ou equipamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger className="w-[150px]">
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

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="text-sm text-muted-foreground">Item:</span>
                          <Link 
                            href={`/app-empresa/almoxarifado/estoque/${mov.estoque.id}`}
                            className="ml-2 font-medium hover:text-primary"
                          >
                            {mov.estoque.nome} ({mov.estoque.codigo})
                          </Link>
                        </div>

                        {mov.valorTotal && (
                          <div>
                            <span className="text-sm text-muted-foreground">Valor total:</span>
                            <span className="ml-2 font-medium">{formatCurrency(mov.valorTotal)}</span>
                          </div>
                        )}

                        {mov.equipamento && (
                          <div>
                            <span className="text-sm text-muted-foreground">Equipamento:</span>
                            <Link 
                              href={`/app-empresa/equipamentos/${mov.equipamento.id}`}
                              className="ml-2 font-medium hover:text-primary"
                            >
                              {mov.equipamento.tag}
                            </Link>
                          </div>
                        )}
                      </div>

                      {mov.observacao && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {mov.observacao}
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Registrado por: {mov.usuario.nome}
                      </div>

                      <div className="mt-2 flex justify-end">
                        <Link href={`/app-empresa/almoxarifado/movimentacoes/${mov.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver detalhes
                          </Button>
                        </Link>
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
    </>
  )
}