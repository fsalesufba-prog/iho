'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { CreditCard, Calendar, Lock, Loader2 } from 'lucide-react'
import { useToast } from '@/components/hooks/useToast'

const formSchema = z.object({
  numeroCartao: z.string().min(16, 'Número do cartão inválido').max(19),
  nomeTitular: z.string().min(3, 'Nome do titular é obrigatório'),
  validade: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Data inválida (MM/AA)'),
  cvv: z.string().min(3, 'CVV inválido').max(4),
  parcelas: z.string().min(1, 'Selecione o número de parcelas'),
})

type FormData = z.infer<typeof formSchema>

interface PagamentoCartaoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  valor: number
  maxParcelas?: number
  onConfirmar: (data: FormData) => Promise<void>
}

export function PagamentoCartao({
  open,
  onOpenChange,
  valor,
  maxParcelas = 10,
  onConfirmar
}: PagamentoCartaoProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroCartao: '',
      nomeTitular: '',
      validade: '',
      cvv: '',
      parcelas: '1',
    }
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const calcularParcelas = () => {
    const parcelas = []
    for (let i = 1; i <= maxParcelas; i++) {
      const valorParcela = valor / i
      parcelas.push({
        value: i.toString(),
        label: `${i}x de ${formatCurrency(valorParcela)} ${i === 1 ? '(à vista)' : ''}`
      })
    }
    return parcelas
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      await onConfirmar(data)
      form.reset()
      onOpenChange(false)
      toast({
        title: 'Sucesso',
        description: 'Pagamento processado com sucesso'
      })
    } catch (error) {
      console.error('Erro no pagamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o pagamento',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatarNumeroCartao = (value: string) => {
    const v = value.replace(/\D/g, '')
    const matches = v.match(/\d{1,16}/g)
    if (!matches) return value
    return matches[0].replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatarValidade = (value: string) => {
    const v = value.replace(/\D/g, '')
    if (v.length <= 2) return v
    return v.replace(/(\d{2})(\d{0,2})/, '$1/$2')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pagamento com Cartão
          </DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Valor total</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(valor)}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="numeroCartao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Cartão</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="0000 0000 0000 0000"
                        className="pl-10"
                        maxLength={19}
                        {...field}
                        onChange={(e) => field.onChange(formatarNumeroCartao(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nomeTitular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Titular</FormLabel>
                  <FormControl>
                    <Input placeholder="Como no cartão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="validade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validade</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="MM/AA"
                          className="pl-10"
                          maxLength={5}
                          {...field}
                          onChange={(e) => field.onChange(formatarValidade(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="123"
                          className="pl-10"
                          maxLength={4}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parcelas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parcelas</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o número de parcelas" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {calcularParcelas().map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Pagar {formatCurrency(valor)}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {/* Selo de segurança */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Pagamento 100% seguro • Dados criptografados</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}