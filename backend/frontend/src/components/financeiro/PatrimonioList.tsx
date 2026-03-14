'use client'

import React, { useState, useEffect } from 'react'
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Download,
  Eye,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { PatrimonioGrafico } from './PatrimonioGrafico'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'

interface Patrimonio {
  id: number
  tipo: 'imobilizado' | 'intangivel' | 'investimento'
  descricao: string
  valorAquisicao: number
  valorDepreciado: number
  valorAtual: number
  dataAquisicao: string
  vidaUtil?: number
  taxaDepreciacao?: number
  status: 'ativo' | 'baixado' | 'em_andamento'
}

interface ResumoPatrimonio {
  totalAtivo: number
  totalDepreciado: number
  totalLiquido: number
  imobilizado: number
  intangivel: number
  investimentos: number
  variacaoMensal: number
  composicao: Array<{ name: string; value: number }>
  evolucao: Array<{ periodo: string; imobilizado: number; intangivel: number; investimentos: number }>
}

export function PatrimonioList() {
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingResumo, setLoadingResumo] = useState(true)
  const [tipo, setTipo] = useState('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [resumo, setResumo] = useState<ResumoPatrimonio | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.empresaId) {
      carregarPatrimonios()
      carregarResumo()
    }
  }, [page, tipo, user?.empresaId])

  const carregarPatrimonios = async () => {
    try {
      setLoading(true)
      const response = await api.get('/financeiro/patrimonio', {
        params: {
          empresaId: user?.empresaId,
          page,
          limit: 10,
          tipo: tipo !== 'todos' ? tipo : undefined
        }
      })
      setPatrimonios(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar patrimônio:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o patrimônio',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarResumo = async () => {
    try {
      setLoadingResumo(true)
      const response = await api.get('/financeiro/patrimonio/resumo', {
        params: { empresaId: user?.empresaId }
      })
      setResumo(response.data)
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
    } finally {
      setLoadingResumo(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      imobilizado: 'Imobilizado',
      intangivel: 'Intangível',
      investimento: 'Investimento'
    }
    return tipos[tipo as keyof typeof tipos] || tipo
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>
      case 'baixado':
        return <Badge variant="destructive">Baixado</Badge>
      case 'em_andamento':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Andamento</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!user?.empresaId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Selecione uma empresa para visualizar o patrimônio</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            {loadingResumo ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ativo Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(resumo?.totalAtivo || 0)}</p>
                </div>
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {loadingResumo ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Depreciação Acumulada</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(resumo?.totalDepreciado || 0)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-yellow-600" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {loadingResumo ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Patrimônio Líquido</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo?.totalLiquido || 0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {loadingResumo ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-6 bg-muted rounded w-32"></div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Variação Mensal</p>
                  <p className={`text-2xl font-bold ${(resumo?.variacaoMensal || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(resumo?.variacaoMensal || 0) >= 0 ? '+' : ''}{resumo?.variacaoMensal.toFixed(1)}%
                  </p>
                </div>
                {(resumo?.variacaoMensal || 0) >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="composicao">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="composicao">Composição do Patrimônio</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
        </TabsList>

        <TabsContent value="composicao" className="mt-4">
          <PatrimonioGrafico 
            data={resumo?.composicao || []}
            type="pie"
            loading={loadingResumo}
          />
        </TabsContent>

        <TabsContent value="evolucao" className="mt-4">
          <PatrimonioGrafico 
            evolucaoData={resumo?.evolucao || []}
            type="line"
            loading={loadingResumo}
          />
        </TabsContent>
      </Tabs>

      {/* Lista de Ativos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ativos Patrimoniais</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de Ativo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="imobilizado">Imobilizado</SelectItem>
                  <SelectItem value="intangivel">Intangível</SelectItem>
                  <SelectItem value="investimento">Investimentos</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={carregarPatrimonios}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Data Aquisição</TableHead>
                  <TableHead>Valor Aquisição</TableHead>
                  <TableHead>Depreciado</TableHead>
                  <TableHead>Valor Atual</TableHead>
                  <TableHead>% Depreciado</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : patrimonios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum ativo encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  patrimonios.map((item) => {
                    const percentualDepreciado = (item.valorDepreciado / item.valorAquisicao) * 100
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.descricao}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTipoLabel(item.tipo)}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(item.dataAquisicao).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>{formatCurrency(item.valorAquisicao)}</TableCell>
                        <TableCell>{formatCurrency(item.valorDepreciado)}</TableCell>
                        <TableCell className="font-bold">{formatCurrency(item.valorAtual)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>{percentualDepreciado.toFixed(1)}%</span>
                            </div>
                            <Progress 
                              value={percentualDepreciado} 
                              className="h-2"
                              indicatorClassName={
                                percentualDepreciado >= 90 ? 'bg-red-500' :
                                percentualDepreciado >= 70 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }
                            />
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
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
    </div>
  )
}