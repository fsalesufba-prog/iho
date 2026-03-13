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
import { Textarea } from '@/components/ui/Textarea'
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
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  obraId: z.string().min(1, 'Obra é obrigatória'),
  status: z.enum(['ativa', 'inativa', 'concluida']).default('ativa'),
})

type FormData = z.infer<typeof formSchema>

interface FrenteServicoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  frente?: any
  onSuccess?: () => void
}

export function FrenteServicoForm({ open, onOpenChange, frente, onSuccess }: FrenteServicoFormProps) {
  const [loading, setLoading] = useState(false)
  const [obras, setObras] = useState<any[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      obraId: '',
      status: 'ativa',
    }
  })

  useEffect(() => {
    if (user?.empresaId) {
      carregarObras()
    }
  }, [user?.empresaId])

  useEffect(() => {
    if (frente) {
      form.reset({
        nome: frente.nome,
        descricao: frente.descricao || '',
        obraId: frente.obraId.toString(),
        status: frente.status,
      })
    } else {
      form.reset({
        nome: '',
        descricao: '',
        obraId: '',
        status: 'ativa',
      })
    }
  }, [frente, form])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { 
          empresaId: user?.empresaId,
          limit: 100 
        }
      })
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
        obraId: parseInt(data.obraId),
        empresaId: user?.empresaId,
      }

      if (frente) {
        await api.put(`/frentes-servico/${frente.id}`, payload)
        toast({
          title: 'Sucesso',
          description: 'Frente de serviço atualizada com sucesso'
        })
      } else {
        await api.post('/frentes-servico', payload)
        toast({
          title: 'Sucesso',
          description: 'Frente de serviço criada com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar frente de serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a frente de serviço',
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
            {frente ? 'Editar Frente de Serviço' : 'Nova Frente de Serviço'}
          </DialogTitle>
          <DialogDescription>
            {frente 
              ? 'Edite as informações da frente de serviço'
              : 'Adicione uma nova frente de serviço'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="obraId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Obra</FormLabel>
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

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Frente</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Terraplenagem" {...field} />
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
                      placeholder="Descrição detalhada da frente de serviço..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativa">Ativa</SelectItem>
                      <SelectItem value="inativa">Inativa</SelectItem>
                      <SelectItem value="concluida">Concluída</SelectItem>
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
                {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                {frente ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}