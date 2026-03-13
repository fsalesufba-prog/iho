'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import { api } from '@/lib/api'
import { NotificationItem } from '@/components/feedback/NotificationItem'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
  link?: string
}

interface NotificationContextData {
  notifications: Notification[]
  unreadCount: number
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
  showNotifications: boolean
  toggleNotifications: () => void
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [eventSource, setEventSource] = useState<EventSource | null>(null)
  const { user, isAuthenticated } = useAuth()

  const unreadCount = notifications.filter(n => !n.read).length

  const carregarNotificacoes = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      const response = await api.get('/notificacoes')
      setNotifications(response.data)
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    carregarNotificacoes()
  }, [carregarNotificacoes])

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (eventSource) {
        eventSource.close()
        setEventSource(null)
      }
      return
    }

    // Configurar SSE para notificações em tempo real
    const es = new EventSource(`${process.env.NEXT_PUBLIC_API_URL}/notificacoes/stream`)
    
    es.onmessage = (event) => {
      const novaNotificacao = JSON.parse(event.data)
      setNotifications(prev => [novaNotificacao, ...prev])
    }

    es.onerror = (error) => {
      console.error('Erro no SSE:', error)
    }

    setEventSource(es)

    return () => {
      es.close()
    }
  }, [isAuthenticated, user])

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notificacoes/${id}/read`)
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notificacoes/read-all')
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error)
    }
  }

  const removeNotification = async (id: string) => {
    try {
      await api.delete(`/notificacoes/${id}`)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (error) {
      console.error('Erro ao remover notificação:', error)
    }
  }

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        showNotifications,
        toggleNotifications,
      }}
    >
      {children}

      {/* Painel de Notificações */}
      {showNotifications && (
        <div className="fixed inset-y-0 right-0 z-50 w-96 bg-background border-l shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Notificações</h2>
            <Button variant="ghost" size="icon" onClick={toggleNotifications}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="w-full"
            >
              Marcar todas como lidas
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-8rem)]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-4">
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
                    onMarkAsRead={() => markAsRead(notification.id)}
                    onRemove={() => removeNotification(notification.id)}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}