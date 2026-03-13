'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingScreen } from '@/components/layout/LoadingScreen'

export default function AppEmpresaLayout({
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
      } else if (user?.tipo === 'adm_sistema') {
        router.push('/admin-sistema/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading) {
    return <LoadingScreen message="Carregando ambiente da empresa..." />
  }

  if (!isAuthenticated || user?.tipo === 'adm_sistema') {
    return null
  }

  return <AppLayout>{children}</AppLayout>
}