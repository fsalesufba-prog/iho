import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <Image
                src="/logo-dark.svg"
                alt="IHO"
                width={180}
                height={48}
                className="mx-auto dark:hidden"
                priority
              />
              <Image
                src="/logo-light.svg"
                alt="IHO"
                width={180}
                height={48}
                className="mx-auto hidden dark:block"
                priority
              />
            </Link>
            {title && (
              <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Conteúdo */}
          {children}
        </div>
      </div>

      {/* Lado direito - Banner */}
      <div className="hidden lg:block relative flex-1 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-center text-white">
            <h1 className="text-4xl font-bold mb-4">
              Índice de Saúde Operacional
            </h1>
            <p className="text-xl opacity-90 mb-8">
              Gerencie seus equipamentos, obras e indicadores de performance em um só lugar
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm opacity-80">Controle total</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm opacity-80">Monitoramento</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">+50</div>
                <div className="text-sm opacity-80">Indicadores</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold">10x</div>
                <div className="text-sm opacity-80">Mais eficiência</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}