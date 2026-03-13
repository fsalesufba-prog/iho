'use client'

import React, { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  Shield,
  Key,
  Activity,
  RefreshCw,
  Edit,
  Lock,
  Unlock
} from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/Separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface UsuarioDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  usuarioId: number
}

export function UsuarioDetails({ open, onOpenChange, usuarioId }: UsuarioDetailsProps) {
  const [usuario, setUsuario] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      carregarUsuario()
      carregarLogs()
    }
  }, [open, usuarioId])

  const carregarUsuario = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/usuarios/${usuarioId}`)
      setUsuario(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do usuário',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarLogs = async () => {
    try {
      const response = await api.get(`/usuarios/${usuarioId}/logs`, {
        params: { limit: 20 }
      })
      setLogs(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    }
  }

  const getTipoBadge = (tipo: string) => {
    const config = {
      adm_sistema: { color: 'bg-purple-100 text-purple-800', label: 'Admin Sistema' },
      adm_empresa: { color: 'bg-blue-100 text-blue-800', label: 'Admin Empresa' },
      controlador: { color: 'bg-green-100 text-green-800', label: 'Controlador' },
      apontador: { color: 'bg-yellow-100 text-yellow-800', label: 'Apontador' }
    }
    const c = config[tipo as keyof typeof config] || config.apontador
    return <Badge className={c.color}>{c.label}</Badge>
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading || !usuario) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center h-96">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>Detalhes do Usuário</span>
          </DialogTitle>
          <DialogDescription>
            ID: {usuario.id} | Cadastrado em {format(new Date(usuario.createdAt), "dd/MM/yyyy", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Cabeçalho com Avatar */}
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={usuario.avatar} />
              <AvatarFallback className="text-2xl">{getInitials(usuario.nome)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{usuario.nome}</h2>
                {getTipoBadge(usuario.tipo)}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{usuario.email}</span>
                </div>
                {usuario.telefone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{usuario.telefone}</span>
                  </div>
                )}
                {usuario.empresa && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{usuario.empresa.nome}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm">
                {usuario.ativo ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Ativar
                  </>
                )}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Cards de Informações */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="mt-2">
                  {usuario.ativo ? (
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  ) : (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Último Acesso</span>
                </div>
                <div className="mt-2">
                  {usuario.ultimoAcesso ? (
                    <span className="text-sm">
                      {format(new Date(usuario.ultimoAcesso), "dd/MM/yyyy HH:mm")}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Nunca acessou</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Permissões</span>
                </div>
                <div className="mt-2">
                  <Badge variant="outline">Ver detalhes</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="logs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="logs">Logs de Atividade</TabsTrigger>
              <TabsTrigger value="acessos">Histórico de Acessos</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Atividades</CardTitle>
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
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.acao}</Badge>
                          </TableCell>
                          <TableCell>{log.entidade}</TableCell>
                          <TableCell>{log.ip || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="acessos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Acessos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Histórico de acessos em desenvolvimento
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="permissoes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Permissões do Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground py-8">
                    Gerenciamento de permissões em desenvolvimento
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}