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
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

const formSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  equipamentoId: z.string().min(1, 'Equipamento é obrigatório'),
  operadorId: z.string().optional(),
  horasInicial: z.number().min(0, 'Horas iniciais devem ser maior ou igual a 0'),
  horasFinal: z.number().min(0, 'Horas finais devem ser maior ou igual a 0'),
  combustivelLitros: z.number().min(0).optional(),
  observacoes: z.string().optional(),
}).refine((data) => data.horasFinal > data.horasInicial, {
  message: "Horas finais devem ser maiores que horas iniciais",
  path: ["horasFinal"],
})

type FormData = z.infer<typeof formSchema>

interface ApontamentoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  frenteId: number
  frenteNome: string
  apontamento?: any
  onSuccess?: () => void
}

export function ApontamentoForm({
  open,
  onOpenChange,
  frenteId,
  frenteNome,
  apontamento,
  onSuccess
}: ApontamentoFormProps) {
  const [loading, setLoading] = useState(false)
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [operadores, setOperadores] = useState<any[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      equipamentoId: '',
      operadorId: '',
      horasInicial: 0,
      horasFinal: 0,
      combustivelLitros: 0,
      observacoes: '',
    }
  })

  const horasInicial = form.watch('horasInicial')
  const horasFinal = form.watch('horasFinal')
  const horasTrabalhadas = horasFinal - horasInicial

  useEffect(() => {
    if (open) {
      carregarEquipamentos()
      carregarOperadores()
    }
  }, [open])

  useEffect(() => {
    if (apontamento) {
      form.reset({
        data: apontamento.data.split('T')[0],
        equipamentoId: apontamento.equipamentoId.toString(),
        operadorId: apontamento.operadorId?.toString() || '',
        horasInicial: apontamento.horasInicial,
        horasFinal: apontamento.horasFinal,
        combustivelLitros: apontamento.combustivelLitros || 0,
        observacoes: apontamento.observacoes || '',
      })
    }
  }, [apontamento, form])

  const carregarEquipamentos = async () => {
    try {
      const response = await api.get('/equipamentos', {
        params: {
          empresaId: user?.empresaId,
          status: 'disponivel,em_uso',
          limit: 100
        }
      })
      setEquipamentos(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error)
    }
  }

  const carregarOperadores = async () => {
    try {
      const response = await api.get('/usuarios', {
        params: {
          empresaId: user?.empresaId,
          tipo: 'apontador,controlador',
          limit: 100
        }
      })
      setOperadores(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar operadores:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      const payload = {
        ...data,
        frenteId,
        horasTrabalhadas,
        data: new Date(data.data).toISOString(),
        equipamentoId: parseInt(data.equipamentoId),
        operadorId: data.operadorId ? parseInt(data.operadorId) : null,
      }

      if (apontamento) {
        await api.put(`/apontamentos/${apontamento.id}`, payload)
        toast({
          title: 'Sucesso',
          description: 'Apontamento atualizado com sucesso'
        })
      } else {
        await api.post('/apontamentos', payload)
        toast({
          title: 'Sucesso',
          description: 'Apontamento registrado com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar apontamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o apontamento',
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
            {apontamento ? 'Editar Apontamento' : 'Novo Apontamento'}
          </DialogTitle>
          <DialogDescription>
            Frente de Serviço: {frenteNome}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="data"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="equipamentoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipamentos.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id.toString()}>
                            {eq.nome} - {eq.tag}
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
                name="operadorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operador</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Opcional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {operadores.map((op) => (
                          <SelectItem key={op.id} value={op.id.toString()}>
                            {op.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="horasInicial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas Iniciais</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horasFinal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas Finais</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Resumo de horas */}
            {horasTrabalhadas > 0 && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm">
                  Horas trabalhadas: <span className="font-bold">{horasTrabalhadas}h</span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="combustivelLitros"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Combustível (Litros)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1"
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Opcional - quantidade de combustível abastecida/utilizada
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações sobre o apontamento..."
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
                {apontamento ? 'Atualizar' : 'Registrar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}