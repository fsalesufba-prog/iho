import React from 'react'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface NotificationBadgeProps {
  count: number
  variant?: 'default' | 'destructive' | 'warning'
  className?: string
  onClick?: () => void
}

export function NotificationBadge({
  count,
  variant = 'destructive',
  className,
  onClick
}: NotificationBadgeProps) {
  if (count === 0) return null

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    warning: 'bg-yellow-500 text-white'
  }

  return (
    <div
      className={cn(
        'relative inline-flex cursor-pointer',
        onClick && 'hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      <Badge
        className={cn(
          'absolute -top-2 -right-2 h-5 min-w-[20px] px-1 flex items-center justify-center text-xs',
          variantClasses[variant]
        )}
      >
        {count > 99 ? '99+' : count}
      </Badge>
    </div>
  )
}

// Versão apenas com o número (sem ícone)
NotificationBadge.Number = function NumberBadge({
  count,
  variant = 'destructive',
  className
}: Omit<NotificationBadgeProps, 'onClick'>) {
  if (count === 0) return null

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    warning: 'bg-yellow-500 text-white'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}