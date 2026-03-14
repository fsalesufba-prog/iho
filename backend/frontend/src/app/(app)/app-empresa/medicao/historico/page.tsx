'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  Download,
  Eye,
  Clock,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Medicao {
  id: number
  titulo: string
  obra: {
    id: number
    nome: string
    codigo: string
  }
  periodoInicio: string
  periodoFim: string
  valorTotal: number
  horasTotal: number
  status: 'rascunho' | 'emitida' | 'aprovada' | 'cancelada'
  dataEmissao?: string
  dataAprovacao?: string
  createdBy: {
    nome: string
  }
  createdAt: string
}

export default function HistoricoMedicoesPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [medicoes, setMedicoes] = useState<Medicao[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFiltro, setStatusFiltro] = useState<string>('todos')
  const [anoFiltro, setAnoFiltro] = useState<string>(new Date().getFullYear().toString())

  const anos = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())

  useEffect(() => {
    carregarMedicoes()
  }, [page, statusFiltro, anoFiltro, searchTerm])

  const carregarMedicoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/medicao', {
        params: {
          page,
          limit: 10,
          search: searchTerm || undefined,
          status: statusFiltro !== 'todos' ? statusFiltro : undefined,
          ano: anoFiltro
        }
      })
      setMedicoes(response.data.medicoes)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      toast({
        title: 'Erro ao carregar histórico',
        description: 'Não foi possível carregar o histórico de medições.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (id: number, formato: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/medicao/${id}/download`, {
        params: { formato },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `medicao-${id}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast({
        title: 'Erro ao baixar',
        description: 'Não foi possível baixar o arquivo.',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      rascunho: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      emitida: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      aprovada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Histórico de Medições" />
        
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
                Histórico de Medições
              </h1>
              <p className="text-muted-foreground mt-1">
                Consulte todas as medições realizadas
              </p>
            </div>
          </div>

          {/* Filtros */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por título ou obra..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="emitida">Emitida</SelectItem>
                      <SelectItem value="aprovada">Aprovada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={anoFiltro} onValueChange={setAnoFiltro}>
                    <SelectTrigger className="w-[120px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Ano" />
                    </SelectTrigger>
                    <SelectContent>
                      {anos.map(ano => (
                        <SelectItem key={ano} value={ano}>{ano}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Medições */}
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : medicoes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma medição encontrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFiltro !== 'todos' || anoFiltro
                    ? 'Tente ajustar os filtros'
                    : 'Nenhuma medição foi realizada ainda'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {medicoes.map((medicao, index) => (
                <motion.div
                  key={medicao.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{medicao.titulo}</h3>
                            <Badge className={getStatusBadge(medicao.status)}>
                              {medicao.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{medicao.obra.nome} ({medicao.obra.codigo})</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {formatDate(medicao.periodoInicio, 'dd/MM/yyyy')} - {formatDate(medicao.periodoFim, 'dd/MM/yyyy')}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{medicao.horasTotal} horas</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-bold text-primary">
                                {formatCurrency(medicao.valorTotal)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 text-xs text-muted-foreground">
                            Criado por {medicao.createdBy.nome} em {formatDate(medicao.createdAt, 'dd/MM/yyyy')}
                            {medicao.dataEmissao && ` • Emitida em ${formatDate(medicao.dataEmissao, 'dd/MM/yyyy')}`}
                            {medicao.dataAprovacao && ` • Aprovada em ${formatDate(medicao.dataAprovacao, 'dd/MM/yyyy')}`}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDownload(medicao.id, 'pdf')}
                            title="Download PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDownload(medicao.id, 'excel')}
                            title="Download Excel"
                          >
                            <Download className="h-4 w-4" />
                          </Button>

                          <Link href={`/app-empresa/medicao/historico/${medicao.id}`}>
                            <Button variant="outline" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Container>
      </main>
    </>
  )
}