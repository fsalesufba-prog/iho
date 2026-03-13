'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Shield,
  Clock,
  User,
  Edit,
  Trash2,
  Activity,
  LogIn,
  Key,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Building2,
  Briefcase,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Usuario {
  id: number
  nome: string
  email: string
  tipo: 'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'
  ativo: boolean
  ultimoAcesso: string | null
  createdAt: string
  updatedAt: string
  avatar?: string
  telefone?: string
  cargo?: string
  departamento?: string
  empresa?: {
    id: number
    nome: string
    cnpj: string
  }
  permissoes?: string[]
  logs?: Log[]
}

interface Log {
  id: number
  acao: string
  entidade: string
  entidadeId: number
  dadosAntigos: string | null
  dadosNovos: string | null
  ip: string
  userAgent: string
  createdAt: string
}

export default function UsuarioDetalhePage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarUsuario()
    carregarLogs()
  }, [params.id])

  const carregarUsuario = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/usuarios/${params.id}`)
      setUsuario(response.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuário',
        description: 'Não foi possível carregar os dados do usuário.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarLogs = async () => {
    try {
      const response = await api.get(`/logs`, {
        params: {
          usuarioId: params.id,
          limit: 10
        }
      })
      setLogs(response.data.logs)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    }
  }

  const handleDelete = async () => {
    if (!usuario) return

    try {
      setDeleting(true)
      await api.delete(`/usuarios/${usuario.id}`)
      
      toast({
        title: 'Usuário excluído',
        description: 'O usuário foi excluído com sucesso.'
      })

      window.location.href = '/app-empresa/usuarios'
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o usuário.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!usuario) return

    try {
      await api.patch(`/usuarios/${usuario.id}/status`, {
        ativo: !usuario.ativo
      })

      toast({
        title: usuario.ativo ? 'Usuário desativado' : 'Usuário ativado',
        description: usuario.ativo 
          ? 'O usuário foi desativado com sucesso.'
          : 'O usuário foi ativado com sucesso.'
      })

      carregarUsuario()
    } catch (error) {
      toast({
        title: 'Erro ao alterar status',
        description: 'Não foi possível alterar o status do usuário.',
        variant: 'destructive'
      })
    }
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      adm_sistema: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      adm_empresa: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      controlador: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      apontador: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return variants[tipo as keyof typeof variants] || ''
  }

  const getTipoLabel = (tipo: string) => {
    const labels = {
      adm_sistema: 'ADM Sistema',
      adm_empresa: 'ADM Empresa',
      controlador: 'Controlador',
      apontador: 'Apontador'
    }
    return labels[tipo as keyof typeof labels] || tipo
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Carregando..." />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-32 bg-muted rounded-lg animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </Container>
        </main>
      </>
    )
  }

  if (!usuario) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Usuário não encontrado" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Usuário não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O usuário que você está procurando não existe ou foi removido.
              </p>
              <Link href="/app-empresa/usuarios">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para usuários
                </Button>
              </Link>
            </div>
          </Container>
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title={usuario.nome} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb e ações */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link
              href="/app-empresa/usuarios"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para usuários
            </Link>

            {user?.tipo === 'adm_empresa' && (
              <div className="flex gap-2">
                <Button
                  variant={usuario.ativo ? 'destructive' : 'default'}
                  onClick={handleToggleStatus}
                >
                  {usuario.ativo ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Ativar
                    </>
                  )}
                </Button>

                <Link href={`/app-empresa/usuarios/${usuario.id}/edit`}>
                  <Button variant="outline">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            )}
          </div>

          {/* Header do usuário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20" />
              <CardContent className="relative p-6">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                  <Avatar className="h-24 w-24 border-4 border-background -mt-12">
                    <AvatarImage src={usuario.avatar} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {getInitials(usuario.nome)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div>
                        <h1 className="text-3xl font-bold">{usuario.nome}</h1>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getTipoBadge(usuario.tipo)}>
                            {getTipoLabel(usuario.tipo)}
                          </Badge>
                          <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {usuario.ultimoAcesso && (
                    <div className="text-right text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 inline mr-1" />
                      Último acesso: {formatDate(usuario.ultimoAcesso, 'dd/MM/yyyy HH:mm')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="info" className="space-y-6">
            <TabsList>
              <TabsTrigger value="info">
                <User className="h-4 w-4 mr-2" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="permissoes">
                <Shield className="h-4 w-4 mr-2" />
                Permissões
              </TabsTrigger>
              <TabsTrigger value="logs">
                <Activity className="h-4 w-4 mr-2" />
                Atividades
              </TabsTrigger>
              <TabsTrigger value="seguranca">
                <Key className="h-4 w-4 mr-2" />
                Segurança
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Nome completo
                        </label>
                        <p className="text-lg">{usuario.nome}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Email
                        </label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${usuario.email}`} className="text-primary hover:underline">
                            {usuario.email}
                          </a>
                        </div>
                      </div>
                      {usuario.telefone && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Telefone
                          </label>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <a href={`tel:${usuario.telefone}`} className="hover:underline">
                              {usuario.telefone}
                            </a>
                          </div>
                        </div>
                      )}
                      {usuario.cargo && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Cargo
                          </label>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                            <span>{usuario.cargo}</span>
                          </div>
                        </div>
                      )}
                      {usuario.departamento && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Departamento
                          </label>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{usuario.departamento}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Data de cadastro
                        </label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(usuario.createdAt, 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Última atualização
                        </label>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatDate(usuario.updatedAt, 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Empresa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {usuario.empresa ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Nome
                          </label>
                          <p className="font-medium">{usuario.empresa.nome}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            CNPJ
                          </label>
                          <p className="font-mono">{usuario.empresa.cnpj}</p>
                        </div>
                        <Link href={`/app-empresa/configuracoes/empresa`}>
                          <Button variant="outline" className="w-full">
                            <Building2 className="mr-2 h-4 w-4" />
                            Ver detalhes
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Usuário não vinculado a empresa</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="permissoes">
              <Card>
                <CardHeader>
                  <CardTitle>Permissões do Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Tipo de Acesso</h3>
                      <div className="p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">{getTipoLabel(usuario.tipo)}</p>
                            <p className="text-sm text-muted-foreground">
                              {usuario.tipo === 'adm_empresa' && 'Acesso completo à gestão da empresa'}
                              {usuario.tipo === 'controlador' && 'Acesso a controle e indicadores'}
                              {usuario.tipo === 'apontador' && 'Acesso apenas a apontamentos'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Funcionalidades Disponíveis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {usuario.tipo === 'adm_empresa' && (
                          <>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100/50 text-green-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Gerenciar usuários</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100/50 text-green-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Gerenciar planos</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100/50 text-green-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Configurações da empresa</span>
                            </div>
                          </>
                        )}
                        {(usuario.tipo === 'adm_empresa' || usuario.tipo === 'controlador') && (
                          <>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100/50 text-green-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Criar equipamentos</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100/50 text-green-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Visualizar indicadores</span>
                            </div>
                          </>
                        )}
                        {usuario.tipo === 'apontador' && (
                          <>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100/50 text-green-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Fazer apontamentos</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-green-100/50 text-green-800">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-sm">Visualizar frentes de serviço</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs">
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {logs.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        Nenhuma atividade registrada
                      </p>
                    ) : (
                      <div className="relative pl-8 space-y-4">
                        <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary to-accent" />
                        {logs.map((log, index) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative"
                          >
                            <div className="absolute -left-8 top-2 w-4 h-4 rounded-full bg-primary" />
                            <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{log.acao}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(log.createdAt, 'dd/MM/yyyy HH:mm')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Entidade: {log.entidade} #{log.entidadeId}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                IP: {log.ip}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seguranca">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações de Segurança</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Último acesso
                      </label>
                      <p>{usuario.ultimoAcesso ? formatDate(usuario.ultimoAcesso, 'dd/MM/yyyy HH:mm') : 'Nunca acessou'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Status da conta
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                          {usuario.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ações de Segurança</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Key className="mr-2 h-4 w-4" />
                      Enviar email de redefinição de senha
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                      <LogIn className="mr-2 h-4 w-4" />
                      Revogar todas as sessões
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Container>
      </main>

      {/* Modal de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o usuário {usuario?.nome}?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}