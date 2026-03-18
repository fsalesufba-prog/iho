'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  FileText,
  Plus,
  Trash2,
  Clock,
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
import { formatCurrency } from '@/lib/utils'

const equipamentoSchema = z.object({
  equipamentoId: z.number().int().positive(),
  horasTrabalhadas: z.number().positive('Horas deve ser maior que zero')
})

const medicaoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  obraId: z.number().int().positive('Selecione uma obra'),
  periodoInicio: z.string().min(1, 'Data inicial é obrigatória'),
  periodoFim: z.string().min(1, 'Data final é obrigatória'),
  observacoes: z.string().optional(),
  modeloId: z.number().int().optional()
})

type MedicaoFormData = z.infer<typeof medicaoSchema>
type EquipamentoItem = {
  equipamentoId: number
  equipamentoTag: string
  equipamentoNome: string
  horasTrabalhadas: number
  valorUnitario: number
  valorTotal: number
}

interface Obra {
  id: number
  nome: string
  codigo: string
}

interface Equipamento {
  id: number
  tag: string
  nome: string
  valorLocacaoDiaria?: number
  valorLocacaoMensal?: number
}

interface Modelo {
  id: number
  nome: string
  descricao?: string
}

function EmitirMedicaoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const medicaoId = searchParams.get('id')
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [obras, setObras] = useState<Obra[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [itens, setItens] = useState<EquipamentoItem[]>([])
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<string>('')
  const [horasInput, setHorasInput] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<MedicaoFormData>({
    resolver: zodResolver(medicaoSchema)
  })

  const obraId = watch('obraId')

  useEffect(() => {
    carregarDados()
    if (medicaoId) {
      carregarMedicao()
    }
  }, [medicaoId])

  useEffect(() => {
    if (obraId) {
      carregarEquipamentos(obraId)
    }
  }, [obraId])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const [obrasRes, modelosRes] = await Promise.all([
        api.get('/obras', { params: { limit: 100, status: 'ativa' } }),
        api.get('/medicao/modelos')
      ])
      setObras(obrasRes.data.obras)
      setModelos(modelosRes.data.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarMedicao = async () => {
    try {
      const response = await api.get(`/medicao/${medicaoId}`)
      const medicao = response.data.data
      
      reset({
        titulo: medicao.titulo,
        obraId: medicao.obraId,
        periodoInicio: medicao.periodoInicio.split('T')[0],
        periodoFim: medicao.periodoFim.split('T')[0],
        observacoes: medicao.observacoes || '',
        modeloId: medicao.modeloId
      })

      setItens(medicao.equipamentos.map((eq: any) => ({
        equipamentoId: eq.equipamento.id,
        equipamentoTag: eq.equipamento.tag,
        equipamentoNome: eq.equipamento.nome,
        horasTrabalhadas: eq.horasTrabalhadas,
        valorUnitario: eq.valorUnitario,
        valorTotal: eq.valorTotal
      })))
    } catch (error) {
      toast({
        title: 'Erro ao carregar medição',
        description: 'Não foi possível carregar os dados da medição.',
        variant: 'destructive'
      })
    }
  }

  const carregarEquipamentos = async (obraId: number) => {
    try {
      const response = await api.get('/equipamentos', {
        params: { obraId, status: 'disponivel,em_uso' }
      })
      setEquipamentos(response.data.equipamentos)
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error)
    }
  }

  const adicionarEquipamento = () => {
    if (!equipamentoSelecionado || !horasInput) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione um equipamento e informe as horas.',
        variant: 'destructive'
      })
      return
    }

    const equipamento = equipamentos.find(e => e.id === parseInt(equipamentoSelecionado))
    if (!equipamento) return

    const horas = parseFloat(horasInput)
    if (horas <= 0) {
      toast({
        title: 'Horas inválidas',
        description: 'As horas devem ser maiores que zero.',
        variant: 'destructive'
      })
      return
    }

    // Calcular valor unitário
    let valorUnitario = 0
    if (equipamento.valorLocacaoDiaria) {
      valorUnitario = equipamento.valorLocacaoDiaria / 8
    } else if (equipamento.valorLocacaoMensal) {
      valorUnitario = equipamento.valorLocacaoMensal / (8 * 22)
    }

    const novoItem: EquipamentoItem = {
      equipamentoId: equipamento.id,
      equipamentoTag: equipamento.tag,
      equipamentoNome: equipamento.nome,
      horasTrabalhadas: horas,
      valorUnitario,
      valorTotal: valorUnitario * horas
    }

    setItens([...itens, novoItem])
    setEquipamentoSelecionado('')
    setHorasInput('')
  }

  const removerEquipamento = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const calcularTotais = () => {
    const horasTotal = itens.reduce((sum, item) => sum + item.horasTrabalhadas, 0)
    const valorTotal = itens.reduce((sum, item) => sum + item.valorTotal, 0)
    return { horasTotal, valorTotal }
  }

  const onSubmit = async (data: MedicaoFormData) => {
    if (itens.length === 0) {
      toast({
        title: 'Nenhum equipamento',
        description: 'Adicione pelo menos um equipamento à medição.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      
      const payload = {
        ...data,
        equipamentos: itens.map(item => ({
          equipamentoId: item.equipamentoId,
          horasTrabalhadas: item.horasTrabalhadas,
          valorUnitario: item.valorUnitario,
          valorTotal: item.valorTotal
        }))
      }

      if (medicaoId) {
        await api.put(`/medicao/${medicaoId}`, payload)
        toast({
          title: 'Medição atualizada',
          description: 'A medição foi atualizada com sucesso.'
        })
      } else {
        await api.post('/medicao', payload)
        toast({
          title: 'Medição criada',
          description: 'A medição foi criada com sucesso.'
        })
      }

      router.push('/app-empresa/medicao')
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.response?.data?.error || 'Não foi possível salvar a medição.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const { horasTotal, valorTotal } = calcularTotais()

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title={medicaoId ? 'Editar Medição' : 'Nova Medição'} />
        
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
              {/* Dados da Medição */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Dados da Medição
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="titulo">Título *</Label>
                      <Input
                        id="titulo"
                        {...register('titulo')}
                        placeholder="Ex: Medição de Fevereiro/2024"
                        error={!!errors.titulo}
                      />
                      {errors.titulo && (
                        <p className="text-sm text-destructive">{errors.titulo.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="obraId">Obra *</Label>
                      <Select
                        value={obraId?.toString() || ''}
                        onValueChange={(value) => setValue('obraId', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a obra" />
                        </SelectTrigger>
                        <SelectContent>
                          {obras.map(obra => (
                            <SelectItem key={obra.id} value={obra.id.toString()}>
                              {obra.nome} - {obra.codigo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.obraId && (
                        <p className="text-sm text-destructive">{errors.obraId.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="periodoInicio">Período Inicial *</Label>
                      <Input
                        id="periodoInicio"
                        type="date"
                        {...register('periodoInicio')}
                        error={!!errors.periodoInicio}
                      />
                      {errors.periodoInicio && (
                        <p className="text-sm text-destructive">{errors.periodoInicio.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="periodoFim">Período Final *</Label>
                      <Input
                        id="periodoFim"
                        type="date"
                        {...register('periodoFim')}
                        error={!!errors.periodoFim}
                      />
                      {errors.periodoFim && (
                        <p className="text-sm text-destructive">{errors.periodoFim.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modeloId">Modelo (opcional)</Label>
                      <Select
                        value={watch('modeloId')?.toString() || ''}
                        onValueChange={(value) => setValue('modeloId', value ? parseInt(value) : undefined)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {modelos.map(modelo => (
                            <SelectItem key={modelo.id} value={modelo.id.toString()}>
                              {modelo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        {...register('observacoes')}
                        placeholder="Observações adicionais sobre a medição..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Equipamentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Equipamentos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Lista de equipamentos */}
                    {itens.length > 0 && (
                      <div className="space-y-2">
                        {itens.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{item.equipamentoTag}</span>
                                <span className="font-medium">{item.equipamentoNome}</span>
                              </div>
                              <div className="flex gap-4 mt-1 text-sm">
                                <span>{item.horasTrabalhadas} h</span>
                                <span>R$ {item.valorUnitario.toFixed(2)}/h</span>
                                <span className="font-bold text-primary">
                                  Total: {formatCurrency(item.valorTotal)}
                                </span>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removerEquipamento(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Adicionar equipamento */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Select value={equipamentoSelecionado} onValueChange={setEquipamentoSelecionado}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o equipamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipamentos
                            .filter(e => !itens.some(item => item.equipamentoId === e.id))
                            .map(eq => (
                              <SelectItem key={eq.id} value={eq.id.toString()}>
                                {eq.tag} - {eq.nome}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        placeholder="Horas trabalhadas"
                        value={horasInput}
                        onChange={(e) => setHorasInput(e.target.value)}
                        min="0"
                        step="0.5"
                      />

                      <Button
                        type="button"
                        onClick={adicionarEquipamento}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar
                      </Button>
                    </div>

                    {/* Totais */}
                    {itens.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-muted-foreground">Total de Horas</p>
                            <p className="text-2xl font-bold">{horasTotal} h</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Valor Total</p>
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(valorTotal)}
                            </p>
                          </div>
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
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {medicaoId ? 'Atualizar' : 'Salvar Medição'}
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
export default function EmitirMedicaoPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
      <EmitirMedicaoPage />
    </Suspense>
  )
}
