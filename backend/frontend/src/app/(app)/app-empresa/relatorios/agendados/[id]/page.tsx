'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Edit,
  Trash2,
  Play,
  Pause,
  User,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
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

interface RelatorioAgendado {
  id: number
  nome: string
  descricao?: string
  tipo: string
  frequencia: string
  proximaExecucao: string
  destinatarios: string[]
  agendado: boolean
  configuracoes: any
  createdBy: {
    id: number
    nome: string
  }
  createdAt: string
  updatedAt: string
}

export default function DetalheRelatorioAgendadoPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [relatorio, setRelatorio] = useState<RelatorioAgendado | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarRelatorio()
  }, [params.id])

  const carregarRelatorio = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/relatorios/agendados/${params.id}`)
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

  const handleToggleAgendamento = async () => {
    if (!relatorio) return

    try {
      await api.patch(`/relatorios/agendados/${relatorio.id}/toggle`, { 
        ativo: !relatorio.agendado 
      })
      
      toast({
        title: relatorio.agendado ? 'Agendamento pausado' : 'Agendamento ativado',
        description: `O agendamento foi ${relatorio.agendado ? 'pausado' : 'ativado'} com sucesso.`
      })

      carregarRelatorio()
    } catch (error) {
      toast({
        title: 'Erro ao alterar agendamento',
        description: 'Não foi possível alterar o status do agendamento.',
        variant: 'destructive'
      })
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

      window.location.href = '/app-empresa/relatorios/agendados'
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

  const getFrequenciaLabel = (frequencia: string) => {
    const labels = {
      diario: 'Diário',
      semanal: 'Semanal',
      mensal: 'Mensal'
    }
    return labels[frequencia as keyof typeof labels] || frequencia
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
              <Calendar className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Relatório não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O relatório agendado que você está procurando não existe.
              </p>
              <Link href="/app-empresa/relatorios/agendados">
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
              href="/app-empresa/relatorios/agendados"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para lista
            </Link>

            <div className="flex gap-2">
              <Button
                variant={relatorio.agendado ? 'outline' : 'default'}
                onClick={handleToggleAgendamento}
              >
                {relatorio.agendado ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pausar Agendamento
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Ativar Agendamento
                  </>
                )}
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
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{relatorio.nome}</h1>
                        <Badge variant="outline">{relatorio.tipo}</Badge>
                        <Badge className={relatorio.agendado ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {relatorio.agendado ? 'Ativo' : 'Pausado'}
                        </Badge>
                      </div>
                      {relatorio.descricao && (
                        <p className="text-muted-foreground">{relatorio.descricao}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detalhes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configurações do Agendamento */}
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Frequência</p>
                    <p className="font-medium">{getFrequenciaLabel(relatorio.frequencia)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima Execução</p>
                    <p className="font-medium">{formatDate(relatorio.proximaExecucao, 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                </div>

                {relatorio.destinatarios.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Destinatários</p>
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
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Criado por</p>
                    <p className="font-medium">{relatorio.createdBy.nome}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p>{formatDate(relatorio.createdAt, 'dd/MM/yyyy HH:mm')}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Última atualização</p>
                  <p>{formatDate(relatorio.updatedAt, 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>

      {/* Modal de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir relatório agendado</DialogTitle>
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