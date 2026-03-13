'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/hooks/useAuth'
import { LoadingScreen } from '@/components/layout/LoadingScreen'

export default function AppRootPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      // Redirecionar baseado no tipo de usuário
      if (user.tipo === 'adm_sistema') {
        router.push('/admin-sistema/dashboard')
      } else {
        router.push('/app-empresa/dashboard')
      }
    }
  }, [isLoading, user, router])

  return <LoadingScreen message="Redirecionando..." />
}