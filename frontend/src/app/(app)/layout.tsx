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
<<<<<<< HEAD
  const { user, isLoading, isAuthenticated } = useAuth()
=======
  const { isLoading, isAuthenticated } = useAuth()
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
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