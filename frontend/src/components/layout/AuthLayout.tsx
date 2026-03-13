import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  className?: string
}

export function AuthLayout({ children, title, subtitle, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="IHO"
                width={180}
                height={48}
                className="mx-auto"
                priority
              />
            </Link>
            <h2 className="mt-6 text-3xl font-bold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>

          {/* Conteúdo */}
          <div className={cn('mt-8', className)}>
            {children}
          </div>
        </div>
      </div>

      {/* Lado direito - Banner */}
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-primary to-primary-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center text-white">
            <h1 className="text-4xl font-bold mb-4">
              Índice de Saúde Operacional
            </h1>
            <p className="text-xl opacity-90">
              Gerencie seus equipamentos, obras e indicadores de performance em um só lugar
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}