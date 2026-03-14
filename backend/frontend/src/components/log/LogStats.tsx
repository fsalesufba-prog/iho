import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { Badge } from '@/components/ui/Badge'
import {
  Users,
  FileText,
  AlertTriangle,
  Clock,
  Calendar,
} from 'lucide-react'

interface LogStatsProps {
  data: {
    total: number
    hoje: number
    ultimaHora: number
    usuariosAtivos: number
    acoesCriticas: number
    entidadesMaisAcessadas: Array<{ entidade: string; count: number }>
    usuariosMaisAtivos: Array<{ usuario: string; count: number }>
  }
}

export function LogStats({ data }: LogStatsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Usuários Mais Ativos */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários Mais Ativos
          </h3>
          <div className="space-y-4">
            {data.usuariosMaisAtivos.map((item, index) => {
              const percentage = (item.count / data.usuariosMaisAtivos[0].count) * 100
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.usuario}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.count} logs</Badge>
                      <span className="text-xs text-muted-foreground">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Entidades Mais Acessadas */}
      <Card>
        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Entidades Mais Acessadas
          </h3>
          <div className="space-y-4">
            {data.entidadesMaisAcessadas.map((item, index) => {
              const percentage = (item.count / data.entidadesMaisAcessadas[0].count) * 100
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium capitalize">{item.entidade}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.count} acessos</Badge>
                      <span className="text-xs text-muted-foreground">
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Resumo por Período */}
      <Card className="lg:col-span-2">
        <CardContent className="pt-4">
          <h3 className="text-lg font-semibold mb-4">Resumo por Período</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{data.hoje}</p>
              <p className="text-sm text-muted-foreground">Hoje</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{data.ultimaHora}</p>
              <p className="text-sm text-muted-foreground">Última Hora</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-red-600">{data.acoesCriticas}</p>
              <p className="text-sm text-muted-foreground">Ações Críticas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}