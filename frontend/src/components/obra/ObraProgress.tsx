import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'

interface ObraProgressProps {
  progresso: number
  dataInicio?: string
  dataPrevisao?: string
  dataTermino?: string
  status: string
  className?: string
}

export function ObraProgress({
  progresso,
  dataInicio,
  dataPrevisao,
  dataTermino,
  status,
  className
}: ObraProgressProps) {
  const calcularDiasRestantes = () => {
    if (!dataPrevisao || status === 'concluida' || status === 'cancelada') return null
    
    const hoje = new Date()
    const previsao = new Date(dataPrevisao)
    const diffTime = previsao.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const diasRestantes = calcularDiasRestantes()
  const isAtrasada = diasRestantes !== null && diasRestantes < 0

  const getProgressColor = () => {
    if (status === 'concluida') return 'bg-green-500'
    if (status === 'cancelada') return 'bg-gray-500'
    if (isAtrasada) return 'bg-red-500'
    if (progresso >= 75) return 'bg-green-500'
    if (progresso >= 50) return 'bg-blue-500'
    if (progresso >= 25) return 'bg-yellow-500'
    return 'bg-orange-500'
  }

  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progresso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso da Obra</span>
              <span className="text-lg font-bold">{progresso}%</span>
            </div>
            <Progress 
              value={progresso} 
              className="h-3"
              indicatorClassName={getProgressColor()}
            />
          </div>

          {/* Status e Prazos */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {dataInicio && (
              <div>
                <p className="text-xs text-muted-foreground">Início</p>
                <p className="text-sm font-medium">
                  {new Date(dataInicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {dataPrevisao && status !== 'concluida' && status !== 'cancelada' && (
              <div>
                <p className="text-xs text-muted-foreground">Previsão</p>
                <p className="text-sm font-medium">
                  {new Date(dataPrevisao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}

            {dataTermino && (
              <div>
                <p className="text-xs text-muted-foreground">Término</p>
                <p className="text-sm font-medium">
                  {new Date(dataTermino).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          {/* Alerta de atraso */}
          {isAtrasada && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Atrasada em {Math.abs(diasRestantes)} dias
              </span>
            </div>
          )}

          {/* Dias restantes */}
          {diasRestantes !== null && diasRestantes >= 0 && (
            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {diasRestantes} dias restantes
              </span>
            </div>
          )}

          {/* Concluída */}
          {status === 'concluida' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Obra concluída</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}