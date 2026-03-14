'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

const formSchema = z.object({
  tipo: z.enum(['entrada', 'saida', 'ajuste']),
  quantidade: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
  valorUnitario: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  observacao: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EstoqueMovimentoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: any
  onSuccess?: () => void
}

export function EstoqueMovimentoForm({ 
  open, 
  onOpenChange, 
  item,
  onSuccess 
}: EstoqueMovimentoFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: 'entrada',
      quantidade: 0,
      valorUnitario: item?.valorUnitario || 0,
      observacao: '',
    }
  })

  const tipo = form.watch('tipo')
  const quantidade = form.watch('quantidade')
  const valorUnitario = form.watch('valorUnitario')

  const valorTotal = quantidade * valorUnitario

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      
      await api.post(`/almoxarifado/estoque/${item.id}/movimentos`, {
        ...data,
        itemId: item.id
      })

      toast({
        title: 'Sucesso',
        description: 'Movimentação registrada com sucesso'
      })

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a movimentação',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Movimentação</DialogTitle>
          <DialogDescription>
            Item: {item?.nome} ({item?.codigo})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Movimentação</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="saida">Saída</SelectItem>
                      <SelectItem value="ajuste">Ajuste de Estoque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantidade</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valorUnitario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor Unitário (R$)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Resumo */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Estoque atual:</span>
                <span className="font-medium">
                  {item?.estoqueAtual} {item?.unidade}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Quantidade:</span>
                <span className={`font-medium ${
                  tipo === 'entrada' ? 'text-green-600' :
                  tipo === 'saida' ? 'text-red-600' : ''
                }`}>
                  {tipo === 'entrada' ? '+' : tipo === 'saida' ? '-' : ''}
                  {quantidade} {item?.unidade}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Novo estoque:</span>
                <span className="font-medium">
                  {tipo === 'entrada' 
                    ? item?.estoqueAtual + quantidade
                    : tipo === 'saida'
                      ? item?.estoqueAtual - quantidade
                      : quantidade
                  } {item?.unidade}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <span>Valor total:</span>
                <span>
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL' 
                  }).format(valorTotal)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="observacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Motivo da movimentação, destino, etc..."
                      {...field}
                    />
                  </FormControl>
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
                {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}