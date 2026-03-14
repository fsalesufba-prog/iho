import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export type EmpresaStatusType = 'ativo' | 'inativo' | 'atrasado' | 'cancelado' | 'pendente'

interface EmpresaStatusProps {
  status: EmpresaStatusType
  diasAtraso?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const statusConfig: Record<EmpresaStatusType, { color: string; label: string; icon?: string }> = {
  ativo: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Ativo',
    icon: '✓'
  },
  inativo: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    label: 'Inativo',
    icon: '○'
  },
  atrasado: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    label: 'Em atraso',
    icon: '⚠'
  },
  cancelado: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    label: 'Cancelado',
    icon: '✗'
  },
  pendente: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    label: 'Pendente',
    icon: '○'
  }
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
}

export function EmpresaStatus({ 
  status, 
  diasAtraso, 
  size = 'md', 
  showLabel = true,
  className 
}: EmpresaStatusProps) {
  const config = statusConfig[status]

  if (!showLabel) {
    return (
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'ativo' && 'bg-green-500',
          status === 'inativo' && 'bg-gray-400',
          status === 'atrasado' && 'bg-red-500',
          status === 'cancelado' && 'bg-gray-600',
          status === 'pendente' && 'bg-yellow-500',
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
      {status === 'atrasado' && diasAtraso 
        ? `${diasAtraso} dias em atraso`
        : config.label
      }
    </Badge>
  )
}

// Variação com ícone
EmpresaStatus.WithIcon = function StatusWithIcon({
  status,
  diasAtraso,
  className
}: EmpresaStatusProps) {
  const config = statusConfig[status]
  const icon = config.icon || '•'

  return (
    <span className={cn('inline-flex items-center gap-1', config.color, className)}>
      <span>{icon}</span>
      <span>{status === 'atrasado' && diasAtraso ? `${diasAtraso} dias` : config.label}</span>
    </span>
  )
}