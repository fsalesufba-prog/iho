'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Users,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
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

import { Progress } from '@/components/ui/Progress'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EmpresaDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresaId: number
}

export function EmpresaDetails({ open, onOpenChange, empresaId }: EmpresaDetailsProps) {
  const [empresa, setEmpresa] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      carregarEmpresa()
    }
  }, [open, empresaId])

  const carregarEmpresa = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/empresas/${empresaId}`)
      setEmpresa(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da empresa',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>
      case 'atrasado':
        return <Badge variant="destructive">Em atraso</Badge>
      case 'cancelado':
        return <Badge variant="outline">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading || !empresa) {
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
            <Building2 className="h-5 w-5" />
            <span>{empresa.nome}</span>
            {getStatusBadge(empresa.status)}
          </DialogTitle>
          <DialogDescription>
            CNPJ: {empresa.cnpj} | Cadastrado em {format(new Date(empresa.dataCadastro), "dd/MM/yyyy", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{empresa.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{empresa.telefone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{empresa.endereco}, {empresa.cidade}/{empresa.estado} - CEP: {empresa.cep}</span>
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

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Obras Ativas</p>
                    <p className="text-2xl font-bold">{empresa.obras?.filter((o: any) => o.status === 'ativa').length || 0}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários</p>
                    <p className="text-2xl font-bold">{empresa._count.usuarios}</p>
                  </div>
                  <Users className="h-8 w-8 text-muted-foreground" />
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
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="usuarios">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="usuarios">Usuários</TabsTrigger>
              <TabsTrigger value="obras">Obras</TabsTrigger>
              <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
            </TabsList>

            <TabsContent value="usuarios" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Usuários da Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Último Acesso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empresa.usuarios?.map((usuario: any) => (
                        <TableRow key={usuario.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{getInitials(usuario.nome)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{usuario.nome}</p>
                                <p className="text-xs text-muted-foreground">{usuario.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {usuario.tipo === 'adm_empresa' ? 'Admin' : 
                               usuario.tipo === 'controlador' ? 'Controlador' : 'Apontador'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {usuario.ativo ? (
                              <span className="flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Ativo
                              </span>
                            ) : (
                              <span className="flex items-center text-red-600">
                                <XCircle className="h-4 w-4 mr-1" />
                                Inativo
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {usuario.ultimoAcesso 
                              ? format(new Date(usuario.ultimoAcesso), "dd/MM/yyyy HH:mm")
                              : 'Nunca'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="obras" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Obras da Empresa</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Obra</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Frentes</TableHead>
                        <TableHead>Equipamentos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empresa.obras?.map((obra: any) => (
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
                          <TableCell>{obra._count.frenteServicos}</TableCell>
                          <TableCell>{obra._count.equipamentos}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pagamentos" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Forma</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empresa.pagamentos?.map((pagamento: any) => (
                        <TableRow key={pagamento.id}>
                          <TableCell>
                            {format(new Date(pagamento.dataVencimento), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            {pagamento.tipo === 'implantacao' ? 'Implantação' : 'Mensalidade'}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL' 
                            }).format(pagamento.valor)}
                          </TableCell>
                          <TableCell>
                            {pagamento.status === 'pago' ? (
                              <Badge className="bg-green-100 text-green-800">Pago</Badge>
                            ) : pagamento.status === 'atrasado' ? (
                              <Badge variant="destructive">Atrasado</Badge>
                            ) : (
                              <Badge variant="secondary">{pagamento.status}</Badge>
                            )}
                          </TableCell>
                          <TableCell>{pagamento.formaPagamento || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="logs" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Logs de Atividades</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Ação</TableHead>
                        <TableHead>Entidade</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {empresa.logs?.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm")}
                          </TableCell>
                          <TableCell>{log.usuario?.nome || 'Sistema'}</TableCell>
                          <TableCell>{log.acao}</TableCell>
                          <TableCell>{log.entidade}</TableCell>
                          <TableCell>{log.ip || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}