'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/components/hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'adm_sistema' | 'adm_empresa' | 'controlador' | 'apontador'
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      // Se não estiver autenticado, redireciona para login
      if (!isAuthenticated) {
        router.push(`/login?from=${encodeURIComponent(pathname)}`)
        return
      }

      // Se tem role específica requerida
      if (requiredRole && user?.tipo !== requiredRole) {
        // Redireciona baseado no tipo do usuário
        if (user?.tipo === 'adm_sistema') {
          router.push('/admin-sistema/dashboard')
        } else {
          router.push('/app-empresa/dashboard')
        }
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, router, pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">
            Carregando...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.tipo !== requiredRole) {
    return null
  }

  return <>{children}</>
}