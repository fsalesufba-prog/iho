'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Copy, Check, Barcode, Download, X } from 'lucide-react'
import { useToast } from '@/components/hooks/useToast'
import { format } from 'date-fns'

interface PagamentoBoletoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  valor: number
  linhaDigitavel: string
  codigoBarras?: string
  urlBoleto?: string
  dataVencimento: Date
}

export function PagamentoBoleto({
  open,
  onOpenChange,
  valor,
  linhaDigitavel,
  codigoBarras,
  urlBoleto,
  dataVencimento
}: PagamentoBoletoProps) {
  const [copied, setCopied] = React.useState(false)
  const { toast } = useToast()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(linhaDigitavel)
    setCopied(true)
    toast({
      title: 'Copiado!',
      description: 'Linha digitável copiada para a área de transferência'
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Boleto Bancário</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Valor */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valor do boleto</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(valor)}</p>
          </div>

          {/* Data de Vencimento */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Data de vencimento</p>
            <p className="text-xl font-semibold">
              {format(dataVencimento, "dd/MM/yyyy")}
            </p>
          </div>

          {/* Código de Barras */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-center mb-4">
              <Barcode className="h-12 w-12 text-muted-foreground" />
            </div>

            {/* Linha Digitável */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Linha digitável</p>
              <div className="flex gap-2">
                <Input 
                  value={linhaDigitavel} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Código de Barras (opcional) */}
            {codigoBarras && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Código de barras</p>
                <p className="font-mono text-sm bg-background p-2 rounded">
                  {codigoBarras}
                </p>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p>🏦 <span className="font-medium">Como pagar:</span></p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Copie a linha digitável</li>
              <li>Pague no app do seu banco</li>
              <li>Ou utilize o código de barras no caixa eletrônico</li>
              <li>O boleto vence em {format(dataVencimento, "dd/MM/yyyy")}</li>
            </ol>
          </div>

          {/* Aviso */}
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ O pagamento pode levar até 3 dias úteis para ser confirmado.
            </p>
          </div>

          {/* Botões de ação */}
          <div className="grid grid-cols-2 gap-2">
            {urlBoleto && (
              <Button variant="outline" onClick={() => window.open(urlBoleto, '_blank')}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Boleto
              </Button>
            )}
            <Button className="w-full" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}