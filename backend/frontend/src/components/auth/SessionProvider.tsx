'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Loader2 } from 'lucide-react'

interface User {
  id: number
  nome: string
  email: string
  tipo: 'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'
  empresaId?: number
  avatar?: string
  telefone?: string
}

interface AuthContextData {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<any>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadStoredSession()
  }, [])

  const loadStoredSession = async () => {
    try {
      const token = localStorage.getItem('@iho:token') || sessionStorage.getItem('@iho:token')
      
      if (!token) {
        setIsLoading(false)
        return
      }

      api.defaults.headers.Authorization = `Bearer ${token}`

      const response = await api.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Erro ao carregar sessão:', error)
      localStorage.removeItem('@iho:token')
      sessionStorage.removeItem('@iho:token')
      delete api.defaults.headers.Authorization
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    const response = await api.post('/auth/login', { email, password })

    const { token, refreshToken, user } = response.data

    if (rememberMe) {
      localStorage.setItem('@iho:token', token)
      localStorage.setItem('@iho:refreshToken', refreshToken)
    } else {
      sessionStorage.setItem('@iho:token', token)
      sessionStorage.setItem('@iho:refreshToken', refreshToken)
    }

    api.defaults.headers.Authorization = `Bearer ${token}`
    setUser(user)

    return response.data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      localStorage.removeItem('@iho:token')
      localStorage.removeItem('@iho:refreshToken')
      sessionStorage.removeItem('@iho:token')
      sessionStorage.removeItem('@iho:refreshToken')
      delete api.defaults.headers.Authorization
      setUser(null)
      router.push('/login')
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('@iho:refreshToken') || sessionStorage.getItem('@iho:refreshToken')
      
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await api.post('/auth/refresh', { refreshToken })
      const { token } = response.data

      if (localStorage.getItem('@iho:token')) {
        localStorage.setItem('@iho:token', token)
      } else {
        sessionStorage.setItem('@iho:token', token)
      }

      api.defaults.headers.Authorization = `Bearer ${token}`
    } catch (error) {
      console.error('Erro ao renovar token:', error)
      await logout()
    }
  }

  // Interceptor para refresh token
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            await refreshToken()
            return api(originalRequest)
          } catch (refreshError) {
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )

    return () => {
      api.interceptors.response.eject(interceptor)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Carregando sessão...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useSession = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider')
  }
  return context
}