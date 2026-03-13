'use client'

import React, { useState, useEffect } from 'react'
import { Bell, CheckCheck, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { Badge } from '@/components/ui/Badge'
import { NotificationItem } from './NotificationItem'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  link?: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface NotificationCenterProps {
  className?: string
}

export function NotificationCenter({ className }: NotificationCenterProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect() {
    carregarNotificacoes()
    
    // Configurar SSE para notificações em tempo real
    const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/notificacoes/stream`)
    
    eventSource.onmessage = (event) => {
      const novaNotificacao = JSON.parse(event.data)
      setNotifications(prev => [novaNotificacao, ...prev])
      setUnreadCount(prev => prev + 1)
    }

    return () => eventSource.close()
  }, [])

  const carregarNotificacoes = async () => {
    try {
      setLoading(true)
      const response = await api.get('/notificacoes')
      setNotifications(response.data)
      setUnreadCount(response.data.filter((n: Notification) => !n.read).length)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = async (id: string) => {
    try {
      await api.patch(`/notificacoes/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      await api.post('/notificacoes/read-all')
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const removerNotificacao = async (id: string) => {
    try {
      await api.delete(`/notificacoes/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (!notifications.find(n => n.id === id)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erro ao remover notificação:', error)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h4 className="font-semibold">Notificações</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={marcarTodasComoLidas}
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {/* Abrir configurações */}}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="todas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="todas">
              Todas
              <Badge variant="secondary" className="ml-2">
                {notifications.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="nao-lidas">
              Não lidas
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="importantes">Importantes</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-0">
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={() => marcarComoLida(notification.id)}
                      onRemove={() => removerNotificacao(notification.id)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="nao-lidas" className="mt-0">
            <ScrollArea className="h-[400px]">
              {notifications.filter(n => !n.read).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação não lida
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications
                    .filter(n => !n.read)
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={() => marcarComoLida(notification.id)}
                        onRemove={() => removerNotificacao(notification.id)}
                      />
                    ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="importantes" className="mt-0">
            <ScrollArea className="h-[400px]">
              {notifications.filter(n => n.type === 'error' || n.type === 'warning').length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                  <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação importante
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications
                    .filter(n => n.type === 'error' || n.type === 'warning')
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={() => marcarComoLida(notification.id)}
                        onRemove={() => removerNotificacao(notification.id)}
                      />
                    ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Separator />

        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-center text-sm"
            onClick={() => {/* Ver todas */}}
          >
            Ver todas as notificações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}