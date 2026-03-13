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
  Copy,
  Calendar,
  User,
  Globe,
  Lock
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

interface Modelo {
  id: number
  nome: string
  descricao?: string
  isPublic: boolean
  conteudo?: any
  createdBy?: {
    id: number
    nome: string
  }
  createdAt: string
  updatedAt: string
}

export default function DetalheModeloPage() {
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [modelo, setModelo] = useState<Modelo | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarModelo()
  }, [params.id])

  const carregarModelo = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/medicao/modelos/${params.id}`)
      setModelo(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar modelo',
        description: 'Não foi possível carregar os dados do modelo.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!modelo) return

    try {
      setDeleting(true)
      await api.delete(`/medicao/modelos/${modelo.id}`)
      
      toast({
        title: 'Modelo excluído',
        description: 'O modelo foi excluído com sucesso.'
      })

      window.location.href = '/app-empresa/medicao/modelos'
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o modelo.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleUsarModelo = () => {
    window.location.href = `/app-empresa/medicao/emitir?modelo=${modelo?.id}`
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

  if (!modelo) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Modelo não encontrado" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Modelo não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                O modelo que você está procurando não existe ou foi removido.
              </p>
              <Link href="/app-empresa/medicao/modelos">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para modelos
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
        <Header title={modelo.nome} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb e ações */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link
              href="/app-empresa/medicao/modelos"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para modelos
            </Link>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleUsarModelo}>
                <Copy className="mr-2 h-4 w-4" />
                Usar Modelo
              </Button>

              {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                <>
                  <Link href={`/app-empresa/medicao/modelos/${modelo.id}/edit`}>
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
                </>
              )}
            </div>
          </div>

          {/* Detalhes do Modelo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Informações do Modelo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="text-lg font-medium">{modelo.nome}</p>
                </div>

                {modelo.descricao && (
                  <div>
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p className="whitespace-pre-wrap">{modelo.descricao}</p>
                  </div>
                )}

                {modelo.conteudo && (
                  <div>
                    <p className="text-sm text-muted-foreground">Conteúdo do Modelo</p>
                    <pre className="mt-2 p-4 bg-muted/30 rounded-lg overflow-auto text-sm">
                      {JSON.stringify(modelo.conteudo, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {modelo.isPublic ? (
                    <>
                      <Globe className="h-4 w-4 text-green-600" />
                      <span>Público</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-yellow-600" />
                      <span>Privado</span>
                    </>
                  )}
                </div>

                {modelo.createdBy && (
                  <div>
                    <p className="text-sm text-muted-foreground">Criado por</p>
                    <p>{modelo.createdBy.nome}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p>{formatDate(modelo.createdAt, 'dd/MM/yyyy HH:mm')}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Última atualização</p>
                  <p>{formatDate(modelo.updatedAt, 'dd/MM/yyyy HH:mm')}</p>
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
            <DialogTitle>Excluir modelo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o modelo "{modelo.nome}"?
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