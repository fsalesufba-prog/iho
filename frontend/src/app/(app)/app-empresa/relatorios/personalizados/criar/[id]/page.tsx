'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Edit,
  Trash2,
  Download,
  Calendar,
  Globe,
  Lock,
  Mail,
  Clock,
  User,
  RefreshCw
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
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

interface RelatorioPersonalizado {
  id: number
  nome: string
  descricao?: string
  tipo: string
  isPublico: boolean
  agendado: boolean
  frequencia?: string
  destinatarios?: string[]
  configuracoes: {
    colunas: string[]
    filtros?: Record<string, any>
    agrupamento?: string
    ordenacao?: string
    graficos?: Array<{
      tipo: string
      titulo: string
      dados: string[]
    }>
  }
  createdBy: {
    id: number
    nome: string
  }
  createdAt: string
  updatedAt: string
}

export default function DetalheRelatorioPersonalizadoPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [relatorio, setRelatorio] = useState<RelatorioPersonalizado | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formato, setFormato] = useState('pdf')

  useEffect(() => {
    carregarRelatorio()
  }, [params.id])

  const carregarRelatorio = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/relatorios/personalizados/${params.id}`)
      setRelatorio(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar relatório',
        description: 'Não foi possível carregar os dados do relatório.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!relatorio) return

    try {
      setDeleting(true)
      await api.delete(`/relatorios/personalizados/${relatorio.id}`)
      
      toast({
        title: 'Relatório excluído',
        description: 'O relatório foi excluído com sucesso.'
      })

      window.location.href = '/app-empresa/relatorios/personalizados'
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o relatório.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleExecutar = async () => {
    if (!relatorio) return

    try {
      const response = await api.get(`/relatorios/personalizados/${relatorio.id}/executar`, {
        params: { formato },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${relatorio.nome}.${formato}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast({
        title: 'Erro ao executar',
        description: 'Não foi possível executar o relatório.',
        variant: 'destructive'
      })
    }
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
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </Container>
        </main>
      </>
    )
  }

  if (!relatorio) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Relatório não encontrado" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Relatório não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O relatório que você está procurando não existe ou foi removido.
              </p>
              <Link href="/app-empresa/relatorios/personalizados">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para lista
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
        <Header title={relatorio.nome} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb e ações */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link
              href="/app-empresa/relatorios/personalizados"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista
            </Link>

            <div className="flex gap-2">
              <Select value={formato} onValueChange={setFormato}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleExecutar}>
                <Download className="mr-2 h-4 w-4" />
                Executar
              </Button>

              <Link href={`/app-empresa/relatorios/personalizados/${relatorio.id}/editar`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
              </Link>

              {user?.tipo === 'adm_empresa' && (
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              )}
            </div>
          </div>

          {/* Header do Relatório */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{relatorio.nome}</h1>
                        {relatorio.isPublico ? (
                          <Badge className="bg-green-100 text-green-800">
                            <Globe className="h-3 w-3 mr-1" />
                            Público
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Lock className="h-3 w-3 mr-1" />
                            Privado
                          </Badge>
                        )}
                        {relatorio.agendado && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            Agendado
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{relatorio.descricao}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline">{relatorio.tipo}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Criado por {relatorio.createdBy.nome}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Configurações */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Configurações do Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Colunas Selecionadas</h3>
                  <div className="flex flex-wrap gap-2">
                    {relatorio.configuracoes.colunas.map((coluna, index) => (
                      <Badge key={index} variant="secondary">
                        {coluna}
                      </Badge>
                    ))}
                  </div>
                </div>

                {relatorio.configuracoes.agrupamento && (
                  <div>
                    <h3 className="font-medium mb-2">Agrupamento</h3>
                    <Badge variant="outline">{relatorio.configuracoes.agrupamento}</Badge>
                  </div>
                )}

                {relatorio.configuracoes.ordenacao && (
                  <div>
                    <h3 className="font-medium mb-2">Ordenação</h3>
                    <Badge variant="outline">{relatorio.configuracoes.ordenacao}</Badge>
                  </div>
                )}

                {relatorio.configuracoes.graficos && relatorio.configuracoes.graficos.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Gráficos</h3>
                    <div className="space-y-2">
                      {relatorio.configuracoes.graficos.map((grafico, index) => (
                        <div key={index} className="p-2 bg-muted/30 rounded">
                          <p className="font-medium">{grafico.titulo}</p>
                          <p className="text-xs text-muted-foreground">
                            Tipo: {grafico.tipo} • Dados: {grafico.dados.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p>{formatDate(relatorio.createdAt, 'dd/MM/yyyy HH:mm')}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Última atualização</p>
                  <p>{formatDate(relatorio.updatedAt, 'dd/MM/yyyy HH:mm')}</p>
                </div>

                {relatorio.agendado && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Frequência</p>
                      <Badge variant="outline">{relatorio.frequencia}</Badge>
                    </div>

                    {relatorio.destinatarios && relatorio.destinatarios.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Destinatários</p>
                        <div className="space-y-1">
                          {relatorio.destinatarios.map((email, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span>{email}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>

      {/* Modal de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir relatório</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o relatório "{relatorio.nome}"?
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