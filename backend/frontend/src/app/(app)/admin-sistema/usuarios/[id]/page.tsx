'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Clock,
  Shield,
  Key,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  MoreVertical,
  Building2,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
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

interface Usuario {
  id: number
  nome: string
  email: string
  telefone?: string
  tipo: 'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'
  empresaId?: number
  empresa?: {
    id: number
    nome: string
    cnpj: string
    status: string
  }
  ativo: boolean
  avatar?: string
  ultimoAcesso?: string
  createdAt: string
  updatedAt: string
  permissoes?: string[]
  logs?: Array<{
    id: number
    acao: string
    entidade: string
    data: string
    ip?: string
  }>
}

export default function UsuarioDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('visao-geral')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    carregarUsuario()
  }, [id])

  const carregarUsuario = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/usuarios/${id}`)
      setUsuario(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do usuário',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!usuario) return

    try {
      await api.patch(`/usuarios/${usuario.id}/status`, { ativo: !usuario.ativo })
      toast({
        title: 'Sucesso',
        description: usuario.ativo ? 'Usuário desativado' : 'Usuário ativado'
      })
      carregarUsuario()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o status',
        variant: 'error'
      })
    }
  }

  const handleResetPassword = async () => {
    if (!usuario) return

    try {
      await api.post(`/usuarios/${usuario.id}/reset-password`)
      toast({
        title: 'Sucesso',
        description: 'E-mail de redefinição de senha enviado'
      })
    } catch (error) {
      console.error('Erro ao resetar senha:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar a senha',
        variant: 'error'
      })
    }
  }

  const handleDelete = async () => {
    if (!usuario) return

    try {
      await api.delete(`/usuarios/${usuario.id}`)
      toast({
        title: 'Sucesso',
        description: 'Usuário excluído com sucesso'
      })
      router.push('/admin-sistema/usuarios')
    } catch (error) {
      console.error('Erro ao excluir usuário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o usuário',
        variant: 'error'
      })
    }
  }

  const getTipoBadge = (tipo: string) => {
    const config = {
      adm_sistema: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300', label: 'Admin Sistema' },
      adm_empresa: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Admin Empresa' },
      controlador: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Controlador' },
      apontador: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Apontador' }
    }
    const c = config[tipo as keyof typeof config] || config.apontador
    return <Badge className={c.color}>{c.label}</Badge>
  }

  const getStatusBadge = (ativo: boolean) => {
    return ativo ? (
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('pt-BR')
  }

  if (loading || !usuario) {
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

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
              <h1 className="text-3xl font-bold">{usuario.nome}</h1>
              {getStatusBadge(usuario.ativo)}
            </div>
            <p className="text-muted-foreground">
              {usuario.email} • Cadastrado em {formatDate(usuario.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin-sistema/usuarios/${usuario.id}/edit`}>
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
                <p className="text-sm text-muted-foreground">Tipo</p>
                <div className="mt-2">{getTipoBadge(usuario.tipo)}</div>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Empresa</p>
                <p className="text-xl font-bold mt-2">
                  {usuario.empresa?.nome || 'Sistema'}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Último Acesso</p>
                <p className="text-xl font-bold mt-2">
                  {usuario.ultimoAcesso ? formatDate(usuario.ultimoAcesso).split(' ')[0] : 'Nunca'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="text-xl font-bold mt-2">{usuario.telefone || '-'}</p>
              </div>
              <Phone className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={usuario.avatar} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(usuario.nome)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{usuario.nome}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{usuario.email}</span>
                  </div>
                  {usuario.telefone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{usuario.telefone}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID</p>
                  <p className="font-medium">#{usuario.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium capitalize">{usuario.tipo.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-medium">{usuario.empresa?.nome || 'Sistema'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium">{usuario.ativo ? 'Ativo' : 'Inativo'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cadastro</p>
                  <p className="font-medium">{formatDate(usuario.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Última atualização</p>
                  <p className="font-medium">{formatDate(usuario.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleToggleStatus}>
                  {usuario.ativo ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Desativar Usuário
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Ativar Usuário
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={handleResetPassword}>
                  <Key className="h-4 w-4 mr-2" />
                  Resetar Senha
                </Button>

                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar E-mail
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Permissões do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Dashboard</TableCell>
                    <TableCell>Visualizar</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">✓</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Empresas</TableCell>
                    <TableCell>Gerenciar</TableCell>
                    <TableCell>
                      {usuario.tipo === 'adm_sistema' ? (
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Usuários</TableCell>
                    <TableCell>Gerenciar</TableCell>
                    <TableCell>
                      {usuario.tipo === 'adm_sistema' || usuario.tipo === 'adm_empresa' ? (
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Obras</TableCell>
                    <TableCell>Gerenciar</TableCell>
                    <TableCell>
                      {usuario.tipo !== 'apontador' ? (
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Equipamentos</TableCell>
                    <TableCell>Gerenciar</TableCell>
                    <TableCell>
                      {usuario.tipo !== 'apontador' ? (
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Manutenção</TableCell>
                    <TableCell>Gerenciar</TableCell>
                    <TableCell>
                      {usuario.tipo === 'controlador' || usuario.tipo === 'adm_empresa' ? (
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Apontamentos</TableCell>
                    <TableCell>Criar</TableCell>
                    <TableCell>
                      {usuario.tipo === 'apontador' || usuario.tipo === 'controlador' ? (
                        <Badge className="bg-green-100 text-green-800">✓</Badge>
                      ) : (
                        <Badge variant="secondary">✗</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuario.logs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.data}</TableCell>
                      <TableCell>{log.acao}</TableCell>
                      <TableCell>{log.entidade}</TableCell>
                      <TableCell>{log.ip || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {(!usuario.logs || usuario.logs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        Nenhum log encontrado
                      </TableCell>
                    </TableRow>
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
              Tem certeza que deseja excluir o usuário "{usuario.nome}"?
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