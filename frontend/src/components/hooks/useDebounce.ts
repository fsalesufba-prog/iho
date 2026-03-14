'use client'

<<<<<<< HEAD
import { useState, useEffect } from 'react'
=======
import { useState, useEffect, useCallback } from 'react'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook para debounce de função
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const id = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimeoutId(id)
  }, [callback, delay, timeoutId])

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return debouncedCallback as T
}

// Hook para debounce com leading
export function useDebounceLeading<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>()
  const [lastArgs, setLastArgs] = useState<Parameters<T> | null>(null)

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (!timeoutId) {
      callback(...args)
    }

    setLastArgs(args)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    const id = setTimeout(() => {
      if (lastArgs) {
        callback(...lastArgs)
      }
      setTimeoutId(undefined)
      setLastArgs(null)
    }, delay)

    setTimeoutId(id)
  }, [callback, delay, timeoutId, lastArgs])

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  return debouncedCallback as T
}