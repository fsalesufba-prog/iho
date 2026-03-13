'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Truck,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Clock,
  Building2,
  Package,
  Box,
  Archive,
  Star,
  Crown,
  Gem,
  Diamond,
  Medal,
  Trophy,
  Gift,
  Sparkles,
  Zap,
  Rocket,
  Globe,
  Shield,
  Lock,
  Award,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Copy,
  Eye,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  Save,
  Upload,
  Download,
  Share2,
  Heart,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  MessageSquare,
  HelpCircle,
  Info,
  AlertCircle,
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
  Search,
  Filter,
  Plus,
  Minus,
  MoreVertical,
  MoreHorizontal
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
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
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Plano {
  id: number
  nome: string
  descricao: string
  valorImplantacao: number
  valorMensal: number
  limiteAdm: number
  limiteControlador: number
  limiteApontador: number
  limiteEquipamentos: number
  recursos: string[]
  status: 'ativo' | 'inativo'
  empresas: Array<{
    id: number
    nome: string
    cnpj: string
    status: string
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

export default function PlanoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [plano, setPlano] = useState<Plano | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    carregarPlano()
  }, [id])

  const carregarPlano = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/planos/${id}`)
      setPlano(response.data)
    } catch (error) {
      console.error('Erro ao carregar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do plano',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!plano) return

    try {
      await api.delete(`/planos/${plano.id}`)
      toast({
        title: 'Sucesso',
        description: 'Plano excluído com sucesso'
      })
      router.push('/admin-sistema/planos')
    } catch (error) {
      console.error('Erro ao excluir plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o plano',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'ativo' ? (
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  if (loading || !plano) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
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

  const recursos = Array.isArray(plano.recursos) ? plano.recursos : JSON.parse(plano.recursos as any)

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
              <h1 className="text-3xl font-bold">{plano.nome}</h1>
              {getStatusBadge(plano.status)}
            </div>
            <p className="text-muted-foreground">
              {plano.descricao} • Criado em {formatDate(plano.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin-sistema/planos/${plano.id}/edit`}>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Implantação</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(plano.valorImplantacao)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Mensal</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(plano.valorMensal)}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Empresas</p>
                <p className="text-2xl font-bold">{plano.empresas?.length || 0}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Limite de Usuários</p>
                <p className="text-2xl font-bold">
                  {plano.limiteAdm + plano.limiteControlador + plano.limiteApontador}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Descrição</p>
                <p className="text-sm">{plano.descricao}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-4">Limites</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Administradores</p>
                    <p className="text-lg font-semibold">{plano.limiteAdm}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Controladores</p>
                    <p className="text-lg font-semibold">{plano.limiteControlador}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Apontadores</p>
                    <p className="text-lg font-semibold">{plano.limiteApontador}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Equipamentos</p>
                    <p className="text-lg font-semibold">{plano.limiteEquipamentos}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">{formatDate(plano.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última atualização</p>
                  <p className="font-medium">{formatDate(plano.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recursos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recursos Inclusos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recursos.map((recurso: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-primary transition-colors"
                  >
                    <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    </div>
                    <span className="text-sm">{recurso}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresas" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Empresas neste Plano</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plano.empresas?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhuma empresa utilizando este plano
                      </TableCell>
                    </TableRow>
                  ) : (
                    plano.empresas?.map((empresa) => (
                      <TableRow key={empresa.id}>
                        <TableCell className="font-medium">{empresa.nome}</TableCell>
                        <TableCell>{empresa.cnpj}</TableCell>
                        <TableCell>
                          {empresa.status === 'ativo' ? (
                            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                          ) : empresa.status === 'atrasado' ? (
                            <Badge variant="destructive">Atrasado</Badge>
                          ) : (
                            <Badge variant="secondary">{empresa.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(empresa.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
              Tem certeza que deseja excluir o plano "{plano.nome}"?
              Esta ação não pode ser desfeita e afetará {plano.empresas?.length || 0} empresas.
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