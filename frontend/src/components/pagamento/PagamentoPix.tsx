'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Copy, Check, QrCode, X } from 'lucide-react'
import { useToast } from '@/components/hooks/useToast'

interface PagamentoPixProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  valor: number
  qrCode?: string
  codigoPix?: string
  expiracao?: Date
}

export function PagamentoPix({
  open,
  onOpenChange,
  valor,
  qrCode,
  codigoPix,
  expiracao
}: PagamentoPixProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const handleCopy = () => {
    if (codigoPix) {
      navigator.clipboard.writeText(codigoPix)
      setCopied(true)
      toast({
        title: 'Copiado!',
        description: 'Código PIX copiado para a área de transferência'
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const tempoRestante = () => {
    if (!expiracao) return null
    
    const agora = new Date()
    const diff = expiracao.getTime() - agora.getTime()
    const minutos = Math.floor(diff / (1000 * 60))
    const segundos = Math.floor((diff % (1000 * 60)) / 1000)
    
    return `${minutos}:${segundos.toString().padStart(2, '0')}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Pagamento via PIX</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Valor */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Valor a pagar</p>
            <p className="text-3xl font-bold text-primary">{formatCurrency(valor)}</p>
          </div>

          {/* QR Code */}
          {qrCode ? (
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={qrCode} alt="QR Code PIX" className="w-48 h-48" />
            </div>
          ) : (
            <div className="flex justify-center p-8 bg-muted rounded-lg">
              <QrCode className="h-24 w-24 text-muted-foreground" />
            </div>
          )}

          {/* Código PIX */}
          {codigoPix && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Código PIX Copia e Cola</p>
              <div className="flex gap-2">
                <Input value={codigoPix} readOnly className="font-mono text-xs" />
                <Button size="icon" variant="outline" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Instruções */}
          <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
            <p>📱 <span className="font-medium">Como pagar:</span></p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Abra o app do seu banco</li>
              <li>Escolha a opção PIX</li>
              <li>Leia o QR Code ou copie o código</li>
              <li>Confirme os dados e finalize</li>
            </ol>
          </div>

          {/* Timer de expiração */}
          {expiracao && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tempo restante</p>
              <p className="text-xl font-mono font-bold text-orange-600">
                {tempoRestante()}
              </p>
            </div>
          )}

          {/* Botão de confirmação */}
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Já realizei o pagamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}