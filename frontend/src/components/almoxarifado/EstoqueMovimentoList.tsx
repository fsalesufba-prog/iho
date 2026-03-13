'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Minus,
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
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Movimento {
  id: string
  data: string
  tipo: 'entrada' | 'saida' | 'ajuste'
  item: string
  itemId: string
  quantidade: number
  valorUnitario: number
  valorTotal: number
  responsavel: string
  observacao: string
}

export function EstoqueMovimentoList() {
  const [movimentos, setMovimentos] = useState<Movimento[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tipo, setTipo] = useState('todos')
  const [periodo, setPeriodo] = useState('30d')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    carregarMovimentos()
  }, [page, tipo, periodo])

  const carregarMovimentos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/movimentos', {
        params: {
          page,
          limit: 20,
          tipo: tipo !== 'todos' ? tipo : undefined,
          periodo,
          search: search || undefined
        }
      })
      setMovimentos(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar movimentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarMovimentos()
  }


  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Movimentações de Estoque</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center space-x-2">
            <Input
              placeholder="Buscar por item ou observação..."
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
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="entrada">Entradas</SelectItem>
              <SelectItem value="saida">Saídas</SelectItem>
              <SelectItem value="ajuste">Ajustes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={carregarMovimentos}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Valor Unit.</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Observação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : movimentos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhuma movimentação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                movimentos.map((mov) => (
                  <TableRow key={mov.id}>
                    <TableCell>
                      {format(new Date(mov.data), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        mov.tipo === 'entrada' ? 'success' :
                        mov.tipo === 'saida' ? 'destructive' :
                        'secondary'
                      }>
                        <span className="flex items-center">
                          {mov.tipo === 'entrada' && <Plus className="h-3 w-3 mr-1" />}
                          {mov.tipo === 'saida' && <Minus className="h-3 w-3 mr-1" />}
                          {mov.tipo}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{mov.item}</TableCell>
                    <TableCell>
                      <span className={
                        mov.tipo === 'entrada' ? 'text-green-600' :
                        mov.tipo === 'saida' ? 'text-red-600' :
                        ''
                      }>
                        {mov.tipo === 'entrada' ? '+' : ''}
                        {mov.tipo === 'saida' ? '-' : ''}
                        {mov.quantidade}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(mov.valorUnitario)}
                    </TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(mov.valorTotal)}
                    </TableCell>
                    <TableCell>{mov.responsavel}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {mov.observacao}
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
  )
}