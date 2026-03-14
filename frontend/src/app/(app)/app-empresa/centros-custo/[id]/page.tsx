'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  TrendingDown,
<<<<<<< HEAD
=======
  Minus,
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  Award,
  CheckCircle,
  XCircle,
  Calendar,
  MoreVertical,
<<<<<<< HEAD
=======
  ArrowRight
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'

import { Separator } from '@/components/ui/Separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
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
<<<<<<< HEAD
import { useAuth } from '@/components/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface CentroCusto {
  id: number
  nome: string
  codigo: string
  obraId?: number
  obra?: {
    id: number
    nome: string
    codigo: string
  }
  contato?: string
  telefone?: string
  email?: string
  endereco?: string
  observacoes?: string
  status: 'ativo' | 'inativo'
  createdAt: string
  updatedAt: string
  avaliacoes: Array<{
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
  }>
  estatisticas: {
    totalAvaliacoes: number
    mediaGeral: number
    ultimaAvaliacao: string
    tendencia: 'up' | 'down' | 'stable'
    mediasPorCategoria: {
      precoCondicoes: number
      qualidadeServico: number
      qualidadeEntrega: number
      segurancaSaude: number
      estoque: number
      administracao: number
    }
  }
}

export default function CentroCustoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const id = params.id as string

  const [centro, setCentro] = useState<CentroCusto | null>(null)
  const [loading, setLoading] = useState(true)
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState('visao-geral')
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    carregarCentro()
  }, [id])

  const carregarCentro = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/centros-custo/${id}`)
      setCentro(response.data)
    } catch (error) {
      console.error('Erro ao carregar centro de custo:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do centro de custo',
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

  const handleDelete = async () => {
    if (!centro) return

    try {
      await api.delete(`/centros-custo/${centro.id}`)
      toast({
        title: 'Sucesso',
        description: 'Centro de custo excluído com sucesso'
      })
      router.push('/app-empresa/centros-custo')
    } catch (error) {
      console.error('Erro ao excluir centro de custo:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o centro de custo',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    }
  }

  const getStatusBadge = () => {
    if (!centro) return null

    return centro.status === 'ativo' ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        <CheckCircle className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    )
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600'
    if (nota >= 3.5) return 'text-blue-600'
    if (nota >= 2.5) return 'text-yellow-600'
    if (nota >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTendenciaIcon = () => {
    if (!centro) return null

    switch (centro.estatisticas.tendencia) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
  }

  if (loading || !centro) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
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
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{centro.nome}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-muted-foreground">
              Código: {centro.codigo} • Criado em {formatDate(centro.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/app-empresa/centros-custo/${centro.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>

          <Link href={`/app-empresa/centros-custo/${centro.id}/avaliacoes/nova`}>
            <Button variant="outline">
              <Star className="h-4 w-4 mr-2" />
              Avaliar
            </Button>
          </Link>

          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>

          <Button variant="outline">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Geral</p>
                <p className={`text-2xl font-bold ${getNotaColor(centro.estatisticas.mediaGeral)}`}>
                  {centro.estatisticas.mediaGeral.toFixed(2)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Avaliações</p>
                <p className="text-2xl font-bold text-blue-600">
                  {centro.estatisticas.totalAvaliacoes}
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Última Avaliação</p>
                <p className="text-lg font-bold">
                  {centro.estatisticas.ultimaAvaliacao ? formatDate(centro.estatisticas.ultimaAvaliacao) : '-'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
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
                    {centro.estatisticas.tendencia === 'up' ? 'Positiva' :
                     centro.estatisticas.tendencia === 'down' ? 'Negativa' : 'Estável'}
                  </span>
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Contato */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {centro.contato && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Contato:</span>
                  <span className="text-sm">{centro.contato}</span>
                </div>
              )}

              {centro.telefone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Telefone:</span>
                  <span className="text-sm">{centro.telefone}</span>
                </div>
              )}

              {centro.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">E-mail:</span>
                  <a href={`mailto:${centro.email}`} className="text-sm text-primary hover:underline">
                    {centro.email}
                  </a>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {centro.obra && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Obra vinculada:</span>
                  <Link href={`/app-empresa/obras/${centro.obra.id}`} className="text-sm text-primary hover:underline">
                    {centro.obra.nome}
                  </Link>
                </div>
              )}

              {centro.endereco && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Endereço:</span>
                  <span className="text-sm">{centro.endereco}</span>
                </div>
              )}
            </div>
          </div>

          {centro.observacoes && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Observações</p>
                <p className="text-sm">{centro.observacoes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Médias por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Médias por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Preço e Condições (20%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(centro.estatisticas.mediasPorCategoria.precoCondicoes)}`}>
                    {centro.estatisticas.mediasPorCategoria.precoCondicoes.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={centro.estatisticas.mediasPorCategoria.precoCondicoes * 20} 
                  className="h-2"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Qualidade do Serviço (25%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(centro.estatisticas.mediasPorCategoria.qualidadeServico)}`}>
                    {centro.estatisticas.mediasPorCategoria.qualidadeServico.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={centro.estatisticas.mediasPorCategoria.qualidadeServico * 20} 
                  className="h-2"
                  indicatorClassName="bg-green-500"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Qualidade de Entrega (15%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(centro.estatisticas.mediasPorCategoria.qualidadeEntrega)}`}>
                    {centro.estatisticas.mediasPorCategoria.qualidadeEntrega.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={centro.estatisticas.mediasPorCategoria.qualidadeEntrega * 20} 
                  className="h-2"
                  indicatorClassName="bg-purple-500"
                />
              </div>
            </div>

            <div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Segurança e Saúde (25%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(centro.estatisticas.mediasPorCategoria.segurancaSaude)}`}>
                    {centro.estatisticas.mediasPorCategoria.segurancaSaude.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={centro.estatisticas.mediasPorCategoria.segurancaSaude * 20} 
                  className="h-2"
                  indicatorClassName="bg-orange-500"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Estoque (10%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(centro.estatisticas.mediasPorCategoria.estoque)}`}>
                    {centro.estatisticas.mediasPorCategoria.estoque.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={centro.estatisticas.mediasPorCategoria.estoque * 20} 
                  className="h-2"
                  indicatorClassName="bg-yellow-500"
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Administração (5%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(centro.estatisticas.mediasPorCategoria.administracao)}`}>
                    {centro.estatisticas.mediasPorCategoria.administracao.toFixed(2)}
                  </span>
                </div>
                <Progress 
                  value={centro.estatisticas.mediasPorCategoria.administracao * 20} 
                  className="h-2"
                  indicatorClassName="bg-red-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Avaliações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Histórico de Avaliações</CardTitle>
            <Link href={`/app-empresa/centros-custo/${centro.id}/avaliacoes`}>
              <Button variant="outline" size="sm">
                Ver todas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {centro.avaliacoes.slice(0, 5).map((av) => (
                <TableRow key={av.id}>
                  <TableCell>{formatDate(av.data)}</TableCell>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o centro de custo "{centro.nome}"?
              Esta ação não pode ser desfeita e todas as avaliações relacionadas serão removidas.
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