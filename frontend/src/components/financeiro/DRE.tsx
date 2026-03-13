'use client'

import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

import { cn } from '@/lib/utils'

interface DREItem {
  id: string
  descricao: string
  valor: number
  percentual: number
  variacao?: number
  children?: DREItem[]
}

interface DREProps {
  data: DREItem[]
  title?: string
  showPercentual?: boolean
  showVariacao?: boolean
  comparativo?: 'periodoAnterior' | 'orcado'
}

export function DRE({
  data,
  title = 'Demonstração do Resultado do Exercício',
  showPercentual = true,
  showVariacao = true,
  comparativo = 'periodoAnterior'
}: DREProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(data.map(item => item.id)))

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getValueColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return ''
  }

  const getVariacaoIcon = (variacao?: number) => {
    if (!variacao) return null
    if (variacao > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (variacao < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const renderItem = (item: DREItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const isTotal = item.id.includes('total') || item.id.includes('lucro')

    return (
      <React.Fragment key={item.id}>
        <tr className={cn(
          'border-b transition-colors hover:bg-muted/50',
          isTotal && 'bg-muted/30 font-semibold'
        )}>
          <td className="py-3 px-4">
            <div style={{ paddingLeft: `${level * 24}px` }} className="flex items-center">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 mr-1"
                  onClick={() => toggleItem(item.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <span className={isTotal ? 'font-bold' : ''}>{item.descricao}</span>
            </div>
          </td>
          <td className={cn('py-3 px-4 text-right font-medium', getValueColor(item.valor))}>
            {formatCurrency(item.valor)}
          </td>
          {showPercentual && (
            <td className="py-3 px-4 text-right text-muted-foreground">
              {item.percentual.toFixed(1)}%
            </td>
          )}
          {showVariacao && (
            <td className="py-3 px-4 text-right">
              {item.variacao !== undefined && (
                <div className="flex items-center justify-end gap-1">
                  {getVariacaoIcon(item.variacao)}
                  <span className={cn(
                    item.variacao > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {item.variacao > 0 ? '+' : ''}{item.variacao}%
                  </span>
                </div>
              )}
            </td>
          )}
        </tr>
        {hasChildren && isExpanded && (
          <>
            {item.children!.map(child => renderItem(child, level + 1))}
          </>
        )}
      </React.Fragment>
    )
  }

  const calcularTotal = () => {
    return data.reduce((acc, item) => acc + item.valor, 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="py-3 px-4 text-left font-medium">Descrição</th>
                <th className="py-3 px-4 text-right font-medium">Valor</th>
                {showPercentual && (
                  <th className="py-3 px-4 text-right font-medium">%</th>
                )}
                {showVariacao && (
                  <th className="py-3 px-4 text-right font-medium">Variação</th>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map(item => renderItem(item))}
              <tr className="border-t-2 font-bold bg-muted/30">
                <td className="py-4 px-4">Resultado do Período</td>
                <td className={cn('py-4 px-4 text-right', getValueColor(calcularTotal()))}>
                  {formatCurrency(calcularTotal())}
                </td>
                {showPercentual && <td className="py-4 px-4 text-right">100%</td>}
                {showVariacao && <td className="py-4 px-4 text-right" />}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumo de indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Margem Bruta</p>
            <p className="text-2xl font-bold text-green-600">45.2%</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Margem EBITDA</p>
            <p className="text-2xl font-bold text-blue-600">28.7%</p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Margem Líquida</p>
            <p className="text-2xl font-bold text-purple-600">18.3%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}