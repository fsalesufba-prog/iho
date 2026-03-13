import React from 'react'
import { AlertTriangle, CheckCircle, Users, Truck, HardHat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface EmpresaLimitsProps {
  plano: {
    nome: string
    limiteAdm: number
    limiteControlador: number
    limiteApontador: number
    limiteEquipamentos: number
  }
  usos: {
    adm: number
    controlador: number
    apontador: number
    equipamentos: number
  }
  className?: string
}

export function EmpresaLimits({ plano, usos, className }: EmpresaLimitsProps) {
  const totalUsuarios = usos.adm + usos.controlador + usos.apontador
  const limiteUsuarios = plano.limiteAdm + plano.limiteControlador + plano.limiteApontador

  const getUsagePercentage = (atual: number, limite: number) => {
    return (atual / limite) * 100
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (percentage >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Limites do Plano {plano.nome}</span>
          <Badge variant="outline">
            {totalUsuarios}/{limiteUsuarios} usuários
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Usuários */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Administradores</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {usos.adm}/{plano.limiteAdm}
              </span>
              {getStatusIcon(getUsagePercentage(usos.adm, plano.limiteAdm))}
            </div>
          </div>
          <Progress 
            value={getUsagePercentage(usos.adm, plano.limiteAdm)} 
            className="h-2"
            indicatorClassName={getStatusColor(getUsagePercentage(usos.adm, plano.limiteAdm))}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardHat className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Controladores</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {usos.controlador}/{plano.limiteControlador}
              </span>
              {getStatusIcon(getUsagePercentage(usos.controlador, plano.limiteControlador))}
            </div>
          </div>
          <Progress 
            value={getUsagePercentage(usos.controlador, plano.limiteControlador)} 
            className="h-2"
            indicatorClassName={getStatusColor(getUsagePercentage(usos.controlador, plano.limiteControlador))}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardHat className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Apontadores</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {usos.apontador}/{plano.limiteApontador}
              </span>
              {getStatusIcon(getUsagePercentage(usos.apontador, plano.limiteApontador))}
            </div>
          </div>
          <Progress 
            value={getUsagePercentage(usos.apontador, plano.limiteApontador)} 
            className="h-2"
            indicatorClassName={getStatusColor(getUsagePercentage(usos.apontador, plano.limiteApontador))}
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Equipamentos</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {usos.equipamentos}/{plano.limiteEquipamentos}
              </span>
              {getStatusIcon(getUsagePercentage(usos.equipamentos, plano.limiteEquipamentos))}
            </div>
          </div>
          <Progress 
            value={getUsagePercentage(usos.equipamentos, plano.limiteEquipamentos)} 
            className="h-2"
            indicatorClassName={getStatusColor(getUsagePercentage(usos.equipamentos, plano.limiteEquipamentos))}
          />
        </div>

        {/* Alerta de limites */}
        {getUsagePercentage(totalUsuarios, limiteUsuarios) >= 90 && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-800 dark:text-red-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Limite próximo de ser atingido</p>
                <p className="text-xs mt-1">
                  Considere fazer um upgrade do plano para continuar adicionando usuários.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}