import { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/common/Logo'

export const metadata: Metadata = {
  title: {
    template: '%s | IHO',
    default: 'Autenticação',
  },
  description: 'Acesse o sistema IHO - Índice de Saúde Operacional',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 flex justify-center">
            <Logo href="/" size="lg" />
          </div>

          {/* Conteúdo */}
          {children}

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} IHO - Índice de Saúde Operacional.
              <br />
              Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>

      {/* Lado direito - Banner */}
      <div className="hidden lg:flex relative flex-1 bg-gradient-to-br from-primary-600 to-primary-800 overflow-hidden flex-col items-center justify-center">
        <div className="absolute inset-0 bg-black/20" />

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="auth-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#auth-pattern)" />
          </svg>
        </div>

        {/* Conteúdo do banner */}
        <div className="relative z-10 max-w-lg text-center text-white p-12">
          {/* Logo no painel direito */}
          <div className="mb-8 flex justify-center">
            <Logo variant="light" size="xl" href="/" />
          </div>

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

        {/* Elementos flutuantes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
    </div>
  )
}
