'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/hooks/useToast'

interface OnlineStatusProps {
  showToast?: boolean
  className?: string
}

export function OnlineStatus({ showToast = true, className }: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      if (showToast) {
        toast({
          title: 'Conexão restaurada',
          description: 'Você está online novamente'
        })
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      if (showToast) {
        toast({
          title: 'Sem conexão',
          description: 'Você está offline. Algumas funcionalidades podem estar limitadas',
          variant: 'destructive'
        })
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [showToast, toast])

  return (
    <div className={cn(
      'flex items-center gap-2 text-sm',
      className
    )}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-red-600" />
          <span className="text-red-600">Offline</span>
        </>
      )}
    </div>
  )
}

// Indicador compacto
OnlineStatus.Indicator = function StatusIndicator({ className }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div
      className={cn(
        'h-2 w-2 rounded-full',
        isOnline ? 'bg-green-500' : 'bg-red-500',
        className
      )}
      title={isOnline ? 'Online' : 'Offline'}
    />
  )
}