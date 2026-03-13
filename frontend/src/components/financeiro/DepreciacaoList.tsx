'use client'

import React, { useState, useEffect } from 'react'
import {
  Calendar,
  TrendingDown,
  DollarSign,
  RefreshCw,
  Download,
  Eye,
  Edit,
  Calculator,
  BarChart3
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
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
import { DepreciacaoCalculo } from './DepreciacaoCalculo'
import { DepreciacaoGrafico } from './DepreciacaoGrafico'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Depreciacao {
  id: number
  equipamentoId: number
  equipamentoNome: string
  equipamentoTag: string
  valorAquisicao: number
  valorResidual: number
  valorDepreciavel: number
  vidaUtilAnos: number
  vidaUtilMeses: number
  dataAquisicao: string
  metodo: 'linear' | 'saldos_decrescentes' | 'soma_digitos'
  taxaAnual: number
  depreciacaoAcumulada: number
  valorContabil: number
  depreciacaoPeriodo: number
  mesesDecorridos: number
  mesesRestantes: number
  percentualDepreciado: number
}

export function DepreciacaoList() {
  const [depreciacoes, setDepreciacoes] = useState<Depreciacao[]>([])
  const [loading, setLoading] = useState(true)
  const [metodo, setMetodo] = useState('todos')
  const [status, setStatus] = useState('todas')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedDepreciacao, setSelectedDepreciacao] = useState<Depreciacao | null>(null)
  const [showCalculo, setShowCalculo] = useState(false)
  const [resumo, setResumo] = useState({
    totalEquipamentos: 0,
    valorTotalAquisicao: 0,
    depreciacaoTotal: 0,
    valorContabilTotal: 0,
    depreciacaoMensal: 0,
    depreciacaoAnual: 0
  })

  const { toast } = useToast()

  useEffect(() => {
    carregarDepreciacoes()
    carregarResumo()
  }, [page, metodo, status])

  const carregarDepreciacoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/financeiro/depreciacoes', {
        params: {
          page,
          limit: 10,
          metodo: metodo !== 'todos' ? metodo : undefined,
          status: status !== 'todas' ? status : undefined
        }
      })
      setDepreciacoes(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar depreciações:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as depreciações',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarResumo = async () => {
    try {
      const response = await api.get('/financeiro/depreciacoes/resumo')
      setResumo(response.data)
    } catch (error) {
      console.error('Erro ao carregar resumo:', error)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getMetodoLabel = (metodo: string) => {
    const metodos = {
      linear: 'Linear',
      saldos_decrescentes: 'Saldos Decrescentes',
      soma_digitos: 'Soma dos Dígitos'
    }
    return metodos[metodo as keyof typeof metodos] || metodo
  }


  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Total de Aquisição</p>
                <p className="text-2xl font-bold">{formatCurrency(resumo.valorTotalAquisicao)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Depreciação Acumulada</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(resumo.depreciacaoTotal)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Contábil Líquido</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(resumo.valorContabilTotal)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Depreciação Mensal</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(resumo.depreciacaoMensal)}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Depreciação */}
      <DepreciacaoGrafico data={depreciacoes} />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Depreciação por Equipamento</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={metodo} onValueChange={setMetodo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os métodos</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="saldos_decrescentes">Saldos Decrescentes</SelectItem>
                  <SelectItem value="soma_digitos">Soma dos Dígitos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="nao_iniciada">Não Iniciada</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={carregarDepreciacoes}>
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
          {/* Tabela */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Valor Aquisição</TableHead>
                  <TableHead>Valor Residual</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Vida Útil</TableHead>
                  <TableHead>Depreciado</TableHead>
                  <TableHead>Valor Contábil</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : depreciacoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Nenhuma depreciação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  depreciacoes.map((dep) => (
                    <TableRow key={dep.id}>
                      <TableCell className="font-medium">{dep.equipamentoNome}</TableCell>
                      <TableCell className="font-mono text-xs">{dep.equipamentoTag}</TableCell>
                      <TableCell>{formatCurrency(dep.valorAquisicao)}</TableCell>
                      <TableCell>{formatCurrency(dep.valorResidual)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getMetodoLabel(dep.metodo)}</Badge>
                      </TableCell>
                      <TableCell>{dep.vidaUtilAnos} anos</TableCell>
                      <TableCell>{formatCurrency(dep.depreciacaoAcumulada)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(dep.valorContabil)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>{dep.percentualDepreciado.toFixed(1)}%</span>
                            <span className="text-muted-foreground">
                              {dep.mesesDecorridos}/{dep.vidaUtilMeses} meses
                            </span>
                          </div>
                          <Progress 
                            value={dep.percentualDepreciado} 
                            className="h-2"
                            indicatorClassName={
                              dep.percentualDepreciado >= 90 ? 'bg-red-500' :
                              dep.percentualDepreciado >= 70 ? 'bg-yellow-500' :
                              'bg-green-500'
                            }
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedDepreciacao(dep)
                              setShowCalculo(true)
                            }}
                          >
                            <Calculator className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
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

      {/* Modal de Cálculo */}
      {showCalculo && selectedDepreciacao && (
        <DepreciacaoCalculo
          open={showCalculo}
          onOpenChange={setShowCalculo}
          depreciacao={selectedDepreciacao}
        />
      )}
    </div>
  )
}