'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  FolderTree,
  ArrowLeft,
  Edit,
  Trash2,
  Building2,
  Clock,
  Users,
  Truck,
  Fuel,
  TrendingUp,
  Calendar,
  MapPin,
  Activity,
  BarChart3,
  PieChart,
  FileText,
  Plus,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Rocket,
  Globe,
  Shield,
  Lock,
  Copy,
  Printer,
  Upload,
  Download,
  Share2,
  Heart,
  Star,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
  HelpCircle,
  Info,
  AlertTriangle,
  XCircle as XCircleIcon,
  CheckCircle as CheckCircleIcon,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Users as UsersIcon,
  Building,
  Home,
  Settings,
  LogOut,
  Bell,
  Eye as EyeIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Copy as CopyIcon,
  Printer as PrinterIcon,
  Upload as UploadIcon,
  Download as DownloadIconIcon,
  Share2 as Share2Icon,
  Heart as HeartIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  ThumbsUp as ThumbsUpIcon,
  MessageCircle as MessageCircleIcon,
  MessageSquare as MessageSquareIcon,
  HelpCircle as HelpCircleIcon,
  Info as InfoIcon,
  AlertCircle as AlertCircleIcon
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FrenteServico {
  id: number
  nome: string
  descricao?: string
  obraId: number
  obra: {
    id: number
    nome: string
    codigo: string
  }
  status: 'ativa' | 'inativa' | 'concluida'
  progresso: number
  createdAt: string
  updatedAt: string
  apontamentos: Array<{
    id: number
    data: string
    equipamento: string
    operador: string
    horasTrabalhadas: number
    combustivelLitros?: number
  }>
  equipamentos: Array<{
    id: number
    nome: string
    tag: string
    status: string
    horas: number
  }>
  estatisticas: {
    totalApontamentos: number
    totalHoras: number
    totalCombustivel: number
    mediaHorasDia: number
    mediaCombustivelDia: number
    produtividade: number
  }
}

export default function FrenteDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const id = params.id as string

  const [frente, setFrente] = useState<FrenteServico | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    carregarFrente()
  }, [id])

  const carregarFrente = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/frentes-servico/${id}`)
      setFrente(response.data)
    } catch (error) {
      console.error('Erro ao carregar frente de serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da frente',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!frente) return

    try {
      await api.delete(`/frentes-servico/${frente.id}`)
      toast({
        title: 'Sucesso',
        description: 'Frente de serviço excluída com sucesso'
      })
      router.push('/app-empresa/frentes-servico')
    } catch (error) {
      console.error('Erro ao excluir frente de serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a frente de serviço',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = () => {
    if (!frente) return null

    switch (frente.status) {
      case 'ativa':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativa
          </Badge>
        )
      case 'inativa':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inativa
          </Badge>
        )
      case 'concluida':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      default:
        return <Badge variant="outline">{frente.status}</Badge>
    }
  }

  const formatHours = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m}min`
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  if (loading || !frente) {
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
              <h1 className="text-3xl font-bold">{frente.nome}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-muted-foreground">
              Obra: {frente.obra.nome} • Código: {frente.obra.codigo}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/app-empresa/frentes-servico/${frente.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Horas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatHours(frente.estatisticas.totalHoras)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Combustível</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {frente.estatisticas.totalCombustivel.toFixed(1)} L
                </p>
              </div>
              <Fuel className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Apontamentos</p>
                <p className="text-2xl font-bold text-green-600">
                  {frente.estatisticas.totalApontamentos}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produtividade</p>
                <p className="text-2xl font-bold text-purple-600">
                  {frente.estatisticas.produtividade}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <Progress value={frente.estatisticas.produtividade} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Informações Adicionais */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Média Horas/Dia</p>
              <p className="text-lg font-semibold">
                {formatHours(frente.estatisticas.mediaHorasDia)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-ecolor-muted-foreground">Média Combustível/Dia</p>
              <p className="text-lg font-semibold">
                {frente.estatisticas.mediaCombustivelDia.toFixed(1)} L
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Equipamentos Alocados</p>
              <p className="text-lg font-semibold">{frente.equipamentos.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progresso</p>
              <p className="text-lg font-semibold">{frente.progresso}%</p>
            </div>
          </div>

          {frente.descricao && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                <p className="text-sm">{frente.descricao}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="apontamentos">Apontamentos</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="analise">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="apontamentos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Últimos Apontamentos</CardTitle>
                <Link href={`/app-empresa/frentes-servico/${frente.id}/apontamentos/novo`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Apontamento
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Combustível</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {frente.apontamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        Nenhum apontamento registrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    frente.apontamentos.slice(0, 5).map((ap) => (
                      <TableRow key={ap.id}>
                        <TableCell>{formatDate(ap.data)}</TableCell>
                        <TableCell>{ap.equipamento}</TableCell>
                        <TableCell>{ap.operador || '-'}</TableCell>
                        <TableCell>{ap.horasTrabalhadas}h</TableCell>
                        <TableCell>{ap.combustivelLitros ? `${ap.combustivelLitros} L` : '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {frente.apontamentos.length > 5 && (
                <div className="mt-4 text-center">
                  <Link href={`/app-empresa/frentes-servico/${frente.id}/apontamentos`}>
                    <Button variant="link">
                      Ver todos os apontamentos
                      <Eye className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipamentos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipamentos Alocados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Horas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {frente.equipamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhum equipamento alocado
                      </TableCell>
                    </TableRow>
                  ) : (
                    frente.equipamentos.map((eq) => (
                      <TableRow key={eq.id}>
                        <TableCell className="font-medium">{eq.nome}</TableCell>
                        <TableCell className="font-mono text-xs">{eq.tag}</TableCell>
                        <TableCell>
                          {eq.status === 'disponivel' ? (
                            <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                          ) : eq.status === 'em_uso' ? (
                            <Badge className="bg-blue-100 text-blue-800">Em Uso</Badge>
                          ) : (
                            <Badge variant="secondary">{eq.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{eq.horas}h</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analise" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Desempenho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Horas por Dia</p>
                  <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Gráfico de horas</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Consumo de Combustível</p>
                  <div className="h-40 bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Gráfico de combustível</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Eficiência Média</p>
                      <p className="text-2xl font-bold text-green-600">
                        {((frente.estatisticas.mediaHorasDia / 8) * 100).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Consumo por Hora</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {(frente.estatisticas.totalCombustivel / frente.estatisticas.totalHoras || 0).toFixed(1)} L/h
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a frente de serviço "{frente.nome}"?
              Esta ação não pode ser desfeita e todos os apontamentos relacionados serão removidos.
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