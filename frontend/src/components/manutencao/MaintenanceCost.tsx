import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface MaintenanceCostProps {
  custos: {
    total: number
    preventiva: number
    corretiva: number
    preditiva: number
    porEquipamento: Array<{
      equipamento: string
      custo: number
      percentual: number
    }>
    tendencia: number
  }
}

export function MaintenanceCost({ custos }: MaintenanceCostProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="text-2xl font-bold">{formatCurrency(custos.total)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preventiva</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(custos.preventiva)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">
                  {((custos.preventiva / custos.total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Corretiva</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(custos.corretiva)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-red-600 text-sm font-bold">
                  {((custos.corretiva / custos.total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preditiva</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(custos.preditiva)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-sm font-bold">
                  {((custos.preditiva / custos.total) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tendência */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${custos.tendencia >= 0 ? 'text-red-600' : 'text-green-600'}`}>
              {custos.tendencia >= 0 ? (
                <TrendingUp className="h-5 w-5" />
              ) : (
                <TrendingDown className="h-5 w-5" />
              )}
              <span className="text-2xl font-bold">
                {custos.tendencia >= 0 ? '+' : ''}{custos.tendencia.toFixed(1)}%
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              em relação ao período anterior
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Custos por Equipamento */}
      <Card>
        <CardHeader>
          <CardTitle>Custos por Equipamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {custos.porEquipamento.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.equipamento}</span>
                  <span className="text-sm font-bold">
                    {formatCurrency(item.custo)}
                  </span>
                </div>
                <Progress value={item.percentual} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {item.percentual.toFixed(1)}% do total
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}