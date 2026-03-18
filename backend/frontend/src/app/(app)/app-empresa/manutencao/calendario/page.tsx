'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

interface ManutencaoCalendario {
  id: number
  tipo: 'preventiva' | 'corretiva' | 'preditiva'
  dataProgramada: string
  descricao: string
  status: 'programada' | 'em_andamento' | 'concluida' | 'cancelada'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  equipamento: {
    id: number
    tag: string
    nome: string
  }
}

export default function CalendarioManutencaoPage() {
  const { toast } = useToast()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [manutencoes, setManutencoes] = useState<Record<string, ManutencaoCalendario[]>>({})
  const [loading, setLoading] = useState(false)  // Mudando para false inicial
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  useEffect(() => {
    carregarManutencoes()
  }, [currentDate, tipoFiltro])

  const carregarManutencoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/manutencoes/calendario', {
        params: {
          mes: currentDate.getMonth() + 1,
          ano: currentDate.getFullYear(),
          tipo: tipoFiltro !== 'todos' ? tipoFiltro : undefined
        }
      })
      setManutencoes(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar calendário',
        description: 'Não foi possível carregar as manutenções.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days = []
    const startPadding = firstDay.getDay()
    
    // Dias do mês anterior
    for (let i = 0; i < startPadding; i++) {
      days.push(null)
    }
    
    // Dias do mês atual
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        day: i,
        date: dateStr,
        manutencoes: manutencoes[dateStr] || []
      })
    }
    
    return days
  }

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + increment)))
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'preventiva':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'corretiva':
        return 'bg-red-100 border-red-300 text-red-800'
      case 'preditiva':
        return 'bg-purple-100 border-purple-300 text-purple-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida':
        return <CheckCircle2 className="h-3 w-3 text-green-600" />
      case 'cancelada':
        return <AlertCircle className="h-3 w-3 text-gray-600" />
      case 'em_andamento':
        return <Clock className="h-3 w-3 text-blue-600" />
      default:
        return <Clock className="h-3 w-3 text-yellow-600" />
    }
  }

  const days = getDaysInMonth()

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Calendário de Manutenções" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Calendário de Manutenções
              </h1>
              <p className="text-muted-foreground mt-1">
                Visualize todas as manutenções programadas
              </p>
            </div>

            <div className="flex gap-2">
              <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="preventiva">Preventiva</SelectItem>
                  <SelectItem value="corretiva">Corretiva</SelectItem>
                  <SelectItem value="preditiva">Preditiva</SelectItem>
                </SelectContent>
              </Select>

              <Link href="/app-empresa/manutencao">
                <Button variant="outline">
                  Ver lista
                </Button>
              </Link>
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          )}

          {/* Calendário */}
          {!loading && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => changeMonth(-1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => changeMonth(1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Grid do calendário */}
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.01 }}
                      className={`min-h-[120px] p-2 rounded-lg border ${
                        day ? 'bg-card hover:shadow-md transition-shadow' : 'bg-muted/30'
                      }`}
                    >
                      {day && (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-sm font-medium ${
                              new Date(day.date).toDateString() === new Date().toDateString()
                                ? 'text-primary font-bold'
                                : ''
                            }`}>
                              {day.day}
                            </span>
                            {day.manutencoes.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {day.manutencoes.length}
                              </Badge>
                            )}
                          </div>

                          <div className="space-y-1 max-h-[80px] overflow-y-auto">
                            {day.manutencoes.slice(0, 3).map((manutencao) => (
                              <Link
                                key={manutencao.id}
                                href={`/app-empresa/manutencao/${manutencao.id}`}
                                className={`block p-1 rounded text-xs border ${getTipoColor(manutencao.tipo)} hover:opacity-80 transition-opacity`}
                              >
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(manutencao.status)}
                                  <span className="truncate flex-1">
                                    {manutencao.equipamento.tag}
                                  </span>
                                </div>
                              </Link>
                            ))}
                            {day.manutencoes.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{day.manutencoes.length - 3} mais
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Legenda */}
                <div className="mt-6 pt-4 border-t flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm">Preventiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm">Corretiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm">Preditiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-yellow-600" />
                    <span className="text-sm">Programada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-blue-600" />
                    <span className="text-sm">Em Andamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    <span className="text-sm">Concluída</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </Container>
      </main>
    </>
  )
}