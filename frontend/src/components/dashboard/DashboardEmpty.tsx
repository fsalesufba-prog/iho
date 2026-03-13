import React from 'react'
import { Inbox, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface DashboardEmptyProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function DashboardEmpty({
  title = 'Nenhum dado encontrado',
  description = 'Não há dados disponíveis para exibir no momento.',
  icon = <Inbox className="h-12 w-12" />,
  action,
  className
}: DashboardEmptyProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center',
      className
    )}>
      <div className="text-muted-foreground mb-4">
        {icon}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        {description}
      </p>
      
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="h-4 w-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  )
}