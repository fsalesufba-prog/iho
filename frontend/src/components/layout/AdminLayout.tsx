'use client'

import React from 'react'
import { AppLayout } from './AppLayout'
import { useAuth } from '@/components/hooks/useAuth'
import { RoleGuard } from '@/components/auth/RoleGuard'

interface AdminLayoutProps {
  children: React.ReactNode
  className?: string
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  const { user } = useAuth()

  // Se for admin do sistema, usa o AppLayout normal
  if (user?.tipo === 'adm_sistema') {
    return <AppLayout className={className}>{children}</AppLayout>
  }

  // Para outros tipos, usa o RoleGuard para garantir acesso apenas a admin_empresa
  return (
    <RoleGuard allowedRoles={['adm_empresa']}>
      <AppLayout className={className}>{children}</AppLayout>
    </RoleGuard>
  )
}