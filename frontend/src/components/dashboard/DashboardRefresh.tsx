'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'

interface DashboardRefreshProps {
  onRefresh: () => Promise<void> | void
  autoRefresh?: boolean
  interval?: number // em segundos
  lastUpdated?: Date
  className?: string
}

export function DashboardRefresh({
  onRefresh,
  autoRefresh = false,
  interval = 30,
  lastUpdated,
  className
}: DashboardRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(autoRefresh)
  const [countdown, setCountdown] = useState(interval)

  useEffect(() => {
    if (!autoRefreshEnabled) return

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleRefresh()
          return interval
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [autoRefreshEnabled, interval])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Nunca'
    
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000)
    
    if (diff < 60) return `${diff} segundos atrás`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutos atrás`
    return lastUpdated.toLocaleTimeString()
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="text-sm text-muted-foreground">
        Última atualização: {formatLastUpdated()}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw className={cn(
          'h-4 w-4 mr-2',
          isRefreshing && 'animate-spin'
        )} />
        {isRefreshing ? 'Atualizando...' : 'Atualizar'}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Clock className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}>
            {autoRefreshEnabled ? 'Desativar' : 'Ativar'} atualização automática
          </DropdownMenuItem>
          
          {autoRefreshEnabled && (
            <>
              <DropdownMenuItem onClick={() => setCountdown(15)}>
                A cada 15 segundos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCountdown(30)}>
                A cada 30 segundos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCountdown(60)}>
                A cada 1 minuto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCountdown(300)}>
                A cada 5 minutos
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {autoRefreshEnabled && (
        <div className="text-xs text-muted-foreground">
          Atualizando em {countdown}s
        </div>
      )}
    </div>
  )
}