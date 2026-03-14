'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  MapPin,
  Wrench,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

const equipamentoSchema = z.object({
  tag: z.string().min(1, 'Tag é obrigatória'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  anoFabricacao: z.number().int().min(1900).max(new Date().getFullYear()),
  numeroSerie: z.string().min(1, 'Número de série é obrigatório'),
  placa: z.string().optional().nullable(),
  horaAtual: z.number().int().default(0),
  kmAtual: z.number().int().optional().nullable(),
  status: z.enum(['disponivel', 'em_uso', 'manutencao', 'inativo']),
  obraId: z.number().optional().nullable(),
  frenteServicoId: z.number().optional().nullable(),
  centroCustoId: z.number().optional().nullable(),
  valorAquisicao: z.number().optional().nullable(),
  valorDepreciacaoAnual: z.number().optional().nullable(),
  dataAquisicao: z.string().optional().nullable(),
  vidaUtilAnos: z.number().int().default(5),
  valorResidual: z.number().default(0),
  valorLocacaoDiaria: z.number().optional().nullable(),
  valorLocacaoMensal: z.number().optional().nullable(),
  comOperador: z.boolean().default(false),
  planoManutencao: z.string().optional().nullable()
})

type EquipamentoFormData = z.infer<typeof equipamentoSchema>

interface Obra {
  id: number
  nome: string
  codigo: string
}

interface FrenteServico {
  id: number
  nome: string
  obraId: number
}

interface CentroCusto {
  id: number
  nome: string
  codigo: string
}

export default function EditarEquipamentoPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [obras, setObras] = useState<Obra[]>([])
  const [frentesServico, setFrentesServico] = useState<FrenteServico[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<EquipamentoFormData>({
    resolver: zodResolver(equipamentoSchema),
    defaultValues: {
      status: 'disponivel',
      comOperador: false,
      vidaUtilAnos: 5,
      valorResidual: 0,
      horaAtual: 0
    }
  })

  const obraId = watch('obraId')
  const status = watch('status')

  useEffect(() => {
    carregarEquipamento()
    carregarObras()
    carregarCentrosCusto()
  }, [params.id])

  useEffect(() => {
    if (obraId) {
      carregarFrentesServico(obraId)
    }
  }, [obraId])

  const carregarEquipamento = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/equipamentos/${params.id}`)
      const equipamento = response.data

      reset({
        ...equipamento,
        dataAquisicao: equipamento.dataAquisicao ? 
          new Date(equipamento.dataAquisicao).toISOString().split('T')[0] : null
      })
    } catch (error) {
      toast({
        title: 'Erro ao carregar equipamento',
        description: 'Não foi possível carregar os dados do equipamento.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { limit: 100, status: 'ativa' }
      })
      setObras(response.data.obras)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const carregarFrentesServico = async (obraId: number) => {
    try {
      const response = await api.get('/frentes-servico', {
        params: { obraId, limit: 100 }
      })
      setFrentesServico(response.data.frentes)
    } catch (error) {
      console.error('Erro ao carregar frentes de serviço:', error)
    }
  }

  const carregarCentrosCusto = async () => {
    try {
      const response = await api.get('/centros-custo', {
        params: { limit: 100 }
      })
      setCentrosCusto(response.data.centros)
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error)
    }
  }

  const onSubmit = async (data: EquipamentoFormData) => {
    try {
      setSaving(true)
      await api.put(`/equipamentos/${params.id}`, data)
      
      toast({
        title: 'Equipamento atualizado',
        description: 'Os dados do equipamento foram atualizados com sucesso.'
      })

      router.push(`/app-empresa/equipamentos/${params.id}`)
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.response?.data?.error || 'Não foi possível atualizar o equipamento.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Carregando..." />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </Container>
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Editar Equipamento" />
        
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
              {/* Identificação */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Identificação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tag">Tag *</Label>
                      <Input
                        id="tag"
                        {...register('tag')}
                        error={!!errors.tag}
                      />
                      {errors.tag && (
                        <p className="text-sm text-destructive">{errors.tag.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        {...register('nome')}
                        error={!!errors.nome}
                      />
                      {errors.nome && (
                        <p className="text-sm text-destructive">{errors.nome.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Input
                        id="tipo"
                        {...register('tipo')}
                        placeholder="Ex: Caminhão, Escavadeira..."
                        error={!!errors.tipo}
                      />
                      {errors.tipo && (
                        <p className="text-sm text-destructive">{errors.tipo.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca *</Label>
                      <Input
                        id="marca"
                        {...register('marca')}
                        error={!!errors.marca}
                      />
                      {errors.marca && (
                        <p className="text-sm text-destructive">{errors.marca.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modelo">Modelo *</Label>
                      <Input
                        id="modelo"
                        {...register('modelo')}
                        error={!!errors.modelo}
                      />
                      {errors.modelo && (
                        <p className="text-sm text-destructive">{errors.modelo.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="anoFabricacao">Ano de Fabricação *</Label>
                      <Input
                        id="anoFabricacao"
                        type="number"
                        {...register('anoFabricacao', { valueAsNumber: true })}
                        error={!!errors.anoFabricacao}
                      />
                      {errors.anoFabricacao && (
                        <p className="text-sm text-destructive">{errors.anoFabricacao.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroSerie">Número de Série *</Label>
                      <Input
                        id="numeroSerie"
                        {...register('numeroSerie')}
                        error={!!errors.numeroSerie}
                      />
                      {errors.numeroSerie && (
                        <p className="text-sm text-destructive">{errors.numeroSerie.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="placa">Placa</Label>
                      <Input
                        id="placa"
                        {...register('placa')}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status e Localização */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Status e Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                          value={status}
                          onValueChange={(value: any) => setValue('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponivel">Disponível</SelectItem>
                            <SelectItem value="em_uso">Em Uso</SelectItem>
                            <SelectItem value="manutencao">Em Manutenção</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="obraId">Obra</Label>
                        <Select
                          value={obraId?.toString() || ''}
                          onValueChange={(value) => setValue('obraId', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a obra" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhuma</SelectItem>
                            {obras.map(obra => (
                              <SelectItem key={obra.id} value={obra.id.toString()}>
                                {obra.nome} - {obra.codigo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {obraId && (
                        <div className="space-y-2">
                          <Label htmlFor="frenteServicoId">Frente de Serviço</Label>
                          <Select
                            value={watch('frenteServicoId')?.toString() || ''}
                            onValueChange={(value) => setValue('frenteServicoId', value ? parseInt(value) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frente" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Nenhuma</SelectItem>
                              {frentesServico.map(frente => (
                                <SelectItem key={frente.id} value={frente.id.toString()}>
                                  {frente.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="centroCustoId">Centro de Custo</Label>
                        <Select
                          value={watch('centroCustoId')?.toString() || ''}
                          onValueChange={(value) => setValue('centroCustoId', value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o centro" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum</SelectItem>
                            {centrosCusto.map(centro => (
                              <SelectItem key={centro.id} value={centro.id.toString()}>
                                {centro.nome} - {centro.codigo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="horaAtual">Horímetro Atual</Label>
                          <Input
                            id="horaAtual"
                            type="number"
                            {...register('horaAtual', { valueAsNumber: true })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kmAtual">KM Atual</Label>
                          <Input
                            id="kmAtual"
                            type="number"
                            {...register('kmAtual', { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valorAquisicao">Valor de Aquisição</Label>
                      <Input
                        id="valorAquisicao"
                        type="number"
                        step="0.01"
                        {...register('valorAquisicao', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataAquisicao">Data de Aquisição</Label>
                      <Input
                        id="dataAquisicao"
                        type="date"
                        {...register('dataAquisicao')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vidaUtilAnos">Vida Útil (anos)</Label>
                      <Input
                        id="vidaUtilAnos"
                        type="number"
                        {...register('vidaUtilAnos', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorResidual">Valor Residual</Label>
                      <Input
                        id="valorResidual"
                        type="number"
                        step="0.01"
                        {...register('valorResidual', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorLocacaoDiaria">Valor Locação Diária</Label>
                      <Input
                        id="valorLocacaoDiaria"
                        type="number"
                        step="0.01"
                        {...register('valorLocacaoDiaria', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorLocacaoMensal">Valor Locação Mensal</Label>
                      <Input
                        id="valorLocacaoMensal"
                        type="number"
                        step="0.01"
                        {...register('valorLocacaoMensal', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="col-span-3">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <Label htmlFor="comOperador" className="font-medium">Com Operador</Label>
                          <p className="text-sm text-muted-foreground">
                            O valor da locação inclui operador
                          </p>
                        </div>
                        <Switch
                          id="comOperador"
                          checked={watch('comOperador')}
                          onCheckedChange={(checked) => setValue('comOperador', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plano de Manutenção */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Plano de Manutenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    {...register('planoManutencao')}
                    placeholder="Descreva o plano de manutenção do equipamento..."
                    className="min-h-[100px]"
                  />
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
                      Salvar alterações
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