import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Calendar, AlertCircle, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ManutencaoType = 'preventiva' | 'corretiva' | 'preditiva'

interface ManutencaoTypeProps {
  tipo: ManutencaoType
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const typeConfig: Record<ManutencaoType, { color: string; label: string; icon: any }> = {
  preventiva: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    label: 'Preventiva',
    icon: Calendar
  },
  corretiva: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    label: 'Corretiva',
    icon: AlertCircle
  },
  preditiva: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    label: 'Preditiva',
    icon: Activity
  }
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
}

export function ManutencaoType({ 
  tipo, 
  size = 'md', 
  showIcon = true,
  className 
}: ManutencaoTypeProps) {
  const config = typeConfig[tipo]
  const Icon = config.icon

  return (
    <Badge 
      variant="secondary"
      className={cn(
        config.color,
        sizeClasses[size],
        className
      )}
    >
      <span className="flex items-center gap-1">
        {showIcon && <Icon className="h-3 w-3" />}
        <span>{config.label}</span>
      </span>
    </Badge>
  )
}