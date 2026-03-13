'use client'

import { useState, useCallback } from 'react'

interface UseLoadingProps {
  initialState?: boolean
}

export function useLoading({ initialState = false }: UseLoadingProps = {}) {
  const [isLoading, setIsLoading] = useState(initialState)
  const [error, setError] = useState<Error | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
    try {
      startLoading()
      const result = await promise
      return result
    } catch (err) {
      setError(err as Error)
      throw err
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    withLoading
  }
}

// Hook para loading com timeout
export function useLoadingWithTimeout(timeoutMs: number = 5000) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setError(null)

    const timeoutId = setTimeout(() => {
      setIsLoading(false)
      setError(new Error('Tempo limite excedido'))
    }, timeoutMs)

    return () => clearTimeout(timeoutId)
  }, [timeoutMs])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
  }, [])

  return {
    isLoading,
    error,
    startLoading,
    stopLoading
  }
}

// Hook para loading com progresso
export function useProgressLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<Error | null>(null)

  const startLoading = useCallback(() => {
    setIsLoading(true)
    setProgress(0)
    setError(null)
  }, [])

  const updateProgress = useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)))
  }, [])

  const stopLoading = useCallback(() => {
    setIsLoading(false)
    setProgress(100)
  }, [])

  return {
    isLoading,
    progress,
    error,
    startLoading,
    updateProgress,
    stopLoading
  }
}