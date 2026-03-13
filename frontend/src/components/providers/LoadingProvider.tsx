'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { cn } from '@/lib/utils'

interface LoadingContextData {
  isLoading: boolean
  startLoading: (message?: string) => void
  stopLoading: () => void
  withLoading: <T>(promise: Promise<T>, message?: string) => Promise<T>
}

const LoadingContext = createContext<LoadingContextData>({} as LoadingContextData)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | undefined>()

  const startLoading = useCallback((loadingMessage?: string) => {
    setMessage(loadingMessage)
    setIsLoading(true)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setMessage(undefined)
  }, [])

  const withLoading = useCallback(async <T,>(promise: Promise<T>, loadingMessage?: string): Promise<T> => {
    try {
      startLoading(loadingMessage)
      return await promise
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading, withLoading }}>
      {children}
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            {message && (
              <p className="mt-4 text-sm text-muted-foreground">{message}</p>
            )}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}