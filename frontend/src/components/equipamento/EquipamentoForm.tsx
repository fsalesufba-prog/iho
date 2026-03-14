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
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'

const formSchema = z.object({
  // Identificação
  tag: z.string().min(1, 'Tag é obrigatória'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  anoFabricacao: z.number().min(1900, 'Ano inválido').max(new Date().getFullYear() + 1),
  numeroSerie: z.string().min(1, 'Número de série é obrigatório'),
  placa: z.string().optional(),

  // Localização
  obraId: z.string().optional(),
  frenteServicoId: z.string().optional(),
  centroCustoId: z.string().optional(),

  // Valores
  valorAquisicao: z.number().min(0).optional(),
  valorDepreciacaoAnual: z.number().min(0).optional(),
  dataAquisicao: z.string().optional(),
  vidaUtilAnos: z.number().min(1).optional(),
  valorResidual: z.number().min(0).optional(),
  valorLocacaoDiaria: z.number().min(0).optional(),
  valorLocacaoMensal: z.number().min(0).optional(),
  comOperador: z.boolean().default(false),

  // Status
  status: z.enum(['disponivel', 'em_uso', 'manutencao', 'inativo']).default('disponivel'),
  horaAtual: z.number().min(0).default(0),

  // Observações
  observacoes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface EquipamentoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  equipamento?: any
  onSuccess?: () => void
}

export function EquipamentoForm({ open, onOpenChange, equipamento, onSuccess }: EquipamentoFormProps) {
  const [loading, setLoading] = useState(false)
  const [tipos, setTipos] = useState<string[]>([])
  const [obras, setObras] = useState<any[]>([])
  const [frentes, setFrentes] = useState<any[]>([])
  const [centrosCusto, setCentrosCusto] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('identificacao')

  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tag: '',
      nome: '',
      tipo: '',
      marca: '',
      modelo: '',
      anoFabricacao: new Date().getFullYear(),
      numeroSerie: '',
      placa: '',
      obraId: '',
      frenteServicoId: '',
      centroCustoId: '',
      valorAquisicao: 0,
      valorDepreciacaoAnual: 0,
      dataAquisicao: '',
      vidaUtilAnos: 5,
      valorResidual: 0,
      valorLocacaoDiaria: 0,
      valorLocacaoMensal: 0,
      comOperador: false,
      status: 'disponivel',
      horaAtual: 0,
      observacoes: '',
    }
  })

  useEffect(() => {
    carregarTipos()
    carregarObras()
    carregarCentrosCusto()
  }, [])

  useEffect(() => {
    const obraId = form.watch('obraId')
    if (obraId) {
      carregarFrentes(parseInt(obraId))
    }
  }, [form.watch('obraId')])

  useEffect(() => {
    if (equipamento) {
      form.reset({
        tag: equipamento.tag,
        nome: equipamento.nome,
        tipo: equipamento.tipo,
        marca: equipamento.marca,
        modelo: equipamento.modelo,
        anoFabricacao: equipamento.anoFabricacao,
        numeroSerie: equipamento.numeroSerie,
        placa: equipamento.placa || '',
        obraId: equipamento.obraId?.toString() || '',
        frenteServicoId: equipamento.frenteServicoId?.toString() || '',
        centroCustoId: equipamento.centroCustoId?.toString() || '',
        valorAquisicao: equipamento.valorAquisicao || 0,
        valorDepreciacaoAnual: equipamento.valorDepreciacaoAnual || 0,
        dataAquisicao: equipamento.dataAquisicao?.split('T')[0] || '',
        vidaUtilAnos: equipamento.vidaUtilAnos || 5,
        valorResidual: equipamento.valorResidual || 0,
        valorLocacaoDiaria: equipamento.valorLocacaoDiaria || 0,
        valorLocacaoMensal: equipamento.valorLocacaoMensal || 0,
        comOperador: equipamento.comOperador || false,
        status: equipamento.status,
        horaAtual: equipamento.horaAtual || 0,
        observacoes: equipamento.observacoes || '',
      })
    }
  }, [equipamento, form])

  const carregarTipos = async () => {
    try {
      const response = await api.get('/equipamentos/tipos')
      setTipos(response.data)
    } catch (error) {
      console.error('Erro ao carregar tipos:', error)
    }
  }

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

  const carregarFrentes = async (obraId: number) => {
    try {
      const response = await api.get('/frentes-servico', {
        params: { obraId, limit: 100 }
      })
      setFrentes(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar frentes:', error)
    }
  }

  const carregarCentrosCusto = async () => {
    try {
      const response = await api.get('/centros-custo', {
        params: { 
          empresaId: user?.empresaId,
          limit: 100 
        }
      })
      setCentrosCusto(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      const payload = {
        ...data,
        empresaId: user?.empresaId,
        obraId: data.obraId ? parseInt(data.obraId) : null,
        frenteServicoId: data.frenteServicoId ? parseInt(data.frenteServicoId) : null,
        centroCustoId: data.centroCustoId ? parseInt(data.centroCustoId) : null,
      }

      if (equipamento) {
        await api.put(`/equipamentos/${equipamento.id}`, payload)
        toast({
          title: 'Sucesso',
          description: 'Equipamento atualizado com sucesso'
        })
      } else {
        await api.post('/equipamentos', payload)
        toast({
          title: 'Sucesso',
          description: 'Equipamento criado com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar equipamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o equipamento',
        variant: 'error'
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
            {equipamento ? 'Editar Equipamento' : 'Novo Equipamento'}
          </DialogTitle>
          <DialogDescription>
            {equipamento 
              ? 'Edite as informações do equipamento'
              : 'Adicione um novo equipamento ao sistema'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="identificacao">Identificação</TabsTrigger>
            <TabsTrigger value="localizacao">Localização</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="identificacao" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag</FormLabel>
                        <FormControl>
                          <Input placeholder="EQP-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tipos.map((t) => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
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
                      <FormLabel>Nome do Equipamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Escavadeira Hidráulica" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="marca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marca</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Caterpillar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 320D" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="anoFabricacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano de Fabricação</FormLabel>
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
                    name="numeroSerie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Série</FormLabel>
                        <FormControl>
                          <Input placeholder="SN-123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="placa"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Placa</FormLabel>
                        <FormControl>
                          <Input placeholder="ABC-1234" {...field} />
                        </FormControl>
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
                          placeholder="Observações adicionais sobre o equipamento..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="localizacao" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="obraId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Obra</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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

                <FormField
                  control={form.control}
                  name="frenteServicoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frente de Serviço</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        disabled={!form.watch('obraId')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma frente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhuma</SelectItem>
                          {frentes.map((frente) => (
                            <SelectItem key={frente.id} value={frente.id.toString()}>
                              {frente.nome}
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
                  name="centroCustoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Centro de Custo</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um centro de custo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Nenhum</SelectItem>
                          {centrosCusto.map((centro) => (
                            <SelectItem key={centro.id} value={centro.id.toString()}>
                              {centro.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="financeiro" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="valorAquisicao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Aquisição (R$)</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="dataAquisicao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Aquisição</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vidaUtilAnos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vida Útil (anos)</FormLabel>
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
                    name="valorResidual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Residual (R$)</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="valorDepreciacaoAnual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depreciação Anual (R$)</FormLabel>
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
                    name="valorLocacaoDiaria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Locação Diária (R$)</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="valorLocacaoMensal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor Locação Mensal (R$)</FormLabel>
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

                <FormField
                  control={form.control}
                  name="comOperador"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Com Operador</FormLabel>
                        <FormDescription>
                          O valor da locação inclui operador
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
              </TabsContent>

              <TabsContent value="manutencao" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
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
                            <SelectItem value="disponivel">Disponível</SelectItem>
                            <SelectItem value="em_uso">Em Uso</SelectItem>
                            <SelectItem value="manutencao">Em Manutenção</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="horaAtual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horas Atuais</FormLabel>
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
                  {equipamento ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}