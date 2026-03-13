'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  History,
  Calendar,
  User,
  MapPin,
  Wrench,
  Activity,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { api } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'

interface HistoricoItem {
  id: number
  tipo: string
  data: string
  descricao: string
  obraOrigem?: {
    id: number
    nome: string
  }
  obraDestino?: {
    id: number
    nome: string
  }
  usuario: {
    id: number
    nome: string
  }
}

export default function HistoricoEquipamentoPage() {
  const params = useParams()
  const [items, setItems] = useState<HistoricoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  useEffect(() => {
    carregarHistorico()
  }, [params.id, page, tipoFiltro, dataInicio, dataFim])

  const carregarHistorico = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/equipamentos/${params.id}/historico`, {
        params: {
          page,
          limit: 20,
          tipo: tipoFiltro !== 'todos' ? tipoFiltro : undefined,
          dataInicio: dataInicio || undefined,
          dataFim: dataFim || undefined
        }
      })
      setItems(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'transferencia':
        return <MapPin className="h-4 w-4 text-blue-600" />
      case 'manutencao':
        return <Wrench className="h-4 w-4 text-yellow-600" />
      case 'status':
        return <Activity className="h-4 w-4 text-purple-600" />
      default:
        return <History className="h-4 w-4 text-gray-600" />
    }
  }

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      transferencia: 'Transferência',
      manutencao: 'Manutenção',
      status: 'Alteração de Status',
      cadastro: 'Cadastro'
    }
    return labels[tipo] || tipo
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Histórico do Equipamento" />
        
        <Container size="xl" className="py-8">
          <div className="mb-6">
            <Link
              href={`/app-empresa/equipamentos/${params.id}`}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para equipamento
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Histórico Completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filtros */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="transferencia">Transferências</SelectItem>
                    <SelectItem value="manutencao">Manutenções</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="cadastro">Cadastros</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="date"
                  placeholder="Data inicial"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-[180px]"
                />

                <Input
                  type="date"
                  placeholder="Data final"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-[180px]"
                />
              </div>

              {/* Timeline */}
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : items.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum registro encontrado
                </p>
              ) : (
                <div className="relative pl-8 space-y-4">
                  <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary to-accent" />
                  
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative"
                    >
                      <div className="absolute -left-8 top-2 w-4 h-4 rounded-full bg-primary" />
                      
                      <div className="p-4 rounded-lg border hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getTipoIcon(item.tipo)}
                            <span className="font-medium">{getTipoLabel(item.tipo)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(item.data)}
                          </div>
                        </div>

                        <p className="text-sm mb-2">{item.descricao}</p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.usuario.nome}
                          </div>

                          {item.obraOrigem && item.obraDestino && (
                            <div className="flex items-center gap-1">
                              <span>{item.obraOrigem.nome}</span>
                              <span>→</span>
                              <span>{item.obraDestino.nome}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
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
            </CardContent>
          </Card>
        </Container>
      </main>
    </>
  )
}