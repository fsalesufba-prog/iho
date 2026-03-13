'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  MoreVertical,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
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
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { LogFilters } from './LogFilters'
import { LogDetails } from './LogDetails'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Log {
  id: number
  usuarioId?: number
  usuarioNome?: string
  empresaId?: number
  empresaNome?: string
  acao: string
  entidade: string
  entidadeId?: number
  dadosAntigos?: string
  dadosNovos?: string
  ip?: string
  userAgent?: string
  createdAt: string
}

interface LogListProps {
  logs?: Log[]
  showFilters?: boolean
  showExport?: boolean
  onLogClick?: (log: Log) => void
}

export function LogList({ 
  logs: initialLogs, 
  showFilters = true, 
  showExport = true,
  onLogClick 
}: LogListProps) {
  const [logs, setLogs] = useState<Log[]>(initialLogs || [])
  const [loading, setLoading] = useState(!initialLogs)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    acao: 'todas',
    entidade: 'todas',
    usuario: 'todos',
    dataInicio: '',
    dataFim: ''
  })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedLog, setSelectedLog] = useState<Log | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (!initialLogs) {
      carregarLogs()
    }
  }, [page, filters, search])

  const carregarLogs = async () => {
    try {
      setLoading(true)
      const response = await api.get('/logs', {
        params: {
          page,
          limit: 20,
          search: search || undefined,
          acao: filters.acao !== 'todas' ? filters.acao : undefined,
          entidade: filters.entidade !== 'todas' ? filters.entidade : undefined,
          usuarioId: filters.usuario !== 'todos' ? filters.usuario : undefined,
          dataInicio: filters.dataInicio || undefined,
          dataFim: filters.dataFim || undefined
        }
      })
      setLogs(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os logs',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getAcaoIcon = (acao: string) => {
    switch (acao.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="h-4 w-4" />
      case 'criar':
      case 'create':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'atualizar':
      case 'update':
        return <Info className="h-4 w-4 text-blue-600" />
      case 'excluir':
      case 'delete':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'erro':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getAcaoBadge = (acao: string) => {
    const acaoLower = acao.toLowerCase()
    
    if (acaoLower.includes('login') || acaoLower.includes('logout')) {
      return <Badge variant="secondary">{acao}</Badge>
    }
    if (acaoLower.includes('criar') || acaoLower.includes('create')) {
      return <Badge className="bg-green-100 text-green-800">{acao}</Badge>
    }
    if (acaoLower.includes('atualizar') || acaoLower.includes('update')) {
      return <Badge className="bg-blue-100 text-blue-800">{acao}</Badge>
    }
    if (acaoLower.includes('excluir') || acaoLower.includes('delete')) {
      return <Badge variant="destructive">{acao}</Badge>
    }
    if (acaoLower.includes('erro') || acaoLower.includes('error')) {
      return <Badge variant="destructive">{acao}</Badge>
    }
    
    return <Badge variant="outline">{acao}</Badge>
  }

  const formatUserAgent = (userAgent?: string) => {
    if (!userAgent) return '-'
    
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    
    return 'Outro'
  }

  const handleLogClick = (log: Log) => {
    if (onLogClick) {
      onLogClick(log)
    } else {
      setSelectedLog(log)
      setShowDetails(true)
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/logs/exportar', {
        params: filters,
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `logs_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      
      toast({
        title: 'Sucesso',
        description: 'Logs exportados com sucesso'
      })
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar os logs',
        variant: 'destructive'
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Registros de Log</CardTitle>
            {showExport && (
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          {showFilters && (
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  placeholder="Buscar por ação, entidade ou usuário..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && carregarLogs()}
                  className="flex-1"
                />
                <Button variant="outline" onClick={carregarLogs}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <LogFilters 
                filters={filters}
                onFilterChange={setFilters}
                onApply={carregarLogs}
              />

              <Button variant="outline" onClick={carregarLogs}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          )}

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Navegador</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow 
                      key={log.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleLogClick(log)}
                    >
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAcaoIcon(log.acao)}
                          <span>{log.usuarioNome || 'Sistema'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getAcaoBadge(log.acao)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {log.entidade}
                          {log.entidadeId && ` #${log.entidadeId}`}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.ip || '-'}</TableCell>
                      <TableCell>{formatUserAgent(log.userAgent)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleLogClick(log)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
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
          {!initialLogs && totalPages > 1 && (
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

      {/* Modal de Detalhes */}
      {showDetails && selectedLog && (
        <LogDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          log={selectedLog}
        />
      )}
    </>
  )
}