import React from 'react'
import { Inbox, Search, File, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: {
    icon: 'h-8 w-8',
    title: 'text-base',
    description: 'text-sm',
    padding: 'p-4'
  },
  md: {
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-sm',
    padding: 'p-8'
  },
  lg: {
    icon: 'h-16 w-16',
    title: 'text-xl',
    description: 'text-base',
    padding: 'p-12'
  }
}

export function EmptyState({
  icon = <Inbox />,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md'
}: EmptyStateProps) {
  const sizeConfig = sizes[size]

  return (
    <div className={cn(
      'text-center',
      sizeConfig.padding,
      className
    )}>
      <div className="flex justify-center mb-4">
        <div className={cn(
          'text-muted-foreground',
          sizeConfig.icon
        )}>
          {icon}
        </div>
      </div>

      <h3 className={cn(
        'font-semibold mb-2',
        sizeConfig.title
      )}>
        {title}
      </h3>

      {description && (
        <p className={cn(
          'text-muted-foreground mb-6',
          sizeConfig.description
        )}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3">
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Empty state para busca sem resultados
EmptyState.Search = function SearchEmptyState({
  searchTerm,
  onClear,
  ...props
}: Omit<EmptyStateProps, 'icon' | 'title'> & {
  searchTerm?: string
  onClear?: () => void
}) {
  return (
    <EmptyState
      icon={<Search />}
      title="Nenhum resultado encontrado"
      description={searchTerm 
        ? `Não encontramos resultados para "${searchTerm}"` 
        : 'Tente buscar por outros termos ou limpar os filtros'
      }
      action={onClear ? {
        label: 'Limpar busca',
        onClick: onClear
      } : undefined}
      {...props}
    />
  )
}

// Empty state para lista vazia
EmptyState.List = function ListEmptyState({
  resourceName = 'itens',
  onCreate,
  ...props
}: Omit<EmptyStateProps, 'icon' | 'title'> & {
  resourceName?: string
  onCreate?: () => void
}) {
  return (
    <EmptyState
      icon={<File />}
      title={`Nenhum ${resourceName} encontrado`}
      description={`Comece criando seu primeiro ${resourceName}.`}
      action={onCreate ? {
        label: `Criar ${resourceName}`,
        onClick: onCreate
      } : undefined}
      {...props}
    />
  )
}

// Empty state para erro
EmptyState.Error = function ErrorEmptyState({
  message = 'Ocorreu um erro ao carregar os dados',
  onRetry,
  ...props
}: Omit<EmptyStateProps, 'icon' | 'title'> & {
  message?: string
  onRetry?: () => void
}) {
  return (
    <EmptyState
      icon={<AlertCircle className="text-destructive" />}
      title="Ops! Algo deu errado"
      description={message}
      action={onRetry ? {
        label: 'Tentar novamente',
        onClick: onRetry
      } : undefined}
      {...props}
    />
  )
}