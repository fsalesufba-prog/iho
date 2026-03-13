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
  FormDescription,
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
import { Switch } from '@/components/ui/Switch'
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  obraId: z.string().optional(),
  contato: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  status: z.boolean().default(true),
})

type FormData = z.infer<typeof formSchema>

interface CentroCustoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  centro?: any
  onSuccess?: () => void
}

export function CentroCustoForm({ open, onOpenChange, centro, onSuccess }: CentroCustoFormProps) {
  const [loading, setLoading] = useState(false)
  const [obras, setObras] = useState<any[]>([])
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      obraId: '',
      contato: '',
      telefone: '',
      email: '',
      status: true,
    }
  })

  useEffect(() => {
    carregarObras()
  }, [])

  useEffect(() => {
    if (centro) {
      form.reset({
        nome: centro.nome,
        codigo: centro.codigo,
        obraId: centro.obraId?.toString() || '',
        contato: centro.contato || '',
        telefone: centro.telefone || '',
        email: centro.email || '',
        status: centro.status === 'ativo',
      })
    } else {
      form.reset({
        nome: '',
        codigo: '',
        obraId: '',
        contato: '',
        telefone: '',
        email: '',
        status: true,
      })
    }
  }, [centro, form])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', { params: { limit: 100 } })
      setObras(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      const payload = {
        ...data,
        obraId: data.obraId ? parseInt(data.obraId) : null,
        status: data.status ? 'ativo' : 'inativo',
      }

      if (centro) {
        await api.put(`/centros-custo/${centro.id}`, payload)
        toast({
          title: 'Sucesso',
          description: 'Centro de custo atualizado com sucesso'
        })
      } else {
        await api.post('/centros-custo', payload)
        toast({
          title: 'Sucesso',
          description: 'Centro de custo criado com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar centro de custo:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o centro de custo',
        variant: 'destructive'
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
            {centro ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
          </DialogTitle>
          <DialogDescription>
            {centro 
              ? 'Edite as informações do centro de custo'
              : 'Adicione um novo centro de custo ao sistema'
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
                      <Input placeholder="Ex: CC-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="obraId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Obra (opcional)</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma obra" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhuma</SelectItem>
                        {obras.map((obra) => (
                          <SelectItem key={obra.id} value={obra.id.toString()}>
                            {obra.nome}
                          </SelectItem>
                        ))}
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
                  <FormLabel>Nome do Centro de Custo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Construtora ABC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contato"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da pessoa de contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="contato@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status</FormLabel>
                    <FormDescription>
                      {field.value ? 'Centro de custo ativo' : 'Centro de custo inativo'}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                {centro ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}