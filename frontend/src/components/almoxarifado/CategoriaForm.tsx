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
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface CategoriaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoria?: any
  onSuccess?: () => void
}

export function CategoriaForm({ open, onOpenChange, categoria, onSuccess }: CategoriaFormProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: categoria?.nome || '',
      descricao: categoria?.descricao || '',
    }
  })

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      
      if (categoria) {
        await api.put(`/almoxarifado/categorias/${categoria.id}`, data)
        toast({
          title: 'Sucesso',
          description: 'Categoria atualizada com sucesso'
        })
      } else {
        await api.post('/almoxarifado/categorias', data)
        toast({
          title: 'Sucesso',
          description: 'Categoria criada com sucesso'
        })
      }
      
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a categoria',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {categoria ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {categoria 
              ? 'Edite as informações da categoria'
              : 'Adicione uma nova categoria para organizar os itens'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Ferramentas" {...field} />
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
                      placeholder="Descrição da categoria..."
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
                {categoria ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}