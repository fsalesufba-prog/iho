import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, Flag, Info } from 'lucide-react'

interface AlertaPriorityProps {
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const priorityConfig = {
  baixa: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    icon: Info,
    label: 'Baixa'
  },
  media: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    icon: Flag,
    label: 'Média'
  },
  alta: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    icon: AlertTriangle,
    label: 'Alta'
  },
  critica: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    icon: AlertTriangle,
    label: 'Crítica'
  }
}

export function AlertaPriority({ prioridade, showIcon = true, size = 'md' }: AlertaPriorityProps) {
  const config = priorityConfig[prioridade]
  const Icon = config.icon
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  }

  return (
    <Badge className={`${config.color} ${sizeClasses[size]}`}>
      <span className="flex items-center space-x-1">
        {showIcon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />}
        <span>{config.label}</span>
      </span>
    </Badge>
  )
}