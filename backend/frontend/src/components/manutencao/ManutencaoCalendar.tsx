'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import { ManutencaoDetails } from './ManutencaoDetails'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface Event {
  id: number
  title: string
  start: Date
  end: Date
  resource: any
  status: string
  priority: string
  type: string
}

export function ManutencaoCalendar() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [date, setDate] = useState(new Date())

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    carregarEventos()
  }, [])

  const carregarEventos = async () => {
    try {
      setLoading(true)
      const response = await api.get('/manutencao', {
        params: { empresaId: user?.empresaId, limit: 1000 }
      })

      const formattedEvents = response.data.data.map((manutencao: any) => {
        const dataProgramada = manutencao.dataProgramada 
          ? new Date(manutencao.dataProgramada)
          : new Date()

        // Duração padrão de 2 horas para eventos
        const dataFim = new Date(dataProgramada)
        dataFim.setHours(dataFim.getHours() + 2)

        let statusColor = '#3b82f6' // blue
        if (manutencao.status === 'concluida') statusColor = '#10b981' // green
        if (manutencao.status === 'cancelada') statusColor = '#ef4444' // red
        if (manutencao.status === 'em_andamento') statusColor = '#f59e0b' // yellow

        return {
          id: manutencao.id,
          title: `${manutencao.equipamento?.tag} - ${manutencao.descricao.substring(0, 30)}...`,
          start: dataProgramada,
          end: dataFim,
          resource: manutencao,
          status: manutencao.status,
          priority: manutencao.prioridade,
          type: manutencao.tipo,
          color: statusColor
        }
      })

      setEvents(formattedEvents)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o calendário',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const eventStyleGetter = (event: Event) => {
    let backgroundColor = '#3b82f6'
    
    if (event.status === 'concluida') backgroundColor = '#10b981'
    if (event.status === 'cancelada') backgroundColor = '#ef4444'
    if (event.status === 'em_andamento') backgroundColor = '#f59e0b'

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0',
        display: 'block'
      }
    }
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event.resource)
    setShowDetails(true)
  }

  const handleNavigate = (action: 'TODAY' | 'PREV' | 'NEXT') => {
    const newDate = new Date(date)
    if (action === 'TODAY') {
      setDate(new Date())
    } else if (action === 'PREV') {
      newDate.setMonth(newDate.getMonth() - 1)
      setDate(newDate)
    } else if (action === 'NEXT') {
      newDate.setMonth(newDate.getMonth() + 1)
      setDate(newDate)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Calendário de Manutenções</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleNavigate('TODAY')}>
                Hoje
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleNavigate('PREV')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => handleNavigate('NEXT')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={carregarEventos}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-[600px]">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                messages={{
                  next: 'Próximo',
                  previous: 'Anterior',
                  today: 'Hoje',
                  month: 'Mês',
                  week: 'Semana',
                  day: 'Dia',
                  agenda: 'Agenda',
                  date: 'Data',
                  time: 'Hora',
                  event: 'Evento',
                  noEventsInRange: 'Nenhuma manutenção neste período.',
                  showMore: (total) => `+${total} mais`
                }}
                culture="pt-BR"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {showDetails && selectedEvent && (
        <ManutencaoDetails
          open={showDetails}
          onOpenChange={setShowDetails}
          manutencaoId={selectedEvent.id}
        />
      )}
    </>
  )
}