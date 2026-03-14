'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Star,
  ArrowLeft,
  Plus,
  Search,
  Download,
  RefreshCw,
  Eye,
  Trash2,
  Calendar,
  TrendingUp,
  TrendingDown,
<<<<<<< HEAD
=======
  Minus,
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Award,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent } from '@/components/ui/Card'

import { Input } from '@/components/ui/Input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
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
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Avaliacao {
  id: number
  data: string
  avaliador: string
  notaFinal: number
  categorias: {
    precoCondicoes: number
    qualidadeServico: number
    qualidadeEntrega: number
    segurancaSaude: number
    estoque: number
    administracao: number
  }
  ocorrencias?: string
  observacoes?: string
}

export default function AvaliacoesPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [periodo, setPeriodo] = useState('12m')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<Avaliacao | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [centroNome, setCentroNome] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    mediaGeral: 0,
    tendencia: 'stable' as 'up' | 'down' | 'stable'
  })

  useEffect(() => {
    carregarCentro()
    carregarAvaliacoes()
    carregarStats()
  }, [id, page, periodo, search])

  const carregarCentro = async () => {
    try {
      const response = await api.get(`/centros-custo/${id}`)
      setCentroNome(response.data.nome)
    } catch (error) {
      console.error('Erro ao carregar centro:', error)
    }
  }

  const carregarAvaliacoes = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/centros-custo/${id}/avaliacoes`, {
        params: {
          page,
          limit: 10,
          periodo,
          search: search || undefined
        }
      })
      setAvaliacoes(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as avaliações',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarStats = async () => {
    try {
      const response = await api.get(`/centros-custo/${id}/avaliacoes/stats`)
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarAvaliacoes()
  }

  const handleDelete = async () => {
    if (!selectedAvaliacao) return

    try {
      await api.delete(`/centros-custo/avaliacoes/${selectedAvaliacao.id}`)
      toast({
        title: 'Sucesso',
        description: 'Avaliação excluída com sucesso'
      })
      setShowDeleteDialog(false)
      setSelectedAvaliacao(null)
      carregarAvaliacoes()
      carregarStats()
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a avaliação',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    }
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600'
    if (nota >= 3.5) return 'text-blue-600'
    if (nota >= 2.5) return 'text-yellow-600'
    if (nota >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTendenciaIcon = () => {
    switch (stats.tendencia) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-3xl font-bold">Avaliações</h1>
            <p className="text-muted-foreground">
              {centroNome}
            </p>
          </div>
        </div>

        <Link href={`/app-empresa/centros-custo/${id}/avaliacoes/nova`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Geral</p>
                <p className={`text-2xl font-bold ${getNotaColor(stats.mediaGeral)}`}>
                  {stats.mediaGeral.toFixed(2)}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tendência</p>
                <div className="flex items-center gap-2 mt-2">
                  {getTendenciaIcon()}
                  <span className="text-lg font-semibold">
                    {stats.tendencia === 'up' ? 'Positiva' :
                     stats.tendencia === 'down' ? 'Negativa' : 'Estável'}
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por avaliador..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Buscar
              </Button>
            </div>

            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6m">Últimos 6 meses</SelectItem>
                <SelectItem value="12m">Últimos 12 meses</SelectItem>
                <SelectItem value="24m">Últimos 24 meses</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarAvaliacoes}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Avaliador</TableHead>
                  <TableHead>Nota Final</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Qualidade</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Segurança</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>ADM</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : avaliacoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Nenhuma avaliação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  avaliacoes.map((av) => (
                    <TableRow key={av.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(av.data)}</TableCell>
                      <TableCell>{av.avaliador}</TableCell>
                      <TableCell>
                        <span className={`font-bold ${getNotaColor(av.notaFinal)}`}>
                          {av.notaFinal.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className={getNotaColor(av.categorias.precoCondicoes)}>
                        {av.categorias.precoCondicoes.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(av.categorias.qualidadeServico)}>
                        {av.categorias.qualidadeServico.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(av.categorias.qualidadeEntrega)}>
                        {av.categorias.qualidadeEntrega.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(av.categorias.segurancaSaude)}>
                        {av.categorias.segurancaSaude.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(av.categorias.estoque)}>
                        {av.categorias.estoque.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(av.categorias.administracao)}>
                        {av.categorias.administracao.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => router.push(`/app-empresa/centros-custo/avaliacoes/${av.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAvaliacao(av)
                                setShowDeleteDialog(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}