import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartErrorProps {
  height?: number | string
  message?: string
  className?: string
  onRetry?: () => void
}

export function ChartError({ 
  height = 400, 
  message = 'Erro ao carregar o gráfico',
  className,
  onRetry
}: ChartErrorProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div 
          style={{ height }} 
          className="flex flex-col items-center justify-center text-destructive"
        >
          <AlertCircle className="h-12 w-12 mb-4" />
          <p className="text-sm mb-2">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-primary hover:underline"
            >
              Tentar novamente
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}