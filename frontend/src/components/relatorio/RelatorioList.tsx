'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Clock,
  FileText,
  Share2,
  Star
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { RelatorioForm } from './RelatorioForm'
import { RelatorioPreview } from './RelatorioPreview'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Relatorio {
  id: number
  nome: string
  descricao?: string
  tipo: 'executivo' | 'operacional' | 'financeiro' | 'manutencao' | 'equipamentos' | 'obras' | 'usuarios' | 'personalizado'
  formato: 'pdf' | 'excel' | 'csv' | 'html'
  periodo?: string
  agendado?: boolean
  frequencia?: 'diario' | 'semanal' | 'mensal' | 'trimestral' | 'anual'
  ultimaGeracao?: string
  proximaGeracao?: string
  tamanho?: number
  url?: string
  favorito: boolean
  compartilhado: boolean
  created_at: string
}

interface RelatorioListProps {
  relatorios?: Relatorio[]
  simple?: boolean
}

export function RelatorioList({ relatorios: initialRelatorios, simple }: RelatorioListProps) {
  const [relatorios, setRelatorios] = useState<Relatorio[]>(initialRelatorios || [])
  const [loading, setLoading] = useState(!initialRelatorios)
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [formato, setFormato] = useState('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedRelatorio, setSelectedRelatorio] = useState<Relatorio | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!initialRelatorios) {
      carregarRelatorios()
    }
  }, [page, tipo, formato, search])

  const carregarRelatorios = async () => {
    try {
      setLoading(true)
      const response = await api.get('/relatorios', {
        params: {
          page,
          limit: simple ? 5 : 10,
          tipo: tipo !== 'todos' ? tipo : undefined,
          formato: formato !== 'todos' ? formato : undefined,
          search: search || undefined
        }
      })
      setRelatorios(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os relatórios',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarRelatorios()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/relatorios/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Relatório excluído com sucesso'
      })
      carregarRelatorios()
    } catch (error) {
      console.error('Erro ao excluir relatório:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o relatório',
        variant: 'destructive'
      })
    }
  }

  const handleToggleFavorito = async (id: number, favorito: boolean) => {
    try {
      await api.patch(`/relatorios/${id}/favorito`, { favorito: !favorito })
      setRelatorios(prev =>
        prev.map(r => r.id === id ? { ...r, favorito: !favorito } : r)
      )
      toast({
        title: 'Sucesso',
        description: !favorito ? 'Adicionado aos favoritos' : 'Removido dos favoritos'
      })
    } catch (error) {
      console.error('Erro ao alterar favorito:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o favorito',
        variant: 'destructive'
      })
    }
  }

  const handleDuplicar = async (relatorio: Relatorio) => {
    try {
      const { id, created_at, ultimaGeracao, proximaGeracao, tamanho, url, ...data } = relatorio
      await api.post('/relatorios', {
        ...data,
        nome: `${relatorio.nome} (cópia)`
      })
      toast({
        title: 'Sucesso',
        description: 'Relatório duplicado com sucesso'
      })
      carregarRelatorios()
    } catch (error) {
      console.error('Erro ao duplicar relatório:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar o relatório',
        variant: 'destructive'
      })
    }
  }

  const handleDownload = async (relatorio: Relatorio) => {
    try {
      const response = await api.get(`/relatorios/${relatorio.id}/download`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${relatorio.nome}.${relatorio.formato}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast({
        title: 'Sucesso',
        description: 'Download iniciado'
      })
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o relatório',
        variant: 'destructive'
      })
    }
  }

  const getTipoBadge = (tipo: string) => {
    const config = {
      executivo: { color: 'bg-purple-100 text-purple-800', label: 'Executivo' },
      operacional: { color: 'bg-blue-100 text-blue-800', label: 'Operacional' },
      financeiro: { color: 'bg-green-100 text-green-800', label: 'Financeiro' },
      manutencao: { color: 'bg-yellow-100 text-yellow-800', label: 'Manutenção' },
      equipamentos: { color: 'bg-orange-100 text-orange-800', label: 'Equipamentos' },
      obras: { color: 'bg-red-100 text-red-800', label: 'Obras' },
      usuarios: { color: 'bg-indigo-100 text-indigo-800', label: 'Usuários' },
      personalizado: { color: 'bg-gray-100 text-gray-800', label: 'Personalizado' }
    }
    const c = config[tipo as keyof typeof config] || config.personalizado
    return <Badge className={c.color}>{c.label}</Badge>
  }

  const getFormatoBadge = (formato: string) => {
    switch (formato) {
      case 'pdf':
        return <Badge className="bg-red-100 text-red-800">PDF</Badge>
      case 'excel':
        return <Badge className="bg-green-100 text-green-800">Excel</Badge>
      case 'csv':
        return <Badge className="bg-blue-100 text-blue-800">CSV</Badge>
      case 'html':
        return <Badge className="bg-purple-100 text-purple-800">HTML</Badge>
      default:
        return <Badge variant="outline">{formato}</Badge>
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (simple) {
    return (
      <div className="space-y-4">
        {relatorios.map((relatorio) => (
          <div
            key={relatorio.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
            onClick={() => {
              setSelectedRelatorio(relatorio)
              setShowPreview(true)
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{relatorio.nome}</span>
                {relatorio.favorito && (
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {getTipoBadge(relatorio.tipo)} {getFormatoBadge(relatorio.formato)}
                {relatorio.ultimaGeracao && ` • ${format(new Date(relatorio.ultimaGeracao), "dd/MM/yyyy")}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Relatórios</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="executivo">Executivo</SelectItem>
                <SelectItem value="operacional">Operacional</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="equipamentos">Equipamentos</SelectItem>
                <SelectItem value="obras">Obras</SelectItem>
                <SelectItem value="usuarios">Usuários</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={formato} onValueChange={setFormato}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarRelatorios}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Agendamento</TableHead>
                  <TableHead>Última Geração</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : relatorios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum relatório encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  relatorios.map((relatorio) => (
                    <TableRow key={relatorio.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{relatorio.nome}</p>
                            {relatorio.descricao && (
                              <p className="text-xs text-muted-foreground">{relatorio.descricao}</p>
                            )}
                          </div>
                          {relatorio.favorito && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTipoBadge(relatorio.tipo)}</TableCell>
                      <TableCell>{getFormatoBadge(relatorio.formato)}</TableCell>
                      <TableCell>{relatorio.periodo || '-'}</TableCell>
                      <TableCell>
                        {relatorio.agendado ? (
                          <div>
                            <Badge variant="secondary" className="mb-1">
                              {relatorio.frequencia}
                            </Badge>
                            {relatorio.proximaGeracao && (
                              <p className="text-xs text-muted-foreground">
                                Próxima: {format(new Date(relatorio.proximaGeracao), "dd/MM/yyyy")}
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline">Não agendado</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {relatorio.ultimaGeracao ? (
                          format(new Date(relatorio.ultimaGeracao), "dd/MM/yyyy HH:mm")
                        ) : '-'}
                      </TableCell>
                      <TableCell>{formatFileSize(relatorio.tamanho)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedRelatorio(relatorio)
                              setShowPreview(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(relatorio)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedRelatorio(relatorio)
                              setShowForm(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicar(relatorio)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFavorito(relatorio.id, relatorio.favorito)}>
                              <Star className="h-4 w-4 mr-2" />
                              {relatorio.favorito ? 'Remover favorito' : 'Adicionar favorito'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="h-4 w-4 mr-2" />
                              Compartilhar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(relatorio.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modais */}
      {showForm && (
        <RelatorioForm
          open={showForm}
          onOpenChange={setShowForm}
          relatorio={selectedRelatorio}
          onSuccess={() => {
            setShowForm(false)
            setSelectedRelatorio(null)
            carregarRelatorios()
          }}
        />
      )}

      {showPreview && selectedRelatorio && (
        <RelatorioPreview
          open={showPreview}
          onOpenChange={setShowPreview}
          relatorio={selectedRelatorio}
        />
      )}
    </>
  )
}