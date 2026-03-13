'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Download,
  Globe,
  Lock,
  Search,
  RefreshCw
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
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

interface RelatorioPersonalizado {
  id: number
  nome: string
  descricao?: string
  tipo: string
  isPublico: boolean
  agendado: boolean
  frequencia?: string
  destinatarios?: string[]
  createdAt: string
}

export default function RelatoriosPersonalizadosPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [relatorios, setRelatorios] = useState<RelatorioPersonalizado[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRelatorio, setSelectedRelatorio] = useState<RelatorioPersonalizado | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    carregarRelatorios()
  }, [])

  const carregarRelatorios = async () => {
    try {
      setLoading(true)
      const response = await api.get('/relatorios/personalizados')
      setRelatorios(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar relatórios',
        description: 'Não foi possível carregar a lista de relatórios.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
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

  const handleExecutar = async (id: number, formato: string = 'pdf') => {
    try {
      const response = await api.get(`/relatorios/personalizados/${id}/executar`, {
        params: { formato },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-${id}.${formato}`)
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

  const relatoriosFiltrados = relatorios.filter(r => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return r.nome.toLowerCase().includes(term) || r.descricao?.toLowerCase().includes(term)
    }
    if (tipoFiltro !== 'todos' && r.tipo !== tipoFiltro) return false
    return true
  })

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Relatórios Personalizados" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-40 bg-muted rounded animate-pulse" />
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
        <Header title="Relatórios Personalizados" />
        
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
                Relatórios Personalizados
              </h1>
              <p className="text-muted-foreground mt-1">
                Crie e gerencie seus próprios relatórios
              </p>
            </div>

            <Link href="/app-empresa/relatorios/personalizados/criar">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Relatório
              </Button>
            </Link>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar relatórios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                    <SelectItem value="equipamentos">Equipamentos</SelectItem>
                    <SelectItem value="obras">Obras</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={carregarRelatorios}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Relatórios */}
          {relatoriosFiltrados.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum relatório encontrado
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || tipoFiltro !== 'todos'
                    ? 'Tente ajustar os filtros'
                    : 'Crie seu primeiro relatório personalizado'}
                </p>
                <Link href="/app-empresa/relatorios/personalizados/criar">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Relatório
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatoriosFiltrados.map((relatorio, index) => (
                <motion.div
                  key={relatorio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold">{relatorio.nome}</h3>
                        </div>
                        {relatorio.isPublico ? (
                          <Globe className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>

                      {relatorio.descricao && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {relatorio.descricao}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{relatorio.tipo}</Badge>
                        {relatorio.agendado && (
                          <Badge className="bg-blue-100 text-blue-800">
                            <Calendar className="h-3 w-3 mr-1" />
                            Agendado
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleExecutar(relatorio.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Executar
                        </Button>

                        <Link href={`/app-empresa/relatorios/personalizados/${relatorio.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Link href={`/app-empresa/relatorios/personalizados/${relatorio.id}/editar`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        {user?.tipo === 'adm_empresa' && (
                          <Button
                            variant="ghost"
                            size="icon"
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
            <DialogTitle>Excluir relatório</DialogTitle>
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