import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export type ManutencaoStatusType = 'programada' | 'em_andamento' | 'concluida' | 'cancelada'

interface ManutencaoStatusProps {
  status: ManutencaoStatusType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const statusConfig: Record<ManutencaoStatusType, { color: string; label: string; icon?: string }> = {
  programada: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    label: 'Programada',
    icon: '📅'
  },
  em_andamento: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    label: 'Em Andamento',
    icon: '⚙️'
  },
  concluida: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Concluída',
    icon: '✓'
  },
  cancelada: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    label: 'Cancelada',
    icon: '✗'
  }
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
}

export function ManutencaoStatus({ 
  status, 
  size = 'md', 
  showLabel = true,
  className 
}: ManutencaoStatusProps) {
  const config = statusConfig[status]

  if (!showLabel) {
    return (
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'programada' && 'bg-blue-500',
          status === 'em_andamento' && 'bg-yellow-500',
          status === 'concluida' && 'bg-green-500',
          status === 'cancelada' && 'bg-red-500',
          className
        )}
        title={config.label}
      />
    )
  }

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
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </span>
    </Badge>
  )
}