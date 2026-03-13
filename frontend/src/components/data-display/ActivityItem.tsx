import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { User, Settings, FileText, CreditCard, Package, Wrench, Truck, Building2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface ActivityItemProps {
  id: string
  user: {
    name: string
    avatar?: string
    email?: string
  }
  action: string
  target: string
  details?: string
  timestamp: Date | string
  type?: 'user' | 'system' | 'payment' | 'equipment' | 'maintenance' | 'obra' | 'estoque'
  metadata?: Record<string, any>
  className?: string
}

const typeIcons = {
  user: User,
  system: Settings,
  payment: CreditCard,
  equipment: Truck,
  maintenance: Wrench,
  obra: Building2,
  estoque: Package
}

const typeColors = {
  user: 'bg-blue-100 text-blue-600',
  system: 'bg-gray-100 text-gray-600',
  payment: 'bg-green-100 text-green-600',
  equipment: 'bg-purple-100 text-purple-600',
  maintenance: 'bg-yellow-100 text-yellow-600',
  obra: 'bg-orange-100 text-orange-600',
  estoque: 'bg-teal-100 text-teal-600'
}

export function ActivityItem({
  user,
  action,
  target,
  details,
  timestamp,
  type = 'user',
  metadata,
  className
}: ActivityItemProps) {
  const Icon = typeIcons[type]

  const formatTimestamp = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ptBR
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn('flex gap-4 p-4 hover:bg-muted/50 transition-colors', className)}>
      {/* Avatar ou Ícone */}
      {type === 'user' ? (
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', typeColors[type])}>
          <Icon className="h-5 w-5" />
        </div>
      )}

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm">
              <span className="font-medium">{user.name}</span>{' '}
              <span className="text-muted-foreground">{action}</span>{' '}
              <span className="font-medium">{target}</span>
            </p>
            {details && (
              <p className="text-sm text-muted-foreground mt-1">{details}</p>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
            {formatTimestamp(timestamp)}
          </span>
        </div>

        {/* Metadados adicionais */}
        {metadata && Object.keys(metadata).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(metadata).map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs"
              >
                <span className="text-muted-foreground mr-1">{key}:</span>
                <span className="font-medium">{value}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Variação compacta
ActivityItem.Compact = function CompactActivityItem({
  user,
  action,
  target,
  timestamp,
  type = 'user',
  className
}: Omit<ActivityItemProps, 'details' | 'metadata'>) {
  const Icon = typeIcons[type]

  return (
    <div className={cn('flex items-center gap-3 text-sm', className)}>
      <Icon className={cn('h-4 w-4', typeColors[type].split(' ')[1])} />
      <span className="flex-1">
        <span className="font-medium">{user.name}</span>{' '}
        <span className="text-muted-foreground">{action}</span>{' '}
        <span className="font-medium">{target}</span>
      </span>
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR })}
      </span>
    </div>
  )
}

// Versão para notificações
ActivityItem.Notification = function NotificationActivityItem({
  id,
  user,
  action,
  target,
  timestamp,
  type,
  read = false,
  onRead,
  className
}: ActivityItemProps & { read?: boolean; onRead?: () => void }) {
  return (
    <div
      className={cn(
        'relative flex gap-4 p-4 transition-colors cursor-pointer hover:bg-muted/50',
        !read && 'bg-primary/5',
        className
      )}
      onClick={onRead}
    >
      {!read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
      )}
      <ActivityItem
        id={id}
        user={user}
        action={action}
        target={target}
        timestamp={timestamp}
        type={type}
        className="pl-4"
      />
    </div>
  )
}