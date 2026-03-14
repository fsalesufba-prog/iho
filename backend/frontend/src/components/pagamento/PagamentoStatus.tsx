import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PagamentoStatusType = 'pendente' | 'pago' | 'atrasado' | 'cancelado'

interface PagamentoStatusProps {
  status: PagamentoStatusType
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const statusConfig: Record<PagamentoStatusType, { color: string; label: string; icon: any }> = {
  pendente: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    label: 'Pendente',
    icon: Clock
  },
  pago: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Pago',
    icon: CheckCircle
  },
  atrasado: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    label: 'Atrasado',
    icon: AlertTriangle
  },
  cancelado: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    label: 'Cancelado',
    icon: XCircle
  }
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
}

export function PagamentoStatus({ 
  status, 
  size = 'md', 
  showIcon = true,
  className 
}: PagamentoStatusProps) {
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