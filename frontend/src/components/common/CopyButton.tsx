'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/hooks/useToast'

interface CopyButtonProps extends ButtonProps {
  text: string
  toastMessage?: string
}

export function CopyButton({
  text,
  toastMessage = 'Copiado para a área de transferência',
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast({
        title: 'Sucesso',
        description: toastMessage
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível copiar o texto',
        variant: 'error'
      })
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn('relative', className)}
      onClick={handleCopy}
      {...props}
    >
      <Copy
        className={cn(
          'h-4 w-4 transition-all',
          copied ? 'scale-0' : 'scale-100'
        )}
      />
      <Check
        className={cn(
          'absolute h-4 w-4 text-green-600 transition-all',
          copied ? 'scale-100' : 'scale-0'
        )}
      />
    </Button>
  )
}

// CopyButton com texto - Renomeado a prop 'text' para 'copyText'
CopyButton.WithText = function CopyButtonWithText({
  copyText,
  label = 'Copiar',
  ...props
}: Omit<CopyButtonProps, 'text'> & { copyText: string; label?: string }) {
  return (
    <Button variant="outline" onClick={() => navigator.clipboard.writeText(copyText)} {...props}>
      <Copy className="h-4 w-4 mr-2" />
      {label}
    </Button>
  )
}

// CopyButton para código - Renomeado a prop 'code' para evitar conflito
CopyButton.Code = function CopyCodeButton({
  code,
  ...props
}: Omit<CopyButtonProps, 'text'> & { code: string }) {
  return (
    <CopyButton
      text={code}
      toastMessage="Código copiado!"
      variant="ghost"
      size="sm"
      className="absolute top-2 right-2"
      {...props}
    />
  )
}