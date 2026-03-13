import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Eye, CheckCircle, XCircle, Clock } from 'lucide-react'

interface AlertaStatusProps {
  status: 'novo' | 'lido' | 'resolvido' | 'ignorado'
  showIcon?: boolean
}

const statusConfig = {
  novo: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: Eye,
    label: 'Novo'
  },
  lido: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    icon: Clock,
    label: 'Lido'
  },
  resolvido: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    icon: CheckCircle,
    label: 'Resolvido'
  },
  ignorado: {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    icon: XCircle,
    label: 'Ignorado'
  }
}

export function AlertaStatus({ status, showIcon = true }: AlertaStatusProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={config.color}>
      <span className="flex items-center space-x-1">
        {showIcon && <Icon className="h-3 w-3" />}
        <span>{config.label}</span>
      </span>
    </Badge>
  )
}