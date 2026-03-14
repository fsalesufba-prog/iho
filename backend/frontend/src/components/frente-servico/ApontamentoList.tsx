'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ApontamentoDay } from './ApontamentoDay'
import { ApontamentoWeek } from './ApontamentoWeek'
import { ApontamentoMonth } from './ApontamentoMonth'
import { ApontamentoForm } from './ApontamentoForm'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'

interface Apontamento {
  id: number
  data: string
  frenteId: number
  frenteNome: string
  equipamentoId: number
  equipamentoNome: string
  equipamentoTag: string
  operadorId?: number
  operadorNome?: string
  horasInicial: number
  horasFinal: number
  horasTrabalhadas: number
  combustivelLitros?: number
  observacoes?: string
  createdAt: string
}

interface ApontamentoListProps {
  frenteId?: number
  obraId?: number
}

export function ApontamentoList({ frenteId, obraId }: ApontamentoListProps) {
  const [apontamentos, setApontamentos] = useState<Apontamento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'day' | 'week' | 'month'>('list')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedApontamento, setSelectedApontamento] = useState<Apontamento | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedFrente, setSelectedFrente] = useState<{ id: number; nome: string } | null>(
    frenteId ? { id: frenteId, nome: '' } : null
  )

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    carregarApontamentos()
  }, [page, frenteId, obraId, selectedDate])

  const carregarApontamentos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/apontamentos', {
        params: {
          empresaId: user?.empresaId,
          page,
          limit: 20,
          frenteId,
          obraId,
          data: format(selectedDate, 'yyyy-MM-dd'),
          search: search || undefined
        }
      })
      setApontamentos(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar apontamentos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os apontamentos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/apontamentos/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Apontamento excluído com sucesso'
      })
      carregarApontamentos()
    } catch (error) {
      console.error('Erro ao excluir apontamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o apontamento',
        variant: 'destructive'
      })
    }
  }

  const formatHours = (hours: number) => {
    return `${hours}h`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Apontamentos</CardTitle>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Apontamento
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por equipamento ou operador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && carregarApontamentos()}
                className="flex-1"
              />
              <Button variant="outline" onClick={carregarApontamentos}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
              <TabsList>
                <TabsTrigger value="list">Lista</TabsTrigger>
                <TabsTrigger value="day">Dia</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" onClick={carregarApontamentos}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Conteúdo baseado na visualização */}
          {viewMode === 'list' && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Frente</TableHead>
                    <TableHead>Equipamento</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Combustível</TableHead>
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
                  ) : apontamentos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum apontamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    apontamentos.map((ap) => (
                      <TableRow key={ap.id}>
                        <TableCell>
                          {format(new Date(ap.data), "dd/MM/yyyy HH:mm")}
                        </TableCell>
                        <TableCell>{ap.frenteNome}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ap.equipamentoNome}</p>
                            <p className="text-xs text-muted-foreground">{ap.equipamentoTag}</p>
                          </div>
                        </TableCell>
                        <TableCell>{ap.operadorNome || '-'}</TableCell>
                        <TableCell>{formatHours(ap.horasTrabalhadas)}</TableCell>
                        <TableCell>
                          {ap.combustivelLitros ? `${ap.combustivelLitros} L` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedApontamento(ap)
                                setSelectedFrente({ id: ap.frenteId, nome: ap.frenteNome })
                                setShowForm(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(ap.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {viewMode === 'day' && (
            <ApontamentoDay 
              data={apontamentos} 
              date={selectedDate}
              onDateChange={setSelectedDate}
            />
          )}

          {viewMode === 'week' && (
            <ApontamentoWeek 
              data={apontamentos}
              onDateChange={setSelectedDate}
            />
          )}

          {viewMode === 'month' && (
            <ApontamentoMonth 
              data={apontamentos}
              onDateChange={setSelectedDate}
            />
          )}

          {/* Paginação */}
          {viewMode === 'list' && totalPages > 1 && (
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

      {/* Modal de Apontamento */}
      {showForm && (
        <ApontamentoForm
          open={showForm}
          onOpenChange={setShowForm}
          frenteId={selectedFrente?.id || frenteId || 0}
          frenteNome={selectedFrente?.nome || ''}
          apontamento={selectedApontamento}
          onSuccess={() => {
            setShowForm(false)
            setSelectedApontamento(null)
            setSelectedFrente(null)
            carregarApontamentos()
          }}
        />
      )}
    </>
  )
}