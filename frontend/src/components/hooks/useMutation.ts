'use client'

import { useState, useCallback } from 'react'
import { api } from '@/lib/api'

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: Error, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables) => void
}

interface UseMutationResult<TData, TVariables> {
  data: TData | undefined
  error: Error | null
  isLoading: boolean
  mutate: (variables: TVariables) => Promise<TData>
  reset: () => void
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | undefined>()
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const mutate = useCallback(async (variables: TVariables) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await mutationFn(variables)
      setData(result)
      options.onSuccess?.(result, variables)
      options.onSettled?.(result, null, variables)
      return result
    } catch (err) {
      const error = err as Error
      setError(error)
      options.onError?.(error, variables)
      options.onSettled?.(undefined, error, variables)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [mutationFn, options])

  const reset = useCallback(() => {
    setData(undefined)
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    data,
    error,
    isLoading,
    mutate,
    reset
  }
}

// Hooks específicos para operações CRUD
export function useCreate<T = any>(url: string) {
  return useMutation<T, Partial<T>>(
    async (data) => {
      const response = await api.post(url, data)
      return response.data
    }
  )
}

export function useUpdate<T = any>(url: string) {
  return useMutation<T, { id: number; data: Partial<T> }>(
    async ({ id, data }) => {
      const response = await api.put(`${url}/${id}`, data)
      return response.data
    }
  )
}

export function useDelete(url: string) {
  return useMutation<void, number>(
    async (id) => {
      await api.delete(`${url}/${id}`)
    }
  )
}

export function useUpload() {
  return useMutation<any, { url: string; file: File; onProgress?: (progress: number) => void }>(
    async ({ url, file, onProgress }) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post(url, formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        }
      })

      return response.data
    }
  )
}