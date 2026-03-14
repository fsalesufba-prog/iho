'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/hooks/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoadingScreen } from '@/components/layout/LoadingScreen'

export default function AppRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <LoadingScreen message="Carregando aplicação..." />
  }

  if (!isAuthenticated) {
    return null
  }

  return <AppLayout>{children}</AppLayout>
}