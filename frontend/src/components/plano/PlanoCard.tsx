import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlanoCardProps {
  plano: {
    id: number
    nome: string
    descricao: string
    valorImplantacao: number
    valorMensal: number
    limiteAdm: number
    limiteControlador: number
    limiteApontador: number
    limiteEquipamentos: number
    recursos: string[]
  }
  destacado?: boolean
  onContratar?: () => void
  onSaibaMais?: () => void
  className?: string
}

export function PlanoCard({
  plano,
  destacado = false,
  onContratar,
  onSaibaMais,
  className
}: PlanoCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <Card className={cn(
      'relative flex flex-col h-full transition-all hover:shadow-lg',
      destacado && 'border-primary shadow-lg scale-105',
      className
    )}>
      {destacado && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Mais Popular
        </Badge>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plano.nome}</CardTitle>
        <CardDescription>{plano.descricao}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Preços */}
        <div className="space-y-2">
          <div>
            <p className="text-sm text-muted-foreground">Implantação</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(plano.valorImplantacao)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mensalidade</p>
            <p className="text-3xl font-bold text-primary">
              {formatCurrency(plano.valorMensal)}
              <span className="text-sm font-normal text-muted-foreground ml-2">/mês</span>
            </p>
          </div>
        </div>

        {/* Limites */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Limites</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Admins:</span>{' '}
              <span className="font-medium">{plano.limiteAdm}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Controladores:</span>{' '}
              <span className="font-medium">{plano.limiteControlador}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Apontadores:</span>{' '}
              <span className="font-medium">{plano.limiteApontador}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Equipamentos:</span>{' '}
              <span className="font-medium">{plano.limiteEquipamentos}</span>
            </div>
          </div>
        </div>

        {/* Recursos */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Recursos</p>
          <div className="space-y-1">
            {plano.recursos.map((recurso, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{recurso}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onSaibaMais}
        >
          Saiba mais
        </Button>
        <Button
          className="flex-1"
          variant={destacado ? 'default' : 'outline'}
          onClick={onContratar}
        >
          Contratar
        </Button>
      </CardFooter>
    </Card>
  )
}