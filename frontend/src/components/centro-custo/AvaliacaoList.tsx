'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Star,
  Calendar
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { AvaliacaoDetails } from './AvaliacaoDetails'
import { AvaliacaoForm } from './AvaliacaoForm'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Avaliacao {
  id: number
  centroCustoId: number
  centroCustoNome: string
  dataAvaliacao: string
  avaliadorId: number
  avaliadorNome: string
  notaFinal: number
  categorias: {
    precoCondicoes: number
    qualidadeServico: number
    qualidadeEntrega: number
    segurançaSaude: number
    estoque: number
    administracao: number
  }
}

interface AvaliacaoListProps {
  centroId?: number
  obraId?: number
}

export function AvaliacaoList({ centroId, obraId }: AvaliacaoListProps) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [periodo, setPeriodo] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<Avaliacao | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    carregarAvaliacoes()
  }, [page, periodo, centroId, obraId])

  const carregarAvaliacoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/centros-custo/avaliacoes', {
        params: {
          page,
          limit: 10,
          centroId,
          obraId,
          periodo,
          search: search || undefined
        }
      })
      setAvaliacoes(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as avaliações',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarAvaliacoes()
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/centros-custo/avaliacoes/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Avaliação excluída com sucesso'
      })
      carregarAvaliacoes()
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a avaliação',
        variant: 'destructive'
      })
    }
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600'
    if (nota >= 3.5) return 'text-blue-600'
    if (nota >= 2.5) return 'text-yellow-600'
    if (nota >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getNotaBadge = (nota: number) => {
    if (nota >= 4.5) return 'bg-green-100 text-green-800'
    if (nota >= 3.5) return 'bg-blue-100 text-blue-800'
    if (nota >= 2.5) return 'bg-yellow-100 text-yellow-800'
    if (nota >= 1.5) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Avaliações de Centros de Custo</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Buscar por centro de custo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
                <SelectItem value="12m">Últimos 12 meses</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarAvaliacoes}>
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
                  <TableHead>Data</TableHead>
                  <TableHead>Centro de Custo</TableHead>
                  <TableHead>Avaliador</TableHead>
                  <TableHead>Nota Final</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Qualidade</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Segurança</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>ADM</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : avaliacoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      Nenhuma avaliação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  avaliacoes.map((avaliacao) => (
                    <TableRow key={avaliacao.id}>
                      <TableCell>
                        {format(new Date(avaliacao.dataAvaliacao), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {avaliacao.centroCustoNome}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {getInitials(avaliacao.avaliadorNome)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{avaliacao.avaliadorNome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getNotaBadge(avaliacao.notaFinal)}>
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {avaliacao.notaFinal.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className={getNotaColor(avaliacao.categorias.precoCondicoes)}>
                        {avaliacao.categorias.precoCondicoes.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(avaliacao.categorias.qualidadeServico)}>
                        {avaliacao.categorias.qualidadeServico.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(avaliacao.categorias.qualidadeEntrega)}>
                        {avaliacao.categorias.qualidadeEntrega.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(avaliacao.categorias.segurançaSaude)}>
                        {avaliacao.categorias.segurançaSaude.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(avaliacao.categorias.estoque)}>
                        {avaliacao.categorias.estoque.toFixed(1)}
                      </TableCell>
                      <TableCell className={getNotaColor(avaliacao.categorias.administracao)}>
                        {avaliacao.categorias.administracao.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedAvaliacao(avaliacao)
                              setShowDetails(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedAvaliacao(avaliacao)
                              setShowForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(avaliacao.id)}
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
      {showDetails && selectedAvaliacao && (
        <AvaliacaoDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          avaliacaoId={selectedAvaliacao.id}
        />
      )}

      {showForm && selectedAvaliacao && (
        <AvaliacaoForm
          open={showForm}
          onOpenChange={setShowForm}
          centroId={selectedAvaliacao.centroCustoId}
          centroNome={selectedAvaliacao.centroCustoNome}
          avaliacao={selectedAvaliacao}
          onSuccess={() => {
            setShowForm(false)
            setSelectedAvaliacao(null)
            carregarAvaliacoes()
          }}
        />
      )}
    </>
  )
}