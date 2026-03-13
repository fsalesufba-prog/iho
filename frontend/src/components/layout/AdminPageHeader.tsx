import React from 'react'
import { AdminBreadcrumb, AdminBreadcrumbItem } from './AdminBreadcrumb'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface Action {
  label: string
  onClick: () => void
  icon?: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost'
  disabled?: boolean
}

interface AdminPageHeaderProps {
  title: string
  description?: string
  breadcrumb?: AdminBreadcrumbItem[]
  actions?: Action[]
  className?: string
  titleClassName?: string
}

export function AdminPageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
  titleClassName
}: AdminPageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumb && <AdminBreadcrumb items={breadcrumb} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-2xl font-bold tracking-tight', titleClassName)}>{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}