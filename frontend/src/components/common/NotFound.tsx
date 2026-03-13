import React from 'react'
import Link from 'next/link'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface NotFoundProps {
  title?: string
  description?: string
  showHome?: boolean
  showBack?: boolean
  className?: string
  onBack?: () => void
}

export function NotFound({
  title = 'Página não encontrada',
  description = 'A página que você está procurando não existe ou foi movida.',
  showHome = true,
  showBack = true,
  className,
  onBack
}: NotFoundProps) {
  return (
    <div className={cn(
      'min-h-[400px] flex flex-col items-center justify-center text-center p-8',
      className
    )}>
      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <FileQuestion className="h-12 w-12 text-primary" />
      </div>

      <h1 className="text-4xl font-bold mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <p className="text-muted-foreground max-w-md mb-8">{description}</p>

      <div className="flex items-center gap-4">
        {showBack && (
          <Button
            variant="outline"
            onClick={onBack || (() => window.history.back())}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        )}

        {showHome && (
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Ir para início
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

// NotFound para recursos
NotFound.Resource = function ResourceNotFound({
  resourceName = 'recurso',
  ...props
}: NotFoundProps & { resourceName?: string }) {
  return (
    <NotFound
      title={`${resourceName} não encontrado`}
      description={`O ${resourceName} que você está procurando não existe ou foi removido.`}
      {...props}
    />
  )
}

// NotFound para acesso negado
NotFound.Forbidden = function Forbidden(props: NotFoundProps) {
  return (
    <NotFound
      title="Acesso negado"
      description="Você não tem permissão para acessar esta página."
      {...props}
    />
  )
}

// NotFound para manutenção
NotFound.Maintenance = function Maintenance(props: NotFoundProps) {
  return (
    <NotFound
      title="Em manutenção"
      description="Estamos trabalhando para melhorar sua experiência. Volte em breve!"
      showBack={false}
      {...props}
    />
  )
}