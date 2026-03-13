'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/hooks/useAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { LoadingScreen } from '@/components/layout/LoadingScreen'

export default function AdminSistemaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.tipo !== 'adm_sistema') {
        router.push('/app-empresa/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading) {
    return <LoadingScreen message="Carregando painel administrativo..." />
  }

  if (!isAuthenticated || user?.tipo !== 'adm_sistema') {
    return null
  }

  return <AdminLayout>{children}</AdminLayout>
}