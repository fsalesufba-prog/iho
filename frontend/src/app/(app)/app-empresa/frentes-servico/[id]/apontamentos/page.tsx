'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Plus,
  Search,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
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

interface Apontamento {
  id: number
  data: string
  equipamento: string
  equipamentoTag: string
  operador?: string
  horasInicial: number
  horasFinal: number
  horasTrabalhadas: number
  combustivelLitros?: number
  observacoes?: string
  createdAt: string
}

export default function ApontamentosPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [apontamentos, setApontamentos] = useState<Apontamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [periodo, setPeriodo] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedApontamento, setSelectedApontamento] = useState<Apontamento | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [frenteNome, setFrenteNome] = useState('')

  useEffect(() => {
    carregarFrente()
    carregarApontamentos()
  }, [id, page, periodo, search])

  const carregarFrente = async () => {
    try {
      const response = await api.get(`/frentes-servico/${id}`)
      setFrenteNome(response.data.nome)
    } catch (error) {
      console.error('Erro ao carregar frente:', error)
    }
  }

  const carregarApontamentos = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/frentes-servico/${id}/apontamentos`, {
        params: {
          page,
          limit: 20,
          periodo,
          search: search || undefined
        }
      })
      setApontamentos(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar apontamentos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os apontamentos',
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

  const handleSearch = () => {
    setPage(1)
    carregarApontamentos()
  }

  const handleDelete = async () => {
    if (!selectedApontamento) return

    try {
      await api.delete(`/apontamentos/${selectedApontamento.id}`)
      toast({
        title: 'Sucesso',
        description: 'Apontamento excluído com sucesso'
      })
      setShowDeleteDialog(false)
      setSelectedApontamento(null)
      carregarApontamentos()
    } catch (error) {
      console.error('Erro ao excluir apontamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o apontamento',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  const formatHours = (hours: number) => {
    return `${hours}h`
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
            <h1 className="text-3xl font-bold">Apontamentos</h1>
            <p className="text-muted-foreground">
              {frenteNome}
            </p>
          </div>
        </div>

        <Link href={`/app-empresa/frentes-servico/${id}/apontamentos/novo`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Apontamento
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por equipamento ou operador..."
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
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="12m">Últimos 12 meses</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarApontamentos}>
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
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead className="w-[80px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : apontamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum apontamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  apontamentos.map((ap) => (
                    <TableRow key={ap.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(ap.data)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{ap.equipamento}</p>
                          <p className="text-xs text-muted-foreground">{ap.equipamentoTag}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ap.operador || '-'}</TableCell>
                      <TableCell>{formatHours(ap.horasTrabalhadas)}</TableCell>
                      <TableCell>
                        {ap.combustivelLitros ? `${ap.combustivelLitros} L` : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{ap.observacoes || '-'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedApontamento(ap)
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
              Tem certeza que deseja excluir este apontamento?
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