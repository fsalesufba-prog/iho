'use client'

import { useAuth } from '@/components/hooks/useAuth'
import { ReactNode } from 'react'

type UserRole = 'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  if (!allowedRoles.includes(user.tipo as UserRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}