'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Download, Printer, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MedicaoPreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: {
    titulo: string
    obra?: string
    periodoInicio?: string
    periodoFim?: string
    itens: Array<{
      descricao: string
      unidade: string
      quantidade: number
      valorUnitario: number
    }>
    valorTotal: number
  }
}

export function MedicaoPreview({ open, onOpenChange, data }: MedicaoPreviewProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pré-visualização da Medição</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6 bg-white rounded-lg">
          {/* Cabeçalho */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-primary">MEDIÇÃO DE OBRA</h1>
            <p className="text-sm text-muted-foreground">Sistema IHO - Índice de Saúde Operacional</p>
          </div>

          {/* Título e Informações */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{data.titulo}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Obra:</span> {data.obra || 'Não informada'}
              </div>
              <div>
                <span className="font-medium">Período:</span>{' '}
                {data.periodoInicio && data.periodoFim ? (
                  `${format(new Date(data.periodoInicio), "dd/MM/yyyy")} a ${format(new Date(data.periodoFim), "dd/MM/yyyy")}`
                ) : (
                  'Não informado'
                )}
              </div>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div>
            <h3 className="font-medium mb-2">Itens da Medição</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Unid.</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                  <TableHead className="text-right">Valor Unit.</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.itens.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{item.unidade}</TableCell>
                    <TableCell className="text-right">{item.quantidade}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.valorUnitario)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.quantidade * item.valorUnitario)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={4} className="text-right">VALOR TOTAL</TableCell>
                  <TableCell className="text-right text-primary">
                    {formatCurrency(data.valorTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Extenso */}
          <div className="text-sm">
            <span className="font-medium">Valor por extenso:</span>{' '}
            <span className="text-muted-foreground">
              {/* Implementar função de valor por extenso */}
            </span>
          </div>

          {/* Rodapé */}
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="text-center">
                <div className="border-t border-dashed pt-2 mt-8">
                  <p>Responsável pela medição</p>
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-dashed pt-2 mt-8">
                  <p>Cliente / Contratante</p>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              Documento gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}