import React from 'react'
import { Bell } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface AlertaBadgeProps {
  count: number
  variant?: 'default' | 'destructive' | 'warning'
  className?: string
}

export function AlertaBadge({ count, variant = 'default', className }: AlertaBadgeProps) {
  if (count === 0) return null

  const variantClasses = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    warning: 'bg-yellow-500 text-white'
  }

  return (
    <div className={cn('relative inline-flex', className)}>
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