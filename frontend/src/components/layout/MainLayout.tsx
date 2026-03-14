'use client'

<<<<<<< HEAD
import React, { useState } from 'react'
=======
import React from 'react'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { Header } from './Header'
import { Footer } from './Footer'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export function MainLayout({ children, className }: MainLayoutProps) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/esqueci-senha') || 
                     pathname?.startsWith('/resetar-senha')

  const isAppPage = pathname?.startsWith('/app-empresa') || 
                    pathname?.startsWith('/admin-sistema')

  // Para páginas do app, usar AppLayout
  if (isAppPage) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}