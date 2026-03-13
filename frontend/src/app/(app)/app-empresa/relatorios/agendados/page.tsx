'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  Clock,
  Mail,
  RefreshCw,
  Play,
  Pause
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
}

export default function RelatoriosAgendadosPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [relatorios, setRelatorios] = useState<RelatorioAgendado[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRelatorio, setSelectedRelatorio] = useState<RelatorioAgendado | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarRelatorios()
  }, [])

  const carregarRelatorios = async () => {
    try {
      setLoading(true)
      const response = await api.get('/relatorios/agendados')
      setRelatorios(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar relatórios',
        description: 'Não foi possível carregar a lista de relatórios agendados.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarRelatorios()
    setRefreshing(false)
  }

  const handleToggleAgendamento = async (id: number, ativo: boolean) => {
    try {
      await api.patch(`/relatorios/agendados/${id}/toggle`, { ativo })
      
      toast({
        title: ativo ? 'Agendamento ativado' : 'Agendamento desativado',
        description: `O agendamento foi ${ativo ? 'ativado' : 'desativado'} com sucesso.`
      })

      carregarRelatorios()
    } catch (error) {
      toast({
        title: 'Erro ao alterar agendamento',
        description: 'Não foi possível alterar o status do agendamento.',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async () => {
    if (!selectedRelatorio) return

    try {
      setDeleting(true)
      await api.delete(`/relatorios/personalizados/${selectedRelatorio.id}`)
      
      toast({
        title: 'Relatório excluído',
        description: 'O relatório foi excluído com sucesso.'
      })

      carregarRelatorios()
      setDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o relatório.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setSelectedRelatorio(null)
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
          <Header title="Relatórios Agendados" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-48 bg-muted rounded animate-pulse" />
                ))}
              </div>
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
        <Header title="Relatórios Agendados" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/relatorios"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Relatórios
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Relatórios Agendados
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os relatórios que serão gerados automaticamente
              </p>
            </div>

            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Lista de Relatórios */}
          {relatorios.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum relatório agendado
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie um relatório personalizado e ative o agendamento
                </p>
                <Link href="/app-empresa/relatorios/personalizados/criar">
                  <Button>
                    Criar Relatório
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatorios.map((relatorio, index) => (
                <motion.div
                  key={relatorio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{relatorio.nome}</h3>
                          {relatorio.descricao && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {relatorio.descricao}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">{relatorio.tipo}</Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>Frequência: {getFrequenciaLabel(relatorio.frequencia)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Próxima execução: {formatDate(relatorio.proximaExecucao, 'dd/MM/yyyy HH:mm')}</span>
                        </div>

                        {relatorio.destinatarios.length > 0 && (
                          <div className="flex items-start gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div className="flex flex-wrap gap-1">
                              {relatorio.destinatarios.map((email, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {email}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAgendamento(relatorio.id, !relatorio.agendado)}
                          >
                            {relatorio.agendado ? (
                              <>
                                <Pause className="h-4 w-4 mr-1" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-1" />
                                Ativar
                              </>
                            )}
                          </Button>

                          <Link href={`/app-empresa/relatorios/personalizados/${relatorio.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                          </Link>

                          <Link href={`/app-empresa/relatorios/personalizados/${relatorio.id}/editar`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                        </div>

                        {user?.tipo === 'adm_empresa' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedRelatorio(relatorio)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      </main>

      {/* Modal de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir relatório agendado</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o relatório "{selectedRelatorio?.nome}"?
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