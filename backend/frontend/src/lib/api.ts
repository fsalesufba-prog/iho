import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { getCookie, setCookie, removeCookie } from './cookies'
import { logger } from './logger'

// Configuração base da API
// - Browser: SEMPRE usa URL relativa /api (evita CORS; Express serve frontend + API no mesmo host)
// - SSR (servidor): usa NEXT_PUBLIC_API_URL ou localhost
const API_URL = typeof window !== 'undefined'
  ? '/api'                                                             // browser → URL relativa sempre
  : (process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.PORT || 3000}/api`) // SSR
const API_TIMEOUT = 30000 // 30 segundos

// Tipos de erro da API
export interface ApiError {
  message: string
  code: string
  status: number
  details?: any
}

// Configuração do axios
const config: AxiosRequestConfig = {
  baseURL: API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

// Instância do axios
const api: AxiosInstance = axios.create(config)

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    // Adicionar token de autenticação
    const token = getCookie('@iho:token') || localStorage.getItem('@iho:token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log da requisição em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      logger.debug('API Request:', {
        method: config.method,
        url: config.url,
        params: config.params,
        data: config.data,
      })
    }

    return config
  },
  (error) => {
    logger.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor de resposta
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log da resposta em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      logger.debug('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      })
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Log do erro
    logger.error('API Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    })

    // Tratamento de erro 401 (não autorizado)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Tentar renovar o token
        const refreshToken = getCookie('@iho:refreshToken') || localStorage.getItem('@iho:refreshToken')
        
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await api.post('/auth/refresh', { refreshToken })
        const { token } = response.data

        // Atualizar token
        setCookie('@iho:token', token)
        localStorage.setItem('@iho:token', token)
        
        // Reenviar requisição original
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      } catch (refreshError) {
        // Se não conseguir renovar, redirecionar para login
        removeCookie('@iho:token')
        removeCookie('@iho:refreshToken')
        localStorage.removeItem('@iho:token')
        localStorage.removeItem('@iho:refreshToken')
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Tratamento de erro 403 (proibido)
    if (error.response?.status === 403) {
      // Redirecionar para página de acesso negado
      if (typeof window !== 'undefined') {
        window.location.href = '/acesso-negado'
      }
    }

    // Tratamento de erro 404 (não encontrado)
    if (error.response?.status === 404) {
      // Redirecionar para página 404
      if (typeof window !== 'undefined') {
        window.location.href = '/404'
      }
    }

    // Tratamento de erro 500 (erro do servidor)
    if (error.response?.status === 500) {
      // Redirecionar para página de erro
      if (typeof window !== 'undefined') {
        window.location.href = '/erro'
      }
    }

    return Promise.reject(error)
  }
)

// Métodos da API
export const apiService = {
  // GET
  get: <T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.get(url, { params, ...config }).then(response => response.data),

  // POST
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.post(url, data, config).then(response => response.data),

  // PUT
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.put(url, data, config).then(response => response.data),

  // PATCH
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.patch(url, data, config).then(response => response.data),

  // DELETE
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete(url, config).then(response => response.data),

  // Upload de arquivos
  upload: <T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    }).then(response => response.data)
  },

  // Download de arquivos
  download: (url: string, filename?: string): Promise<void> =>
    api.get(url, { responseType: 'blob' }).then(response => {
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    }),
}

export { api }
export default api