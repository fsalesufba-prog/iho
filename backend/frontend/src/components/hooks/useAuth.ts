'use client'

import { useSession } from '@/components/auth/SessionProvider'

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
  const context = useSession()

  const hasPermission = (permission: string): boolean => {
    if (!context.user) return false

    // Mapeamento de permissões por role
    const permissions: Record<string, string[]> = {
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
        'manage:pagamentos'
      ],
      controlador: [
        'read:usuario',
        'create:obra', 'read:obra', 'update:obra',
        'create:equipamento', 'read:equipamento', 'update:equipamento'
      ],
      apontador: [
        'read:obra',
        'read:equipamento',
        'create:apontamento', 'read:apontamento'
      ]
    }

    return permissions[context.user.tipo]?.includes(permission) || false
  }

  const hasRole = (roles: string[]): boolean => {
    if (!context.user) return false
    return roles.includes(context.user.tipo)
  }

  return {
    ...context,
    hasPermission,
    hasRole
  }
}

// Hooks específicos por role
export function useAdminSistema() {
  const { user } = useAuth()
  return user?.tipo === 'adm_sistema'
}

export function useAdminEmpresa() {
  const { user } = useAuth()
  return user?.tipo === 'adm_empresa'
}

export function useControlador() {
  const { user } = useAuth()
  return user?.tipo === 'controlador'
}

export function useApontador() {
  const { user } = useAuth()
  return user?.tipo === 'apontador'
}

export function useEmpresaId() {
  const { user } = useAuth()
  return user?.empresaId
}