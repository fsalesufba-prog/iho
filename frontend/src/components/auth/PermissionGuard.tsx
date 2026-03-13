'use client'

import { useAuth } from '@/components/hooks/useAuth'
import { ReactNode } from 'react'

type Permission = 
  | 'create:empresa'
  | 'read:empresa'
  | 'update:empresa'
  | 'delete:empresa'
  | 'create:usuario'
  | 'read:usuario'
  | 'update:usuario'
  | 'delete:usuario'
  | 'create:obra'
  | 'read:obra'
  | 'update:obra'
  | 'delete:obra'
  | 'create:equipamento'
  | 'read:equipamento'
  | 'update:equipamento'
  | 'delete:equipamento'
  | 'manage:pagamentos'
  | 'manage:planos'
  | 'view:logs'
  | 'manage:blog'

interface PermissionGuardProps {
  children: ReactNode
  permissions: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
}

// Mapeamento de roles para permissões
const rolePermissions: Record<string, Permission[]> = {
  adm_sistema: [
    'create:empresa', 'read:empresa', 'update:empresa', 'delete:empresa',
    'create:usuario', 'read:usuario', 'update:usuario', 'delete:usuario',
    'create:obra', 'read:obra', 'update:obra', 'delete:obra',
    'create:equipamento', 'read:equipamento', 'update:equipamento', 'delete:equipamento',
    'manage:pagamentos', 'manage:planos', 'view:logs', 'manage:blog',
  ],
  adm_empresa: [
    'create:usuario', 'read:usuario', 'update:usuario', 'delete:usuario',
    'create:obra', 'read:obra', 'update:obra', 'delete:obra',
    'create:equipamento', 'read:equipamento', 'update:equipamento', 'delete:equipamento',
    'manage:pagamentos',
  ],
  controlador: [
    'read:usuario',
    'create:obra', 'read:obra', 'update:obra',
    'create:equipamento', 'read:equipamento', 'update:equipamento',
  ],
  apontador: [
    'read:obra',
    'read:equipamento',
  ],
}

export function PermissionGuard({ 
  children, 
  permissions, 
  requireAll = false,
  fallback = null 
}: PermissionGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const userPermissions = rolePermissions[user.tipo] || []

  const hasPermission = requireAll
    ? permissions.every(p => userPermissions.includes(p))
    : permissions.some(p => userPermissions.includes(p))

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}