'use client'

import React from 'react'
import { useAuth } from '@/components/hooks/useAuth'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface DashboardWelcomeProps {
  className?: string
  onDismiss?: () => void
}

export function DashboardWelcome({ className, onDismiss }: DashboardWelcomeProps) {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const getMessage = () => {
    switch (user?.tipo) {
      case 'adm_sistema':
        return 'Aqui você pode gerenciar todas as empresas, usuários e configurações do sistema.'
      case 'adm_empresa':
        return 'Acompanhe o desempenho da sua empresa, gerencie obras e equipes.'
      case 'controlador':
        return 'Monitore as operações, equipamentos e indicadores em tempo real.'
      case 'apontador':
        return 'Registre suas atividades e acompanhe o progresso das frentes de serviço.'
      default:
        return 'Bem-vindo ao painel do IHO.'
    }
  }

  return (
    <Card className={cn('bg-gradient-to-r from-primary/10 via-primary/5 to-background', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              {getGreeting()}, {user?.nome?.split(' ')[0]}!
            </h2>
            <p className="text-muted-foreground max-w-2xl">
              {getMessage()}
            </p>
            <div className="flex gap-2 pt-2">
              <Button size="sm">
                Iniciar tour
              </Button>
              <Button size="sm" variant="outline">
                Ver novidades
              </Button>
            </div>
          </div>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="text-muted-foreground"
            >
              Dispensar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}