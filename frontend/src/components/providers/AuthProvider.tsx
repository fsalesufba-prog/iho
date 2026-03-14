'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  refreshToken: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

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
    try {
      setIsLoading(true)
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

      toast({
        title: 'Login realizado!',
        description: `Bem-vindo, ${user.nome}!`,
      })

      // Redirecionar baseado no tipo de usuário
      if (user.tipo === 'adm_sistema') {
        router.push('/admin-sistema/dashboard')
      } else {
        router.push('/app-empresa/dashboard')
      }
    } catch (error: any) {
      console.error('Erro no login:', error)
      toast({
        title: 'Erro no login',
        description: error.response?.data?.message || 'Credenciais inválidas',
<<<<<<< HEAD
        variant: 'destructive',
=======
        variant: 'error',
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
      throw error
    } finally {
      setIsLoading(false)
    }
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
      
      toast({
        title: 'Logout realizado',
        description: 'Você saiu do sistema.',
      })
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

  // Mapeamento de permissões por role
  const permissionsMap: Record<string, string[]> = {
    adm_sistema: [
      'create:empresa', 'read:empresa', 'update:empresa', 'delete:empresa',
      'create:usuario', 'read:usuario', 'update:usuario', 'delete:usuario',
      'create:obra', 'read:obra', 'update:obra', 'delete:obra',
      'create:equipamento', 'read:equipamento', 'update:equipamento', 'delete:equipamento',
      'manage:pagamentos', 'manage:planos', 'view:logs', 'manage:blog'
    ],
    adm_empresa: [
      'create:usuario', 'read:usuario', 'update:usuario', 'delete:usuario',
      'create:obra', 'read:obra', 'update:obra', 'delete:obra',
      'create:equipamento', 'read:equipamento', 'update:equipamento', 'delete:equipamento',
      'manage:pagamentos', 'view:relatorios'
    ],
    controlador: [
      'read:usuario',
      'create:obra', 'read:obra', 'update:obra',
      'create:equipamento', 'read:equipamento', 'update:equipamento',
      'create:apontamento', 'read:apontamento', 'update:apontamento',
      'view:relatorios'
    ],
    apontador: [
      'read:obra',
      'read:equipamento',
      'create:apontamento', 'read:apontamento'
    ]
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    const userPermissions = permissionsMap[user.tipo] || []
    return userPermissions.includes(permission)
  }

  const hasRole = (roles: string[]): boolean => {
    if (!user) return false
    return roles.includes(user.tipo)
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
        hasPermission,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}