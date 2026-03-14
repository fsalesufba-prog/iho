import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChartNoDataProps {
  height?: number | string
  message?: string
  className?: string
}

export function ChartNoData({ 
  height = 400, 
  message = 'Não há dados disponíveis para exibir',
  className 
}: ChartNoDataProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div 
          style={{ height }} 
          className="flex flex-col items-center justify-center text-muted-foreground"
        >
          <BarChart2 className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}