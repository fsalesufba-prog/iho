import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PrevisaoTabelaProps {
  dados: Array<{ periodo: string; valor: number; previsto?: number }>
}

export function PrevisaoTabela({ dados }: PrevisaoTabelaProps) {
  const formatValue = (value: number, tipo: 'valor' | 'variacao' = 'valor') => {
    if (tipo === 'variacao') {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
    }
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Período</TableHead>
          <TableHead className="text-right">Histórico</TableHead>
          <TableHead className="text-right">Previsto</TableHead>
          <TableHead className="text-right">Variação</TableHead>
          <TableHead className="text-right">Tendência</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dados.map((item, index) => {
          const variacao = item.previsto 
            ? ((item.previsto - item.valor) / item.valor) * 100 
            : 0

          return (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.periodo}</TableCell>
              <TableCell className="text-right">{formatValue(item.valor)}</TableCell>
              <TableCell className="text-right font-bold text-primary">
                {item.previsto ? formatValue(item.previsto) : '-'}
              </TableCell>
              <TableCell className="text-right">
                {item.previsto && (
                  <Badge variant={variacao > 0 ? 'destructive' : 'success'}>
                    {formatValue(variacao, 'variacao')}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                {item.previsto && (
                  variacao > 0 ? (
                    <TrendingUp className="h-4 w-4 text-red-600 inline" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-600 inline" />
                  )
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}