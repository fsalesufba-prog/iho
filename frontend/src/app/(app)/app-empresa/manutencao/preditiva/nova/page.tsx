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
  TrendingUp,
  Plus,
  X,
  Package,
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
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'

const itemSchema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  quantidade: z.number().int().positive(),
  valorUnitario: z.number().optional().nullable(),
  tipo: z.enum(['servico', 'peca', 'insumo'])
})

const manutencaoSchema = z.object({
  equipamentoId: z.number().int().positive('Selecione um equipamento'),
  dataProgramada: z.string().min(1, 'Data prevista é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  observacoes: z.string().optional(),
  horasEquipamento: z.number().int().default(0),
  confiabilidade: z.number().int().min(0).max(100).default(85),
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
  status: string
}

export default function NovaManutencaoPreditivaPage() {
  const router = useRouter()
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
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
      confiabilidade: 85,
      dataProgramada: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
        params: { limit: 100 }
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
        tipo: 'preditiva',
        custo: calcularCustoTotal(),
        status: 'programada',
        prioridade: data.confiabilidade < 60 ? 'alta' : data.confiabilidade < 80 ? 'media' : 'baixa',
        itens
      }

      await api.post('/manutencoes', payload)
      
      toast({
        title: 'Análise criada',
        description: 'A análise preditiva foi registrada com sucesso.'
      })

      router.push('/app-empresa/manutencao/preditiva')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar',
        description: error.response?.data?.error || 'Não foi possível criar a análise.',
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
        <Header title="Nova Análise Preditiva" />
        
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
              {/* Dados da Análise */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Análise Preditiva
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
                      <Label htmlFor="dataProgramada">Data Prevista *</Label>
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
                      <Label htmlFor="confiabilidade">Índice de Confiabilidade (%) *</Label>
                      <Input
                        id="confiabilidade"
                        type="number"
                        min="0"
                        max="100"
                        {...register('confiabilidade', { valueAsNumber: true })}
                      />
                      <p className="text-xs text-muted-foreground">
                        {watch('confiabilidade') < 60 ? 'Crítico - Intervenção imediata' :
                         watch('confiabilidade') < 80 ? 'Atenção - Monitorar' :
                         'Bom - Operação normal'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horasEquipamento">Horas Atuais</Label>
                      <Input
                        id="horasEquipamento"
                        type="number"
                        {...register('horasEquipamento', { valueAsNumber: true })}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Recomendação *</Label>
                      <Textarea
                        id="descricao"
                        {...register('descricao')}
                        placeholder="Descreva a recomendação baseada na análise preditiva..."
                        className="min-h-[100px]"
<<<<<<< HEAD
                        error={!!errors.descricao}
=======
                        aria-invalid={!!errors.descricao}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                      />
                      {errors.descricao && (
                        <p className="text-sm text-destructive">{errors.descricao.message}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="observacoes">Observações Técnicas</Label>
                      <Textarea
                        id="observacoes"
                        {...register('observacoes')}
                        placeholder="Dados da análise, parâmetros monitorados..."
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
                    Itens Recomendados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
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
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Registrar Análise
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