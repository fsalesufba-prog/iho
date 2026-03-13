import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, PauseCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ObraStatusType = 'ativa' | 'paralisada' | 'concluida' | 'cancelada'

interface ObraStatusProps {
  status: ObraStatusType
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<ObraStatusType, { color: string; label: string; icon: any }> = {
  ativa: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Ativa',
    icon: CheckCircle
  },
  paralisada: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    label: 'Paralisada',
    icon: PauseCircle
  },
  concluida: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    label: 'Concluída',
    icon: CheckCircle
  },
  cancelada: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    label: 'Cancelada',
    icon: XCircle
  }
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
}

export function ObraStatus({ 
  status, 
  size = 'md', 
  showIcon = true,
  className 
}: ObraStatusProps) {
  const config = statusConfig[status]
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