'use client'

import React, { useState } from 'react'
import { Bell, CheckCheck, Settings, X } from 'lucide-react'
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
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'success' | 'warning' | 'error'
  avatar?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Nova empresa cadastrada',
    message: 'A empresa "Construtora ABC" foi cadastrada com sucesso.',
    time: '5 minutos atrás',
    read: false,
    type: 'info'
  },
  {
    id: '2',
    title: 'Pagamento confirmado',
    message: 'Pagamento da empresa "XPTO Ltda" foi confirmado.',
    time: '1 hora atrás',
    read: false,
    type: 'success'
  },
  {
    id: '3',
    title: 'Alerta de sistema',
    message: 'O servidor está com alta utilização de CPU.',
    time: '2 horas atrás',
    read: true,
    type: 'warning'
  },
  {
    id: '4',
    title: 'Erro no backup',
    message: 'O backup automático falhou. Verifique o log.',
    time: '1 dia atrás',
    read: true,
    type: 'error'
  }
]

export function AdminNotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
                onClick={markAllAsRead}
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
                    <div
                      key={notification.id}
                      className={cn(
                        'relative p-4 transition-colors hover:bg-muted/50',
                        !notification.read && 'bg-primary/5'
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                          getTypeColor(notification.type)
                        )}>
                          <Bell className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeNotification(notification.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">
                              {notification.time}
                            </span>
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-primary hover:underline"
                              >
                                Marcar como lida
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {!notification.read && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
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
                      <div
                        key={notification.id}
                        className="relative p-4 bg-primary/5"
                      >
                        {/* Conteúdo similar */}
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="importantes" className="mt-0">
            <ScrollArea className="h-[400px]">
              {/* Conteúdo similar */}
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