import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'

interface IhoCardProps {
  titulo: string
  valor: number
  unidade?: string
  meta?: number
  variacao?: number
  cor?: string
  icone?: React.ReactNode
  className?: string
  onClick?: () => void
}

export function IhoCard({
  titulo,
  valor,
  unidade = '%',
  meta,
  variacao,
  cor = '#3b82f6',
  icone,
  className,
  onClick
}: IhoCardProps) {
  const getVariacaoIcon = () => {
    if (!variacao) return null
    if (variacao > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (variacao < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getStatusColor = () => {
    if (!meta) return 'text-foreground'
    if (valor >= meta) return 'text-green-600'
    if (valor >= meta * 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-md',
        onClick && 'cursor-pointer hover:scale-105',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
          {icone && <div className="text-muted-foreground">{icone}</div>}
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className={cn('text-3xl font-bold', getStatusColor())}>
              {valor.toFixed(1)}{unidade}
            </p>
            {meta && (
              <p className="text-xs text-muted-foreground mt-1">
                Meta: {meta.toFixed(1)}{unidade}
              </p>
            )}
          </div>

          {variacao !== undefined && (
            <div className="flex items-center gap-1">
              {getVariacaoIcon()}
              <span className={cn(
                'text-sm',
                variacao > 0 ? 'text-green-600' : variacao < 0 ? 'text-red-600' : 'text-gray-400'
              )}>
                {variacao > 0 ? '+' : ''}{variacao.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {meta && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Progresso</span>
              <span>{((valor / meta) * 100).toFixed(0)}%</span>
            </div>
            <Progress 
              value={(valor / meta) * 100} 
              className="h-2"
              indicatorClassName={
                valor >= meta ? 'bg-green-500' :
                valor >= meta * 0.7 ? 'bg-yellow-500' :
                'bg-red-500'
              }
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}