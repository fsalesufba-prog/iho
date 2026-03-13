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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { RefreshCw, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

const itemSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.number().min(1, 'Quantidade deve ser maior que 0'),
  valorUnitario: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  tipo: z.enum(['servico', 'peca', 'insumo']),
})

const formSchema = z.object({
  equipamentoId: z.string().min(1, 'Equipamento é obrigatório'),
  tipo: z.enum(['preventiva', 'corretiva', 'preditiva']),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  dataProgramada: z.string().optional(),
  horasEquipamento: z.number().min(0, 'Horas devem ser maior ou igual a 0'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']),
  observacoes: z.string().optional(),
  itens: z.array(itemSchema).optional(),
})

type FormData = z.infer<typeof formSchema>
type ItemData = z.infer<typeof itemSchema>

interface ManutencaoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  manutencao?: any
  onSuccess?: () => void
}

export function ManutencaoForm({ open, onOpenChange, manutencao, onSuccess }: ManutencaoFormProps) {
  const [loading, setLoading] = useState(false)
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [itens, setItens] = useState<ItemData[]>([])
  const [activeTab, setActiveTab] = useState('principal')
  const [custoTotal, setCustoTotal] = useState(0)

  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipamentoId: '',
      tipo: 'preventiva',
      descricao: '',
      dataProgramada: '',
      horasEquipamento: 0,
      prioridade: 'media',
      observacoes: '',
    }
  })

  useEffect(() => {
    carregarEquipamentos()
  }, [])

  useEffect(() => {
    if (manutencao) {
      form.reset({
        equipamentoId: manutencao.equipamentoId.toString(),
        tipo: manutencao.tipo,
        descricao: manutencao.descricao,
        dataProgramada: manutencao.dataProgramada?.split('T')[0] || '',
        horasEquipamento: manutencao.horasEquipamento,
        prioridade: manutencao.prioridade,
        observacoes: manutencao.observacoes || '',
      })
      if (manutencao.itens) {
        setItens(manutencao.itens)
      }
    }
  }, [manutencao, form])

  useEffect(() => {
    const total = itens.reduce((acc, item) => 
      acc + (item.quantidade * item.valorUnitario), 0
    )
    setCustoTotal(total)
  }, [itens])

  const carregarEquipamentos = async () => {
    try {
      const response = await api.get('/equipamentos', {
        params: { empresaId: user?.empresaId, limit: 100 }
      })
      setEquipamentos(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error)
    }
  }

  const adicionarItem = () => {
    setItens([
      ...itens,
      {
        descricao: '',
        quantidade: 1,
        valorUnitario: 0,
        tipo: 'servico'
      }
    ])
  }

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const atualizarItem = (index: number, campo: keyof ItemData, valor: any) => {
    const novosItens = [...itens]
    novosItens[index] = { ...novosItens[index], [campo]: valor }
    setItens(novosItens)
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      const payload = {
        ...data,
        equipamentoId: parseInt(data.equipamentoId),
        empresaId: user?.empresaId,
        itens: itens.length > 0 ? itens : undefined,
        custo: custoTotal
      }

      if (manutencao) {
        await api.put(`/manutencao/${manutencao.id}`, payload)
        toast({
          title: 'Sucesso',
          description: 'Manutenção atualizada com sucesso'
        })
      } else {
        await api.post('/manutencao', payload)
        toast({
          title: 'Sucesso',
          description: 'Manutenção criada com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar manutenção:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a manutenção',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {manutencao ? 'Editar Manutenção' : 'Nova Manutenção'}
          </DialogTitle>
          <DialogDescription>
            {manutencao 
              ? 'Edite as informações da manutenção'
              : 'Registre uma nova manutenção'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="principal">Principal</TabsTrigger>
            <TabsTrigger value="itens">Itens/Serviços</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="principal" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="equipamentoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Equipamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o equipamento" />
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="preventiva">Preventiva</SelectItem>
                            <SelectItem value="corretiva">Corretiva</SelectItem>
                            <SelectItem value="preditiva">Preditiva</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="prioridade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prioridade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="baixa">Baixa</SelectItem>
                            <SelectItem value="media">Média</SelectItem>
                            <SelectItem value="alta">Alta</SelectItem>
                            <SelectItem value="critica">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Descrição da manutenção" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dataProgramada"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data Programada</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horasEquipamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas do Equipamento</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Horímetro no momento da manutenção
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações adicionais..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="itens" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Itens e Serviços</h3>
                  <Button type="button" variant="outline" size="sm" onClick={adicionarItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>

                {itens.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-lg">
                    Nenhum item adicionado
                  </div>
                ) : (
                  <div className="space-y-4">
                    {itens.map((item, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 items-start border rounded-lg p-4">
                        <div className="col-span-2">
                          <label className="text-xs text-muted-foreground">Descrição</label>
                          <Input
                            value={item.descricao}
                            onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                            placeholder="Descrição do item"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Tipo</label>
                          <Select
                            value={item.tipo}
                            onValueChange={(value) => atualizarItem(index, 'tipo', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="servico">Serviço</SelectItem>
                              <SelectItem value="peca">Peça</SelectItem>
                              <SelectItem value="insumo">Insumo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Qtd</label>
                          <Input
                            type="number"
                            value={item.quantidade}
                            onChange={(e) => atualizarItem(index, 'quantidade', parseInt(e.target.value))}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Valor Unit.</label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.valorUnitario}
                            onChange={(e) => atualizarItem(index, 'valorUnitario', parseFloat(e.target.value))}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removerItem(index)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end border-t pt-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Custo Total</p>
                        <p className="text-2xl font-bold">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(custoTotal)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  {manutencao ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}