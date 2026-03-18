'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  MoreVertical,
  UserPlus,
  Truck,
  Briefcase,
  Plus,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Progress } from '@/components/ui/Progress'

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
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

interface Empresa {
  id: number
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  plano: {
    id: number
    nome: string
    valorImplantacao: number
    valorMensal: number
    limiteAdm: number
    limiteControlador: number
    limiteApontador: number
    limiteEquipamentos: number
  }
  status: 'ativo' | 'inativo' | 'atrasado' | 'cancelado' | 'pendente'
  diasAtraso: number
  implantacaoPaga: boolean
  dataCadastro: string
  dataAtivacao?: string
  nextBillingAt?: string
  usuarios: Array<{
    id: number
    nome: string
    email: string
    tipo: string
    ativo: boolean
    ultimoAcesso?: string
  }>
  obras: Array<{
    id: number
    nome: string
    codigo: string
    status: string
    progresso: number
  }>
  equipamentos: Array<{
    id: number
    nome: string
    tag: string
    status: string
  }>
  pagamentos: Array<{
    id: number
    tipo: string
    valor: number
    status: string
    dataVencimento: string
    dataPagamento?: string
  }>
  logs: Array<{
    id: number
    acao: string
    usuario: string
    data: string
  }>
  _count: {
    usuarios: number
    obras: number
    equipamentos: number
    centrosCusto: number
  }
}

export default function EmpresaDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    carregarEmpresa()
  }, [id])

  const carregarEmpresa = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/empresas/${id}`)
      setEmpresa(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da empresa',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!empresa) return

    try {
      await api.delete(`/empresas/${empresa.id}`)
      toast({
        title: 'Sucesso',
        description: 'Empresa excluída com sucesso'
      })
      router.push('/admin-sistema/empresas')
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a empresa',
        variant: 'error'
      })
    }
  }

  const getStatusBadge = () => {
    if (!empresa) return null

    switch (empresa.status) {
      case 'ativo':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        )
      case 'inativo':
        return (
          <Badge variant="secondary">
            <XCircle className="h-3 w-3 mr-1" />
            Inativo
          </Badge>
        )
      case 'atrasado':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {empresa.diasAtraso} dias atrasado
          </Badge>
        )
      case 'cancelado':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </Badge>
        )
      case 'pendente':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </Badge>
        )
      default:
        return <Badge variant="outline">{empresa.status}</Badge>
    }
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

  if (loading || !empresa) {
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
                <Skeleton className="h-8 w-32" />
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
              <h1 className="text-3xl font-bold">{empresa.nome}</h1>
              {getStatusBadge()}
            </div>
            <p className="text-muted-foreground">
              CNPJ: {empresa.cnpj} • Cadastrada em {formatDate(empresa.dataCadastro)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin-sistema/empresas/${empresa.id}/edit`}>
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
                <p className="text-sm text-muted-foreground">Usuários</p>
                <p className="text-2xl font-bold">{empresa._count.usuarios}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Limite: {empresa.plano.limiteAdm + empresa.plano.limiteControlador + empresa.plano.limiteApontador}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Obras</p>
                <p className="text-2xl font-bold">{empresa._count.obras}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Equipamentos</p>
                <p className="text-2xl font-bold">{empresa._count.equipamentos}</p>
              </div>
              <Truck className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Limite: {empresa.plano.limiteEquipamentos}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Centros de Custo</p>
                <p className="text-2xl font-bold">{empresa._count.centrosCusto}</p>
              </div>
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="obras">Obras</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{empresa.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{empresa.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{empresa.endereco}, {empresa.cidade}/{empresa.estado} - CEP: {empresa.cep}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plano e Limites</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plano:</span>
                  <Badge variant="outline">{empresa.plano.nome}</Badge>
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Usuários</span>
                    <span>{empresa._count.usuarios} / {empresa.plano.limiteAdm + empresa.plano.limiteControlador + empresa.plano.limiteApontador}</span>
                  </div>
                  <Progress 
                    value={(empresa._count.usuarios / (empresa.plano.limiteAdm + empresa.plano.limiteControlador + empresa.plano.limiteApontador)) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Equipamentos</span>
                    <span>{empresa._count.equipamentos} / {empresa.plano.limiteEquipamentos}</span>
                  </div>
                  <Progress 
                    value={(empresa._count.equipamentos / empresa.plano.limiteEquipamentos) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresa.logs.slice(0, 5).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.data}</TableCell>
                      <TableCell>{log.usuario}</TableCell>
                      <TableCell>{log.acao}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usuarios" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Usuários da Empresa</CardTitle>
                <Button size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Último Acesso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresa.usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {usuario.tipo.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {usuario.ativo ? (
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(usuario.ultimoAcesso)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="obras" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Obras da Empresa</CardTitle>
                <Button size="sm" asChild>
                  <Link href={`/admin-sistema/obras/nova?empresaId=${empresa.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Obra
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Obra</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresa.obras.map((obra) => (
                    <TableRow key={obra.id}>
                      <TableCell className="font-medium">{obra.nome}</TableCell>
                      <TableCell>{obra.codigo}</TableCell>
                      <TableCell>
                        {obra.status === 'ativa' ? (
                          <Badge className="bg-green-100 text-green-800">Ativa</Badge>
                        ) : (
                          <Badge variant="secondary">{obra.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={obra.progresso} className="h-2 w-20" />
                          <span className="text-xs">{obra.progresso}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipamentos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Equipamentos da Empresa</CardTitle>
                <Button size="sm" asChild>
                  <Link href={`/admin-sistema/equipamentos/novo?empresaId=${empresa.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Equipamento
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresa.equipamentos.map((equip) => (
                    <TableRow key={equip.id}>
                      <TableCell className="font-medium">{equip.nome}</TableCell>
                      <TableCell>{equip.tag}</TableCell>
                      <TableCell>
                        {equip.status === 'disponivel' ? (
                          <Badge className="bg-green-100 text-green-800">Disponível</Badge>
                        ) : equip.status === 'em_uso' ? (
                          <Badge className="bg-blue-100 text-blue-800">Em Uso</Badge>
                        ) : equip.status === 'manutencao' ? (
                          <Badge className="bg-yellow-100 text-yellow-800">Em Manutenção</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico de Pagamentos</CardTitle>
                <Button size="sm" asChild>
                  <Link href={`/admin-sistema/pagamentos/novo?empresaId=${empresa.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Pagamento
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Pagamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {empresa.pagamentos.map((pagamento) => (
                    <TableRow key={pagamento.id}>
                      <TableCell>{formatDate(pagamento.dataVencimento)}</TableCell>
                      <TableCell>
                        {pagamento.tipo === 'implantacao' ? 'Implantação' : 'Mensalidade'}
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatCurrency(pagamento.valor)}
                      </TableCell>
                      <TableCell>
                        {pagamento.status === 'pago' ? (
                          <Badge className="bg-green-100 text-green-800">Pago</Badge>
                        ) : pagamento.status === 'atrasado' ? (
                          <Badge variant="destructive">Atrasado</Badge>
                        ) : pagamento.status === 'cancelado' ? (
                          <Badge variant="destructive">Cancelado</Badge>
                        ) : (
                          <Badge variant="secondary">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell>{pagamento.dataPagamento ? formatDate(pagamento.dataPagamento) : '-'}</TableCell>
                    </TableRow>
                  ))}
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
              Tem certeza que deseja excluir a empresa "{empresa.nome}"?
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