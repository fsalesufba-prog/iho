'use client'

import React, { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
<<<<<<< HEAD

=======
import { RefreshCw } from 'lucide-react'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
const formSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  estoqueMinimo: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  estoqueMaximo: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  valorUnitario: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  localizacao: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EstoqueFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: any
  onSuccess?: () => void
}

export function EstoqueForm({ open, onOpenChange, item, onSuccess }: EstoqueFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      descricao: '',
      categoria: '',
      unidade: 'un',
      estoqueMinimo: 0,
      estoqueMaximo: 0,
      valorUnitario: 0,
      localizacao: '',
    }
  })

  useEffect(() => {
    if (item) {
      form.reset({
        codigo: item.codigo,
        nome: item.nome,
        descricao: item.descricao || '',
        categoria: item.categoria,
        unidade: item.unidade,
        estoqueMinimo: item.estoqueMinimo,
        estoqueMaximo: item.estoqueMaximo,
        valorUnitario: item.valorUnitario,
        localizacao: item.localizacao || '',
      })
    } else {
      form.reset()
    }
  }, [item, form])

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      
      if (item) {
        await api.put(`/almoxarifado/estoque/${item.id}`, data)
        toast({
          title: 'Sucesso',
          description: 'Item atualizado com sucesso'
        })
      } else {
        await api.post('/almoxarifado/estoque', data)
        toast({
          title: 'Sucesso',
          description: 'Item criado com sucesso'
        })
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar item:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o item',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Item' : 'Novo Item'}
          </DialogTitle>
          <DialogDescription>
            {item 
              ? 'Edite as informações do item no estoque'
              : 'Adicione um novo item ao estoque'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: FERR-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ferramentas">Ferramentas</SelectItem>
                        <SelectItem value="pecas">Peças</SelectItem>
                        <SelectItem value="insumos">Insumos</SelectItem>
                        <SelectItem value="equipamentos">Equipamentos</SelectItem>
                        <SelectItem value="epi">EPI</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Item</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Martelo Penha 25mm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição detalhada do item..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="un">Unidade (un)</SelectItem>
                        <SelectItem value="kg">Quilograma (kg)</SelectItem>
                        <SelectItem value="l">Litro (L)</SelectItem>
                        <SelectItem value="m">Metro (m)</SelectItem>
                        <SelectItem value="cx">Caixa (cx)</SelectItem>
                        <SelectItem value="pc">Peça (pc)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estoqueMinimo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
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
                name="estoqueMaximo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Máximo</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="localizacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Prateleira A1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {item ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}