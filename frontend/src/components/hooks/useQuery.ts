'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

interface UseQueryOptions<T> {
  enabled?: boolean
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  refetchInterval?: number
  refetchOnWindowFocus?: boolean
}

interface UseQueryResult<T> {
  data: T | undefined
  error: Error | null
  isLoading: boolean
  isFetching: boolean
  refetch: () => Promise<void>
}

export function useQuery<T = any>(
<<<<<<< HEAD
  key: string | any[],
=======
  _key: string | any[],
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  fetcher: () => Promise<T>,
  options: UseQueryOptions<T> = {}
): UseQueryResult<T> {
  const {
    enabled = true,
    initialData,
    onSuccess,
    onError,
    refetchInterval,
    refetchOnWindowFocus = false
  } = options

  const [data, setData] = useState<T | undefined>(initialData)
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)
  const [isFetching, setIsFetching] = useState(false)

  const fetchData = useCallback(async () => {
    setIsFetching(true)
    try {
      const result = await fetcher()
      setData(result)
      setError(null)
      onSuccess?.(result)
    } catch (err) {
      setError(err as Error)
      onError?.(err as Error)
    } finally {
      setIsLoading(false)
      setIsFetching(false)
    }
  }, [fetcher, onSuccess, onError])

  useEffect(() => {
    if (!enabled) return

    fetchData()

    if (refetchInterval) {
      const intervalId = setInterval(fetchData, refetchInterval)
      return () => clearInterval(intervalId)
    }
<<<<<<< HEAD
=======
    return undefined
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  }, [enabled, refetchInterval, fetchData])

  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return

    const handleFocus = () => {
      fetchData()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refetchOnWindowFocus, enabled, fetchData])

  return {
    data,
    error,
    isLoading,
    isFetching,
    refetch: fetchData
  }
}

// Hook para paginação
export function usePaginatedQuery<T = any>(
  url: string,
  params: Record<string, any> = {}
) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<T[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPage = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await api.get(url, {
        params: { ...params, page, limit: params.limit || 10 }
      })
      setData(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [url, params, page])

  useEffect(() => {
    fetchPage()
  }, [page, fetchPage])

  return {
    data,
    page,
    setPage,
    totalPages,
    isLoading,
    error,
    refetch: fetchPage
  }
}

// Hook para infinite scroll
export function useInfiniteQuery<T = any>(
  url: string,
  params: Record<string, any> = {}
) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return

    setIsLoading(true)
    try {
      const response = await api.get(url, {
        params: { ...params, page, limit: params.limit || 20 }
      })
      
      const newItems = response.data.data
      setItems(prev => [...prev, ...newItems])
      setHasMore(response.data.meta.hasMore)
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [url, params, page, hasMore, isLoading])

  return {
    items,
    loadMore,
    hasMore,
    isLoading,
    error
  }
}