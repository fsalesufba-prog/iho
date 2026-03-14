import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MoreVertical, RefreshCw, Maximize2, Minimize2, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'

interface AdminWidgetProps {
  title: string
  children: React.ReactNode
  description?: string
  action?: React.ReactNode
  onRefresh?: () => void
  onRemove?: () => void
  onExpand?: () => void
  loading?: boolean
  expanded?: boolean
  className?: string
  headerClassName?: string
  contentClassName?: string
}

export function AdminWidget({
  title,
  children,
  description,
  action,
  onRefresh,
  onRemove,
  onExpand,
  loading = false,
  expanded = false,
  className,
  headerClassName,
  contentClassName
}: AdminWidgetProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
  }

  return (
    <Card className={cn(
      'relative transition-all',
      expanded && 'fixed inset-4 z-50 overflow-auto',
      className
    )}>
      <CardHeader className={cn(
        'flex flex-row items-center justify-between space-y-0 pb-2',
        headerClassName
      )}>
        <div>
          <CardTitle className="text-base font-medium">{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {action}

          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
          )}

          {onExpand && (
            <Button variant="ghost" size="icon" onClick={onExpand}>
              {expanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Configurar</DropdownMenuItem>
              <DropdownMenuItem>Duplicar</DropdownMenuItem>
              {onRemove && (
                <DropdownMenuItem 
                  onClick={onRemove}
                  className="text-destructive"
                >
                  Remover
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {expanded && onRemove && (
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn(
        'p-4',
        loading && 'opacity-50 pointer-events-none',
        contentClassName
      )}>
        {children}
      </CardContent>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
    </Card>
  )
}