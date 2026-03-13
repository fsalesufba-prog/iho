import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { AlertTriangle, Flag, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ManutencaoPriorityType = 'baixa' | 'media' | 'alta' | 'critica'

interface ManutencaoPriorityProps {
  prioridade: ManutencaoPriorityType
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const priorityConfig: Record<ManutencaoPriorityType, { color: string; label: string; icon: any }> = {
  baixa: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    label: 'Baixa',
    icon: Info
  },
  media: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    label: 'Média',
    icon: Flag
  },
  alta: {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    label: 'Alta',
    icon: AlertTriangle
  },
  critica: {
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    label: 'Crítica',
    icon: AlertTriangle
  }
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
}

export function ManutencaoPriority({ 
  prioridade, 
  size = 'md', 
  showIcon = true,
  className 
}: ManutencaoPriorityProps) {
  const config = priorityConfig[prioridade]
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