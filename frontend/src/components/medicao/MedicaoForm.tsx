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
import { RefreshCw, Plus, Trash2, Eye, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'
import { MedicaoPreview } from './MedicaoPreview'

const itemSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  quantidade: z.number().min(0, 'Quantidade deve ser maior ou igual a 0'),
  valorUnitario: z.number().min(0, 'Valor unitário deve ser maior ou igual a 0'),
})

const formSchema = z.object({
  obraId: z.string().min(1, 'Obra é obrigatória'),
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().optional(),
  periodoInicio: z.string().min(1, 'Período inicial é obrigatório'),
  periodoFim: z.string().min(1, 'Período final é obrigatório'),
  responsavel: z.string().optional(),
  observacoes: z.string().optional(),
  itens: z.array(itemSchema),
})

type FormData = z.infer<typeof formSchema>
type ItemData = z.infer<typeof itemSchema>

interface MedicaoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicao?: any
  onSuccess?: () => void
}

export function MedicaoForm({ open, onOpenChange, medicao, onSuccess }: MedicaoFormProps) {
  const [loading, setLoading] = useState(false)
  const [obras, setObras] = useState<any[]>([])
  const [itens, setItens] = useState<ItemData[]>([])
  const [activeTab, setActiveTab] = useState('principal')
  const [showPreview, setShowPreview] = useState(false)
  const [valorTotal, setValorTotal] = useState(0)

  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      obraId: '',
      titulo: '',
      descricao: '',
      periodoInicio: '',
      periodoFim: '',
      responsavel: '',
      observacoes: '',
      itens: [],
    }
  })

  useEffect(() => {
    carregarObras()
  }, [])

  useEffect(() => {
    if (medicao) {
      form.reset({
        obraId: medicao.obraId.toString(),
        titulo: medicao.titulo,
        descricao: medicao.descricao || '',
        periodoInicio: medicao.periodoInicio?.split('T')[0] || '',
        periodoFim: medicao.periodoFim?.split('T')[0] || '',
        responsavel: medicao.responsavel || '',
        observacoes: medicao.observacoes || '',
        itens: [],
      })
      if (medicao.itens) {
        setItens(medicao.itens)
      }
    } else {
      // Item padrão
      setItens([
        {
          descricao: '',
          unidade: 'un',
          quantidade: 0,
          valorUnitario: 0
        }
      ])
    }
  }, [medicao, form])

  useEffect(() => {
    const total = itens.reduce((acc, item) => 
      acc + (item.quantidade * item.valorUnitario), 0
    )
    setValorTotal(total)
  }, [itens])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { empresaId: user?.empresaId, limit: 100 }
      })
      setObras(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const adicionarItem = () => {
    setItens([
      ...itens,
      {
        descricao: '',
        unidade: 'un',
        quantidade: 0,
        valorUnitario: 0
      }
    ])
  }

  const removerItem = (index: number) => {
    if (itens.length > 1) {
      setItens(itens.filter((_, i) => i !== index))
    }
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
        obraId: parseInt(data.obraId),
        empresaId: user?.empresaId,
        itens,
        valorTotal,
        status: 'pendente'
      }

      if (medicao) {
        await api.put(`/medicao/${medicao.id}`, payload)
        toast({
          title: 'Sucesso',
          description: 'Medição atualizada com sucesso'
        })
      } else {
        await api.post('/medicao', payload)
        toast({
          title: 'Sucesso',
          description: 'Medição criada com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar medição:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a medição',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {medicao ? 'Editar Medição' : 'Nova Medição'}
            </DialogTitle>
            <DialogDescription>
              {medicao 
                ? 'Edite as informações da medição'
                : 'Crie uma nova medição para uma obra'
              }
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="principal">Principal</TabsTrigger>
              <TabsTrigger value="itens">Itens da Medição</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <TabsContent value="principal" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="obraId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Obra</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a obra" />
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
                    name="titulo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Título da medição" {...field} />
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
                            placeholder="Descrição da medição"
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
                      name="periodoInicio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Período Início</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="periodoFim"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Período Fim</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do responsável" {...field} />
                        </FormControl>
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
                    <h3 className="text-lg font-medium">Itens da Medição</h3>
                    <Button type="button" variant="outline" size="sm" onClick={adicionarItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>

                  {itens.map((item, index) => (
                    <div key={index} className="grid grid-cols-6 gap-2 items-start border rounded-lg p-4">
                      <div className="col-span-2">
                        <label className="text-xs text-muted-foreground">Descrição</label>
                        <Input
                          value={item.descricao}
                          onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                          placeholder="Descrição do item"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Unidade</label>
                        <Select
                          value={item.unidade}
                          onValueChange={(value) => atualizarItem(index, 'unidade', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="un">Unidade</SelectItem>
                            <SelectItem value="m">Metro</SelectItem>
                            <SelectItem value="m²">Metro²</SelectItem>
                            <SelectItem value="m³">Metro³</SelectItem>
                            <SelectItem value="kg">Quilograma</SelectItem>
                            <SelectItem value="ton">Tonelada</SelectItem>
                            <SelectItem value="h">Hora</SelectItem>
                            <SelectItem value="d">Dia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Quantidade</label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantidade}
                          onChange={(e) => atualizarItem(index, 'quantidade', parseFloat(e.target.value))}
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
                          disabled={itens.length === 1}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end border-t pt-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(valorTotal)}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <DialogFooter className="mt-6 flex justify-between">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreview(true)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {/* Gerar PDF */}}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                      {medicao ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      {showPreview && (
        <MedicaoPreview
          open={showPreview}
          onOpenChange={setShowPreview}
          data={{
            titulo: form.watch('titulo'),
            obra: obras.find(o => o.id.toString() === form.watch('obraId'))?.nome,
            periodoInicio: form.watch('periodoInicio'),
            periodoFim: form.watch('periodoFim'),
            itens,
            valorTotal
          }}
        />
      )}
    </>
  )
}