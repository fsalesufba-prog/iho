'use client'

import React, { createContext, useContext, useCallback } from 'react'
import { api } from '@/lib/api'
import { useAuth } from './AuthProvider'
import { useToast } from './ToastProvider'
import { useLoading } from './LoadingProvider'

interface ApiContextData {
  get: <T>(url: string, params?: any) => Promise<T>
  post: <T>(url: string, data?: any) => Promise<T>
  put: <T>(url: string, data?: any) => Promise<T>
  patch: <T>(url: string, data?: any) => Promise<T>
  delete: <T>(url: string) => Promise<T>
  upload: (url: string, file: File, onProgress?: (progress: number) => void) => Promise<any>
}

const ApiContext = createContext<ApiContextData>({} as ApiContextData)

export function ApiProvider({ children }: { children: React.ReactNode }) {
  useAuth()
  const { toast } = useToast()
  const { withLoading } = useLoading()

  const handleError = useCallback((error: any) => {
    const message = error.response?.data?.message || error.message || 'Erro na requisição'
    
    toast({
      title: 'Erro',
      description: message,
      variant: 'error',
    })

    throw error
  }, [toast])

  const get = useCallback(async <T,>(url: string, params?: any): Promise<T> => {
    try {
      const response = await withLoading(api.get(url, { params }))
      return response.data
    } catch (error) {
      return handleError(error)
    }
  }, [withLoading, handleError])

  const post = useCallback(async <T,>(url: string, data?: any): Promise<T> => {
    try {
      const response = await withLoading(api.post(url, data))
      return response.data
    } catch (error) {
      return handleError(error)
    }
  }, [withLoading, handleError])

  const put = useCallback(async <T,>(url: string, data?: any): Promise<T> => {
    try {
      const response = await withLoading(api.put(url, data))
      return response.data
    } catch (error) {
      return handleError(error)
    }
  }, [withLoading, handleError])

  const patch = useCallback(async <T,>(url: string, data?: any): Promise<T> => {
    try {
      const response = await withLoading(api.patch(url, data))
      return response.data
    } catch (error) {
      return handleError(error)
    }
  }, [withLoading, handleError])

  const delete_ = useCallback(async <T,>(url: string): Promise<T> => {
    try {
      const response = await withLoading(api.delete(url))
      return response.data
    } catch (error) {
      return handleError(error)
    }
  }, [withLoading, handleError])

  const upload = useCallback(async (url: string, file: File, onProgress?: (progress: number) => void): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        },
      })
      return response.data
    } catch (error) {
      return handleError(error)
    }
  }, [handleError])

  return (
    <ApiContext.Provider
      value={{
        get,
        post,
        put,
        patch,
        delete: delete_,
        upload,
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}

export const useApi = () => {
  const context = useContext(ApiContext)
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}