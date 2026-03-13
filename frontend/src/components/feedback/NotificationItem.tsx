import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  X,
  Bell,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface NotificationItemProps {
  notification: {
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
  onMarkAsRead?: () => void
  onRemove?: () => void
}

const icons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
}

const colors = {
  info: 'text-blue-600 bg-blue-100 dark:bg-blue-950 dark:text-blue-400',
  success: 'text-green-600 bg-green-100 dark:bg-green-950 dark:text-green-400',
  warning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400',
  error: 'text-red-600 bg-red-100 dark:bg-red-950 dark:text-red-400',
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onRemove,
}: NotificationItemProps) {
  const Icon = icons[notification.type]

  return (
    <div
      className={cn(
        'relative p-4 transition-colors hover:bg-muted/50',
        !notification.read && 'bg-primary/5'
      )}
    >
      <div className="flex gap-3">
        <div className={cn('flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center', colors[notification.type])}>
          <Icon className="h-4 w-4" />
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
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
              onClick={onRemove}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>

            {!notification.read && (
              <button
                onClick={onMarkAsRead}
                className="text-xs text-primary hover:underline"
              >
                Marcar como lida
              </button>
            )}

            {notification.link && (
              <a
                href={notification.link}
                className="text-xs text-primary hover:underline inline-flex items-center"
              >
                Ver detalhes
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            )}
          </div>

          {notification.action && (
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              onClick={notification.action.onClick}
            >
              {notification.action.label}
            </Button>
          )}
        </div>
      </div>

      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      )}
    </div>
  )
}