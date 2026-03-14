'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Wrench,
  MapPin,
  History,
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

import { EquipamentoForm } from './EquipamentoForm'
import { EquipamentoDetails } from './EquipamentoDetails'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface Equipamento {
  id: number
  tag: string
  nome: string
  tipo: string
  marca: string
  modelo: string
  placa?: string
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'inativo'
  horaAtual: number
  obra?: string
  frenteServico?: string
  empresa: string
}

interface EquipamentoListProps {
  obraId?: number
  empresaId?: number
}

export function EquipamentoList({ obraId, empresaId }: EquipamentoListProps) {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('todos')
  const [tipo, setTipo] = useState('todos')
  const [tipos, setTipos] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEquipamento, setSelectedEquipamento] = useState<Equipamento | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    carregarTipos()
  }, [])

  useEffect(() => {
    carregarEquipamentos()
  }, [page, status, tipo, search, obraId, empresaId])

  const carregarTipos = async () => {
    try {
      const response = await api.get('/equipamentos/tipos')
      setTipos(response.data)
    } catch (error) {
      console.error('Erro ao carregar tipos:', error)
    }
  }

  const carregarEquipamentos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/equipamentos', {
        params: {
          page,
          limit: 10,
          status: status !== 'todos' ? status : undefined,
          tipo: tipo !== 'todos' ? tipo : undefined,
          obraId,
          empresaId,
          search: search || undefined
        }
      })
      setEquipamentos(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os equipamentos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarEquipamentos()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/equipamentos/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Equipamento excluído com sucesso'
      })
      carregarEquipamentos()
    } catch (error) {
      console.error('Erro ao excluir equipamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o equipamento',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponivel':
        return <Badge className="bg-green-100 text-green-800">Disponível</Badge>
      case 'em_uso':
        return <Badge className="bg-blue-100 text-blue-800">Em Uso</Badge>
      case 'manutencao':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Manutenção</Badge>
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Equipamentos</CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Equipamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por tag, nome ou placa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="em_uso">Em Uso</SelectItem>
                <SelectItem value="manutencao">Em Manutenção</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {tipos.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarEquipamentos}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Obra</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : equipamentos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum equipamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  equipamentos.map((equip) => (
                    <TableRow key={equip.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {equip.tag}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{equip.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {equip.marca} {equip.modelo}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{equip.tipo}</TableCell>
                      <TableCell>{getStatusBadge(equip.status)}</TableCell>
                      <TableCell>{equip.horaAtual}h</TableCell>
                      <TableCell>
                        {equip.frenteServico ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{equip.frenteServico}</span>
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{equip.obra || '-'}</TableCell>
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
                              setSelectedEquipamento(equip)
                              setShowDetails(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedEquipamento(equip)
                              setShowForm(true)
                            }}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <History className="h-4 w-4 mr-2" />
                              Histórico
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Wrench className="h-4 w-4 mr-2" />
                              Manutenções
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(equip.id)}
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
        <EquipamentoForm
          open={showForm}
          onOpenChange={setShowForm}
          equipamento={selectedEquipamento}
          onSuccess={() => {
            setShowForm(false)
            setSelectedEquipamento(null)
            carregarEquipamentos()
          }}
        />
      )}

      {showDetails && selectedEquipamento && (
        <EquipamentoDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          equipamentoId={selectedEquipamento.id}
        />
      )}
    </>
  )
}