'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
<<<<<<< HEAD
=======
  Plus,
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  Edit,
  Trash2,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Upload,
  Download,
  MoreVertical,
  FolderTree,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

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

import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
<<<<<<< HEAD
import { useAuth } from '@/components/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Obra {
  id: number
  nome: string
  codigo: string
  cnpj: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  status: 'ativa' | 'paralisada' | 'concluida' | 'cancelada'
  progresso: number
  dataInicio?: string
  dataPrevisaoTermino?: string
  dataTermino?: string
  valor?: number
  observacoes?: string
  createdAt: string
  updatedAt: string
  frentes: Array<{
    id: number
    nome: string
    status: string
    progresso: number
  }>
  equipamentos: Array<{
    id: number
    nome: string
    tag: string
    status: string
    horas: number
  }>
  funcionarios: Array<{
    id: number
    nome: string
    funcao: string
    horas: number
  }>
  documentos: Array<{
    id: number
    nome: string
    tipo: string
    data: string
  }>
}

export default function ObraDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const id = params.id as string

  const [obra, setObra] = useState<Obra | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    carregarObra()
  }, [id])

  const carregarObra = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/obras/${id}`)
      setObra(response.data)
    } catch (error) {
      console.error('Erro ao carregar obra:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da obra',
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
    if (!obra) return

    try {
      await api.delete(`/obras/${obra.id}`)
      toast({
        title: 'Sucesso',
        description: 'Obra excluída com sucesso'
      })
      router.push('/app-empresa/obras')
    } catch (error) {
      console.error('Erro ao excluir obra:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a obra',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    }
  }

  const getStatusBadge = () => {
    if (!obra) return null

    switch (obra.status) {
      case 'ativa':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativa
          </Badge>
        )
      case 'paralisada':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Paralisada
          </Badge>
        )
      case 'concluida':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      case 'cancelada':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        )
      default:
        return <Badge variant="outline">{obra.status}</Badge>
    }
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
  }

  const calcularDiasRestantes = () => {
    if (!obra?.dataPrevisaoTermino || obra.status === 'concluida' || obra.status === 'cancelada') return null

    const hoje = new Date()
    const previsao = new Date(obra.dataPrevisaoTermino)
    const diffTime = previsao.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  if (loading || !obra) {
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

  const diasRestantes = calcularDiasRestantes()
  const isAtrasada = diasRestantes !== null && diasRestantes < 0

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
              <h1 className="text-3xl font-bold">{obra.nome}</h1>
              {getStatusBadge()}
              {isAtrasada && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Atrasada
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Código: {obra.codigo} • CNPJ: {obra.cnpj}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/app-empresa/obras/${obra.id}/edit`}>
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
                <p className="text-sm text-muted-foreground">Valor da Obra</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(obra.valor)}
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
                <p className="text-sm text-muted-foreground">Progresso</p>
                <p className="text-2xl font-bold">{obra.progresso}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={obra.progresso} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Frentes de Serviço</p>
                <p className="text-2xl font-bold">{obra.frentes.length}</p>
              </div>
              <FolderTree className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Equipamentos</p>
                <p className="text-2xl font-bold">{obra.equipamentos.length}</p>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Prazo */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Data de Início</p>
              <p className="text-lg font-semibold">{formatDate(obra.dataInicio)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Previsão de Término</p>
              <p className="text-lg font-semibold">{formatDate(obra.dataPrevisaoTermino)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data de Término</p>
              <p className="text-lg font-semibold">{formatDate(obra.dataTermino)}</p>
            </div>
          </div>

          {diasRestantes !== null && !obra.dataTermino && (
            <div className={cn(
              "mt-4 p-3 rounded-lg flex items-center gap-2",
              isAtrasada ? "bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-300" : "bg-blue-50 text-blue-800 dark:bg-blue-950/20 dark:text-blue-300"
            )}>
              {isAtrasada ? (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Obra atrasada em {Math.abs(diasRestantes)} {Math.abs(diasRestantes) === 1 ? 'dia' : 'dias'}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {diasRestantes} {diasRestantes === 1 ? 'dia restante' : 'dias restantes'} para o prazo
                  </span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="frentes">Frentes de Serviço</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Obra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{obra.endereco}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cidade/UF</p>
                  <p className="font-medium">{obra.cidade}/{obra.estado}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CEP</p>
                  <p className="font-medium">{obra.cep}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium">{obra.cnpj}</p>
                </div>
              </div>

              {obra.observacoes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Observações</p>
                    <p className="text-sm">{obra.observacoes}</p>
                  </div>
                </>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Criado em</p>
                  <p className="font-medium">{format(new Date(obra.createdAt), "dd/MM/yyyy HH:mm")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Última atualização</p>
                  <p className="font-medium">{format(new Date(obra.updatedAt), "dd/MM/yyyy HH:mm")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frentes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Frentes de Serviço</CardTitle>
                <Link href={`/app-empresa/frentes-servico/nova?obraId=${obra.id}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Frente
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Frente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {obra.frentes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Nenhuma frente de serviço cadastrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    obra.frentes.map((frente) => (
                      <TableRow key={frente.id}>
                        <TableCell className="font-medium">{frente.nome}</TableCell>
                        <TableCell>
                          {frente.status === 'ativa' ? (
                            <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                          ) : (
                            <Badge variant="secondary">{frente.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={frente.progresso} className="h-2 w-20" />
                            <span className="text-xs">{frente.progresso}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipamentos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Equipamentos Alocados</CardTitle>
                <Link href={`/app-empresa/equipamentos/alocar?obraId=${obra.id}`}>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Alocar Equipamento
                  </Button>
                </Link>
              </div>
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
                  {obra.equipamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhum equipamento alocado
                      </TableCell>
                    </TableRow>
                  ) : (
                    obra.equipamentos.map((equip) => (
                      <TableRow key={equip.id}>
                        <TableCell className="font-medium">{equip.nome}</TableCell>
                        <TableCell className="font-mono text-xs">{equip.tag}</TableCell>
                        <TableCell>
                          {equip.status === 'disponivel' ? (
                            <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                          ) : equip.status === 'em_uso' ? (
                            <Badge className="bg-blue-100 text-blue-800">Em Uso</Badge>
                          ) : equip.status === 'manutencao' ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Manutenção</Badge>
                          ) : (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell>{equip.horas}h</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Documentos</CardTitle>
                <Button size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {obra.documentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhum documento anexado
                      </TableCell>
                    </TableRow>
                  ) : (
                    obra.documentos.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.nome}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.tipo}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(doc.data)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
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
              Tem certeza que deseja excluir a obra "{obra.nome}"?
              Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
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