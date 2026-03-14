'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Download, Printer, X } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PagamentoComprovanteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pagamento: any
}

export function PagamentoComprovante({ open, onOpenChange, pagamento }: PagamentoComprovanteProps) {
  const [baixando, setBaixando] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleDownload = async () => {
    setBaixando(true)
    // Implementar download do comprovante
    setTimeout(() => setBaixando(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Comprovante de Pagamento</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-6 bg-white rounded-lg">
          {/* Cabeçalho */}
          <div className="text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-primary">COMPROVANTE DE PAGAMENTO</h1>
            <p className="text-sm text-muted-foreground">IHO - Índice de Saúde Operacional</p>
          </div>

          {/* Informações do Pagamento */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">ID do Pagamento:</span>
              <span className="text-sm font-medium">#{pagamento.id}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Empresa:</span>
              <span className="text-sm font-medium">{pagamento.empresa?.nome}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Tipo:</span>
              <span className="text-sm font-medium">
                {pagamento.tipo === 'implantacao' ? 'Taxa de Implantação' : 'Mensalidade'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Data do Pagamento:</span>
              <span className="text-sm font-medium">
                {pagamento.dataPagamento 
                  ? format(new Date(pagamento.dataPagamento), "dd/MM/yyyy 'às' HH:mm")
                  : '-'
                }
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Forma de Pagamento:</span>
              <span className="text-sm font-medium capitalize">
                {pagamento.formaPagamento || 'Não informado'}
              </span>
            </div>

            <div className="flex justify-between border-t pt-3">
              <span className="text-base font-bold">Valor Pago:</span>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(pagamento.valor)}
              </span>
            </div>

            {pagamento.transacaoId && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ID da Transação:</span>
                <span className="text-sm font-mono">{pagamento.transacaoId}</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-green-600 font-medium">✓ Pagamento confirmado</p>
          </div>

          {/* Rodapé */}
          <div className="border-t pt-4 text-center text-xs text-muted-foreground">
            <p>Este comprovante é válido como prova de pagamento.</p>
            <p className="mt-1">
              Emitido em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={handleDownload} disabled={baixando}>
            <Download className="h-4 w-4 mr-2" />
            {baixando ? 'Baixando...' : 'Baixar PDF'}
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