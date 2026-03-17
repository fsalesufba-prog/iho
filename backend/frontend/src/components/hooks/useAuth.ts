'use client'

import { useAuth as useAuthFromProvider } from '@/components/providers/AuthProvider'

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
  hasPermission: (permission: string) => boolean
  hasRole: (roles: string[]) => boolean
}

export function useAuth(): AuthContextData {
  return useAuthFromProvider() as AuthContextData
}

export function useAdminSistema() {
  const { user } = useAuth()
  return user?.tipo === 'adm_sistema'
}

export function useAdminEmpresa() {
  const { user } = useAuth()
  return user?.tipo === 'adm_empresa' || user?.tipo === 'adm_sistema'
}

export function useControlador() {
  const { user } = useAuth()
  return (
    user?.tipo === 'controlador' ||
    user?.tipo === 'adm_empresa' ||
    user?.tipo === 'adm_sistema'
  )
}

export function useApontador() {
  const { user } = useAuth()
  return user?.tipo === 'apontador'
}

export function useEmpresaId() {
  const { user } = useAuth()
  return user?.empresaId
}
