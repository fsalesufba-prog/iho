import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

export type StatusType = 
  | 'success' | 'error' | 'warning' | 'info' | 'neutral'
  | 'active' | 'inactive' | 'pending' | 'blocked' | 'completed'
  | 'approved' | 'rejected' | 'review' | 'draft' | 'published'

interface StatusBadgeProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
<<<<<<< HEAD
=======
  children?: React.ReactNode
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
}

const statusConfig: Record<StatusType, { color: string; label: string }> = {
  success: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Sucesso' },
  error: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Erro' },
  warning: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Atenção' },
  info: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Info' },
  neutral: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', label: 'Neutro' },
  active: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Ativo' },
  inactive: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', label: 'Inativo' },
  pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Pendente' },
  blocked: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Bloqueado' },
  completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Concluído' },
  approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Aprovado' },
  rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', label: 'Rejeitado' },
  review: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', label: 'Revisão' },
  draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', label: 'Rascunho' },
  published: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Publicado' },
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
}

export function StatusBadge({ status, label, size = 'md', className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.neutral

  return (
    <Badge 
      variant="secondary"
      className={cn(
        'font-normal',
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {label || config.label}
    </Badge>
  )
}

// Status com ícone
StatusBadge.WithIcon = function StatusBadgeWithIcon({
  status,
  icon,
  label,
  ...props
}: StatusBadgeProps & { icon: React.ReactNode }) {
  return (
    <StatusBadge status={status} label={label} {...props}>
      <span className="flex items-center gap-1">
        {icon}
        {label || statusConfig[status].label}
      </span>
    </StatusBadge>
  )
}

// Status circular (apenas ícone/dot)
StatusBadge.Dot = function StatusDot({ status, className }: { status: StatusType; className?: string }) {
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    pending: 'bg-yellow-500',
    blocked: 'bg-red-500',
    completed: 'bg-green-500',
    approved: 'bg-green-500',
    rejected: 'bg-red-500',
    review: 'bg-yellow-500',
    draft: 'bg-gray-500',
    published: 'bg-green-500',
  }

  return (
    <span className={cn('flex h-2 w-2 rounded-full', colors[status], className)} />
  )
}