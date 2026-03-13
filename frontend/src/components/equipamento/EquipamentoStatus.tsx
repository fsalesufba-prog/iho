import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export type EquipamentoStatusType = 'disponivel' | 'em_uso' | 'manutencao' | 'inativo'

interface EquipamentoStatusProps {
  status: EquipamentoStatusType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const statusConfig: Record<EquipamentoStatusType, { color: string; label: string; icon?: string }> = {
  disponivel: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Disponível',
    icon: '✓'
  },
  em_uso: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    label: 'Em Uso',
    icon: '▶'
  },
  manutencao: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    label: 'Em Manutenção',
    icon: '⚙'
  },
  inativo: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    label: 'Inativo',
    icon: '○'
  }
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
}

export function EquipamentoStatus({ 
  status, 
  size = 'md', 
  showLabel = true,
  className 
}: EquipamentoStatusProps) {
  const config = statusConfig[status]

  if (!showLabel) {
    return (
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'disponivel' && 'bg-green-500',
          status === 'em_uso' && 'bg-blue-500',
          status === 'manutencao' && 'bg-yellow-500',
          status === 'inativo' && 'bg-gray-400',
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
      {config.label}
    </Badge>
  )
}

// Variação com ícone
EquipamentoStatus.WithIcon = function StatusWithIcon({
  status,
  className
}: EquipamentoStatusProps) {
  const config = statusConfig[status]
  const icon = config.icon || '•'

  return (
    <span className={cn('inline-flex items-center gap-1', config.color, className)}>
      <span>{icon}</span>
      <span>{config.label}</span>
    </span>
  )
}