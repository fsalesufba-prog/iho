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

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { RefreshCw, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

const formSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valorImplantacao: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  valorMensal: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  limiteAdm: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
  limiteControlador: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
  limiteApontador: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
  limiteEquipamentos: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
})

type FormData = z.infer<typeof formSchema>

interface PlanoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plano?: any
  onSuccess?: () => void
}

export function PlanoForm({ open, onOpenChange, plano, onSuccess }: PlanoFormProps) {
  const [loading, setLoading] = useState(false)
  const [recursos, setRecursos] = useState<string[]>([])
  const [novoRecurso, setNovoRecurso] = useState('')
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      valorImplantacao: 0,
      valorMensal: 0,
      limiteAdm: 0,
      limiteControlador: 0,
      limiteApontador: 0,
      limiteEquipamentos: 0,
      status: 'ativo',
    }
  })

  React.useEffect(() => {
    if (plano) {
      form.reset({
        nome: plano.nome,
        descricao: plano.descricao,
        valorImplantacao: plano.valorImplantacao,
        valorMensal: plano.valorMensal,
        limiteAdm: plano.limiteAdm,
        limiteControlador: plano.limiteControlador,
        limiteApontador: plano.limiteApontador,
        limiteEquipamentos: plano.limiteEquipamentos,
        status: plano.status,
      })
      if (plano.recursos) {
        setRecursos(JSON.parse(plano.recursos))
      }
    } else {
      // Recursos padrão
      setRecursos([
        'Dashboard completo',
        'Gestão de obras',
        'Gestão de equipamentos',
        'Manutenção preventiva',
        'Indicadores básicos'
      ])
    }
  }, [plano, form])

  const adicionarRecurso = () => {
    if (novoRecurso.trim()) {
      setRecursos([...recursos, novoRecurso.trim()])
      setNovoRecurso('')
    }
  }

  const removerRecurso = (index: number) => {
    setRecursos(recursos.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      const payload = {
        ...data,
        recursos: JSON.stringify(recursos),
      }

      if (plano) {
        await api.put(`/planos/${plano.id}`, payload)
        toast({
          title: 'Sucesso',
          description: 'Plano atualizado com sucesso'
        })
      } else {
        await api.post('/planos', payload)
        toast({
          title: 'Sucesso',
          description: 'Plano criado com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o plano',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {plano ? 'Editar Plano' : 'Novo Plano'}
          </DialogTitle>
          <DialogDescription>
            {plano 
              ? 'Edite as informações do plano'
              : 'Crie um novo plano de assinatura'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="principal">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="principal">Principal</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="principal" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Plano</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Start, Pro, Enterprise..." {...field} />
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
                          placeholder="Descrição do plano"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valorImplantacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Implantação (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Taxa única de implantação
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valorMensal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Mensal (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
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
                    name="limiteAdm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Administradores</FormLabel>
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
                    name="limiteControlador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Controladores</FormLabel>
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="limiteApontador"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Apontadores</FormLabel>
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
                    name="limiteEquipamentos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite de Equipamentos</FormLabel>
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="recursos" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Novo recurso..."
                      value={novoRecurso}
                      onChange={(e) => setNovoRecurso(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && adicionarRecurso()}
                    />
                    <Button type="button" onClick={adicionarRecurso}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {recursos.map((recurso, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded-lg"
                      >
                        <span className="text-sm">{recurso}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removerRecurso(index)}
                          className="h-8 w-8 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {recursos.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhum recurso adicionado
                    </p>
                  )}
                </div>
              </TabsContent>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  {plano ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}