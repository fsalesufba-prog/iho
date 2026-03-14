'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'

import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'

import { PrevisaoChart } from './PrevisaoChart'

import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react'

interface PrevisaoCustosProps {
  dados: Array<{ periodo: string; valor: number; previsto: number }>
  horizonte: string
}

export function PrevisaoCustos({ dados, horizonte }: PrevisaoCustosProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Dados mockados para breakdown de custos
  const breakdownCustos = [
    { categoria: 'Combustível', atual: 125000, previsto: 142000, variacao: 13.6 },
    { categoria: 'Manutenção', atual: 85000, previsto: 92000, variacao: 8.2 },
    { categoria: 'Peças', atual: 42000, previsto: 48000, variacao: 14.3 },
    { categoria: 'Mão de obra', atual: 65000, previsto: 68000, variacao: 4.6 },
    { categoria: 'Depreciação', atual: 38000, previsto: 35000, variacao: -7.9 },
  ]

  return (
    <div className="space-y-4">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Total Atual</p>
                <p className="text-2xl font-bold">{formatCurrency(355000)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Custo Previsto</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(385000)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Variação</p>
                <p className="text-2xl font-bold text-red-600">+8.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Economia Projetada</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(15000)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Previsão */}
      <Card>
        <CardHeader>
          <CardTitle>Projeção de Custos</CardTitle>
          <CardDescription>
            Comparativo entre custos atuais e previstos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <PrevisaoChart 
              dados={dados}
              tipo="linha"
              titulo="Previsão de Custos"
              unidade="currency"
            />
          </div>
        </CardContent>
      </Card>

      {/* Breakdown de Custos */}
      <Card>
        <CardHeader>
          <CardTitle>Breakdown por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {breakdownCustos.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{item.categoria}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{formatCurrency(item.atual)}</span>
                    <span className="text-sm text-muted-foreground">→</span>
                    <span className="text-sm font-bold text-orange-600">
                      {formatCurrency(item.previsto)}
                    </span>
                    <Badge variant={item.variacao > 0 ? 'destructive' : 'success'}>
                      {item.variacao > 0 ? '+' : ''}{item.variacao}%
                    </Badge>
                  </div>
                </div>
                <Progress 
                  value={(item.previsto / item.atual) * 100} 
                  className="h-2"
                  indicatorClassName={item.variacao > 0 ? 'bg-orange-500' : 'bg-green-500'}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações de Economia */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações para Redução de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-bold">Otimização de combustível:</span> Substituição de 3 equipamentos antigos pode reduzir consumo em 15%.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-bold">Manutenção preventiva:</span> Aumentar frequência de preventivas pode reduzir custos corretivos em 25%.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800">
                <span className="font-bold">Negociação de peças:</span> Contrato com novo fornecedor pode gerar economia de 10% em peças.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}