import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, XCircle, AlertCircle, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineItem {
  id: string
  title: string
  description?: string
  date: Date | string
  type?: 'success' | 'error' | 'warning' | 'info' | 'default'
  icon?: React.ReactNode
  user?: string
  metadata?: Record<string, any>
}

interface TimelineProps {
  items: TimelineItem[]
  variant?: 'default' | 'compact' | 'detailed'
  orientation?: 'vertical' | 'horizontal'
  className?: string
}

const typeConfig = {
  success: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  error: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  warning: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  info: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  default: { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-100' }
}

export function Timeline({
  items,
  variant = 'default',
  orientation = 'vertical',
  className
}: TimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex overflow-x-auto pb-4', className)}>
        {items.map((item, index) => (
          <HorizontalTimelineItem
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
            variant={variant}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <VerticalTimelineItem
          key={item.id}
          item={item}
          isLast={index === items.length - 1}
          variant={variant}
        />
      ))}
    </div>
  )
}

function VerticalTimelineItem({
  item,
  isLast,
  variant
}: {
  item: TimelineItem
  isLast: boolean
  variant: string
}) {
  const config = typeConfig[item.type || 'default']
  const Icon = item.icon || config.icon

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  if (variant === 'compact') {
    return (
      <div className="relative pl-6">
        {/* Linha vertical */}
        {!isLast && (
          <div className="absolute left-2 top-4 bottom-0 w-0.5 bg-border" />
        )}

        {/* Ponto */}
        <div className={cn('absolute left-0 top-1 h-4 w-4 rounded-full flex items-center justify-center', config.bg)}>
          <Icon className={cn('h-2.5 w-2.5', config.color)} />
        </div>

        {/* Conteúdo */}
        <div className="pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{item.title}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(item.date)}
            </span>
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative pl-8">
      {/* Linha vertical */}
      {!isLast && (
        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-border" />
      )}

      {/* Ponto */}
      <div className={cn('absolute left-0 top-1 h-8 w-8 rounded-full flex items-center justify-center', config.bg)}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      {/* Conteúdo */}
      <div className="pb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-semibold">{item.title}</h4>
          <span className="text-xs text-muted-foreground">
            {formatDate(item.date)}
          </span>
        </div>

        {item.description && (
          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
        )}

        {item.user && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{item.user}</span>
          </div>
        )}

        {item.metadata && Object.keys(item.metadata).length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            {Object.entries(item.metadata).map(([key, value]) => (
              <div key={key}>
                <span className="text-muted-foreground">{key}:</span>{' '}
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function HorizontalTimelineItem({
  item,
  isLast,
  variant
}: {
  item: TimelineItem
  isLast: boolean
  variant: string
}) {
  const config = typeConfig[item.type || 'default']
  const Icon = item.icon || config.icon

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return format(d, "dd/MM", { locale: ptBR })
  }

  return (
    <div className="flex-1 min-w-[200px]">
      <div className="relative">
        {/* Ponto */}
        <div className={cn('mx-auto h-8 w-8 rounded-full flex items-center justify-center', config.bg)}>
          <Icon className={cn('h-4 w-4', config.color)} />
        </div>

        {/* Linha horizontal */}
        {!isLast && (
          <div className="absolute top-4 left-1/2 w-full h-0.5 bg-border" />
        )}

        {/* Conteúdo */}
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
          <p className="text-sm font-medium mt-1">{item.title}</p>
          {variant === 'detailed' && item.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}