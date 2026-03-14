import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UsuarioStatusProps {
  ativo: boolean
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base'
}

export function UsuarioStatus({ 
  ativo, 
  size = 'md', 
  showIcon = true,
  className 
}: UsuarioStatusProps) {
  return (
    <Badge 
      variant="secondary"
      className={cn(
        ativo 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        sizeClasses[size],
        className
      )}
    >
      <span className="flex items-center gap-1">
        {showIcon && (ativo ? (
          <CheckCircle className="h-3 w-3" />
        ) : (
          <XCircle className="h-3 w-3" />
        ))}
        <span>{ativo ? 'Ativo' : 'Inativo'}</span>
      </span>
    </Badge>
  )
}