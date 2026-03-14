'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Copy,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
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

interface Modelo {
  id: number
  nome: string
  descricao?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export default function ModelosPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [modelos, setModelos] = useState<Modelo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedModelo, setSelectedModelo] = useState<Modelo | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarModelos()
  }, [])

  const carregarModelos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/medicao/modelos')
      setModelos(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar modelos',
        description: 'Não foi possível carregar a lista de modelos.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedModelo) return

    try {
      setDeleting(true)
      await api.delete(`/medicao/modelos/${selectedModelo.id}`)
      
      toast({
        title: 'Modelo excluído',
        description: 'O modelo foi excluído com sucesso.'
      })

      carregarModelos()
      setDeleteDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o modelo.',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setSelectedModelo(null)
    }
  }

  const modelosFiltrados = modelos.filter(modelo =>
    modelo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    modelo.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Modelos de Medição" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/medicao"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Medição
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Modelos de Medição
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os modelos para agilizar a criação de medições
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Link href="/app-empresa/medicao/modelos/novo">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Modelo
                </Button>
              </Link>
            )}
          </div>

          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar modelos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Modelos */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48 mb-4" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : modelosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum modelo encontrado
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? 'Tente buscar por outro termo'
                    : 'Crie seu primeiro modelo de medição'}
                </p>
                {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                  <Link href="/app-empresa/medicao/modelos/novo">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Modelo
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modelosFiltrados.map((modelo, index) => (
                <motion.div
                  key={modelo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{modelo.nome}</h3>
                          {modelo.descricao && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {modelo.descricao}
                            </p>
                          )}
                        </div>
                        {modelo.isPublic && (
                          <Badge variant="outline" className="text-xs">
                            Público
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <Link href={`/app-empresa/medicao/modelos/${modelo.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Link href={`/app-empresa/medicao/emitir?modelo=${modelo.id}`}>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            <Copy className="h-4 w-4" />
                          </Button>
                        </Link>

                        {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                          <>
                            <Link href={`/app-empresa/medicao/modelos/${modelo.id}/edit`}>
                              <Button variant="outline" size="icon" className="h-8 w-8">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            {user?.tipo === 'adm_empresa' && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setSelectedModelo(modelo)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </>
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
            <DialogTitle>Excluir modelo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o modelo "{selectedModelo?.nome}"?
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