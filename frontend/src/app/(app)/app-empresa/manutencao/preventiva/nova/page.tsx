'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Wrench,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  X,
  Package
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

const itemSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.number().int().positive(),
  valorUnitario: z.number().optional().nullable(),
  tipo: z.enum(['servico', 'peca', 'insumo'])
})

const manutencaoSchema = z.object({
  equipamentoId: z.number().int().positive('Selecione um equipamento'),
  dataProgramada: z.string().min(1, 'Data programada é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  observacoes: z.string().optional(),
  horasEquipamento: z.number().int().default(0),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']).default('media'),
  itens: z.array(itemSchema).default([])
})

type ManutencaoFormData = z.infer<typeof manutencaoSchema>
type ItemFormData = z.infer<typeof itemSchema>

interface Equipamento {
  id: number
  tag: string
  nome: string
  modelo: string
  horaAtual: number
}

export default function NovaManutencaoPreventivaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [itens, setItens] = useState<ItemFormData[]>([])
  const [novoItem, setNovoItem] = useState<Partial<ItemFormData>>({
    tipo: 'servico'
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ManutencaoFormData>({
    resolver: zodResolver(manutencaoSchema),
    defaultValues: {
      prioridade: 'media',
      dataProgramada: new Date().toISOString().split('T')[0]
    }
  })

  const equipamentoId = watch('equipamentoId')

  useEffect(() => {
    carregarEquipamentos()
  }, [])

  useEffect(() => {
    if (equipamentoId) {
      const equipamento = equipamentos.find(e => e.id === equipamentoId)
      if (equipamento) {
        setValue('horasEquipamento', equipamento.horaAtual)
      }
    }
  }, [equipamentoId, equipamentos, setValue])

  const carregarEquipamentos = async () => {
    try {
      const response = await api.get('/equipamentos', {
        params: { limit: 100, status: 'disponivel,em_uso' }
      })
      setEquipamentos(response.data.equipamentos)
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error)
    }
  }

  const adicionarItem = () => {
    if (!novoItem.descricao || !novoItem.quantidade) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha a descrição e quantidade do item.',
        variant: 'destructive'
      })
      return
    }

    const item: ItemFormData = {
      descricao: novoItem.descricao,
      quantidade: novoItem.quantidade,
      valorUnitario: novoItem.valorUnitario || null,
      tipo: novoItem.tipo as any || 'servico'
    }

    setItens([...itens, item])
    setNovoItem({ tipo: 'servico' })
  }

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const calcularCustoTotal = () => {
    return itens.reduce((total, item) => {
      return total + (item.valorUnitario || 0) * item.quantidade
    }, 0)
  }

  const onSubmit = async (data: ManutencaoFormData) => {
    try {
      setSaving(true)
      
      const payload = {
        ...data,
        tipo: 'preventiva',
        custo: calcularCustoTotal(),
        status: 'programada',
        itens
      }

      await api.post('/manutencoes', payload)
      
      toast({
        title: 'Manutenção criada',
        description: 'A manutenção preventiva foi programada com sucesso.'
      })

      router.push('/app-empresa/manutencao/preventiva')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar',
        description: error.response?.data?.error || 'Não foi possível criar a manutenção.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Nova Manutenção Preventiva" />
        
        <Container size="xl" className="py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados da Manutenção */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Dados da Manutenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="equipamentoId">Equipamento *</Label>
                      <Select
                        value={equipamentoId?.toString() || ''}
                        onValueChange={(value) => setValue('equipamentoId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o equipamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipamentos.map(equip => (
                            <SelectItem key={equip.id} value={equip.id.toString()}>
                              {equip.tag} - {equip.nome} ({equip.horaAtual}h)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.equipamentoId && (
                        <p className="text-sm text-destructive">{errors.equipamentoId.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataProgramada">Data Programada *</Label>
                      <Input
                        id="dataProgramada"
                        type="date"
                        {...register('dataProgramada')}
                        error={!!errors.dataProgramada}
                      />
                      {errors.dataProgramada && (
                        <p className="text-sm text-destructive">{errors.dataProgramada.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prioridade">Prioridade *</Label>
                      <Select
                        value={watch('prioridade')}
                        onValueChange={(value: any) => setValue('prioridade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="critica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horasEquipamento">Horas do Equipamento</Label>
                      <Input
                        id="horasEquipamento"
                        type="number"
                        {...register('horasEquipamento', { valueAsNumber: true })}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Textarea
                        id="descricao"
                        {...register('descricao')}
                        placeholder="Descreva o serviço de manutenção preventiva a ser realizado..."
                        className="min-h-[100px]"
                        error={!!errors.descricao}
                      />
                      {errors.descricao && (
                        <p className="text-sm text-destructive">{errors.descricao.message}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        {...register('observacoes')}
                        placeholder="Observações adicionais..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Itens da Manutenção */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Itens / Serviços
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Lista de itens */}
                    {itens.length > 0 && (
                      <div className="space-y-2">
                        {itens.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.descricao}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantidade}x {item.tipo} - 
                                {item.valorUnitario ? ` R$ ${item.valorUnitario.toFixed(2)}` : 'Sem valor'}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removerItem(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Formulário para novo item */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input
                        placeholder="Descrição do item"
                        value={novoItem.descricao || ''}
                        onChange={(e) => setNovoItem({ ...novoItem, descricao: e.target.value })}
                      />
                      <Input
                        type="number"
                        placeholder="Quantidade"
                        value={novoItem.quantidade || ''}
                        onChange={(e) => setNovoItem({ ...novoItem, quantidade: parseInt(e.target.value) })}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor unitário"
                        value={novoItem.valorUnitario || ''}
                        onChange={(e) => setNovoItem({ ...novoItem, valorUnitario: parseFloat(e.target.value) })}
                      />
                      <Select
                        value={novoItem.tipo}
                        onValueChange={(value: any) => setNovoItem({ ...novoItem, tipo: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="servico">Serviço</SelectItem>
                          <SelectItem value="peca">Peça</SelectItem>
                          <SelectItem value="insumo">Insumo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={adicionarItem}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Item
                    </Button>

                    {/* Resumo de custos */}
                    {itens.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Custo total estimado:</span>
                          <span className="text-xl font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcularCustoTotal())}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Ações */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Programar Manutenção
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </Container>
      </main>
    </>
  )
}