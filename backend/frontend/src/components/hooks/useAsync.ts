'use client'

import { useState, useCallback, useEffect } from 'react'

interface UseAsyncOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseAsyncResult<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  execute: (...args: any[]) => Promise<T>
  reset: () => void
}

export function useAsync<T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> = {}
): UseAsyncResult<T> {
  const { immediate = false, onSuccess, onError } = options

  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(immediate)

  const execute = useCallback(async (...args: any[]) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await asyncFn(...args)
      setData(result)
      onSuccess?.(result)
      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      onError?.(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [asyncFn, onSuccess, onError])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [immediate, execute])

  return { data, error, isLoading, execute, reset }
}

// Hook para async com retry
export function useAsyncWithRetry<T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions<T> & { retries?: number; retryDelay?: number } = {}
) {
  const { retries = 3, retryDelay = 1000, ...restOptions } = options
  const [attempts, setAttempts] = useState(0)

  const executeWithRetry = useCallback(async (...args: any[]) => {
    let lastError: Error

    for (let i = 0; i < retries; i++) {
      try {
        const result = await asyncFn(...args)
        setAttempts(0)
        return result
      } catch (err) {
        lastError = err as Error
        setAttempts(i + 1)
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, i)))
        }
      }
    }

    throw lastError!
  }, [asyncFn, retries, retryDelay])

  const result = useAsync(executeWithRetry, restOptions)

  return {
    ...result,
    attempts
  }
}

// Hook para async com cache
export function useAsyncWithCache<T = any>(
  asyncFn: (...args: any[]) => Promise<T>,
  cacheKey: string,
  options: UseAsyncOptions<T> & { cacheTime?: number } = {}
) {
  const { cacheTime = 5 * 60 * 1000, ...restOptions } = options
  const [cache] = useState(() => new Map<string, { data: T; timestamp: number }>())

  const executeWithCache = useCallback(async (...args: any[]) => {
    const key = `${cacheKey}-${JSON.stringify(args)}`
    const cached = cache.get(key)

    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data
    }

    const result = await asyncFn(...args)
    cache.set(key, { data: result, timestamp: Date.now() })
    return result
  }, [asyncFn, cacheKey, cacheTime, cache])

  return useAsync(executeWithCache, restOptions)
}