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
  Package,
  Tag,
  Truck,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Wrench,
  AlertCircle,
  Plus,
  X
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
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useEmpresa } from '@/hooks/useEmpresa'
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
  status: z.enum(['disponivel', 'em_uso', 'manutencao', 'inativo']).default('disponivel'),
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

export default function NovoEquipamentoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { empresa, plano } = useEmpresa()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [obras, setObras] = useState<Obra[]>([])
  const [frentesServico, setFrentesServico] = useState<FrenteServico[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [limites, setLimites] = useState<{ atual: number; maximo: number; disponivel: number } | null>(null)

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
    carregarObras()
    carregarCentrosCusto()
    verificarLimites()
  }, [])

  useEffect(() => {
    if (obraId) {
      carregarFrentesServico(obraId)
    } else {
      setFrentesServico([])
      setValue('frenteServicoId', null)
    }
  }, [obraId, setValue])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { limit: 100, status: 'ativa' }
      })
      setObras(response.data.obras || [])
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const carregarFrentesServico = async (obraId: number) => {
    try {
      const response = await api.get('/frentes-servico', {
        params: { obraId, limit: 100 }
      })
      setFrentesServico(response.data.frentes || [])
    } catch (error) {
      console.error('Erro ao carregar frentes de serviço:', error)
    }
  }

  const carregarCentrosCusto = async () => {
    try {
      const response = await api.get('/centros-custo', {
        params: { limit: 100 }
      })
      setCentrosCusto(response.data.centros || [])
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error)
    }
  }

  const verificarLimites = async () => {
    try {
      if (!empresa?.id) return
      const response = await api.get(`/empresas/${empresa.id}/limites/equipamentos`)
      setLimites(response.data)
    } catch (error) {
      console.error('Erro ao verificar limites:', error)
    }
  }

  const onSubmit = async (data: EquipamentoFormData) => {
    try {
      setSaving(true)
      await api.post('/equipamentos', data)
      
      toast({
        title: 'Equipamento criado',
        description: 'O equipamento foi criado com sucesso.'
      })

      router.push('/app-empresa/equipamentos')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar',
        description: error.response?.data?.error || 'Não foi possível criar o equipamento.',
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
        <Header title="Novo Equipamento" />
        
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

          {limites && limites.disponivel <= 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você atingiu o limite de equipamentos do seu plano ({limites.atual}/{limites.maximo}).
                Para adicionar mais equipamentos, faça um upgrade do seu plano.
              </AlertDescription>
            </Alert>
          )}

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
                        placeholder="Ex: EQ-001"
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
                        placeholder="Ex: Caminhão Caçamba"
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
                        placeholder="Ex: Volvo"
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
                        placeholder="Ex: FH 540"
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
                        placeholder="2024"
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
                        placeholder="Ex: 9BWHE21JX24060971"
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
                        placeholder="Ex: ABC-1234"
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
                          <Label htmlFor="horaAtual">Horímetro Atual (h)</Label>
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
                      <Label htmlFor="valorAquisicao">Valor de Aquisição (R$)</Label>
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
                      <Label htmlFor="valorResidual">Valor Residual (R$)</Label>
                      <Input
                        id="valorResidual"
                        type="number"
                        step="0.01"
                        {...register('valorResidual', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorLocacaoDiaria">Valor Locação Diária (R$)</Label>
                      <Input
                        id="valorLocacaoDiaria"
                        type="number"
                        step="0.01"
                        {...register('valorLocacaoDiaria', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorLocacaoMensal">Valor Locação Mensal (R$)</Label>
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
                    placeholder="Descreva o plano de manutenção do equipamento (periodicidade, itens a verificar, etc)..."
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
                  disabled={saving || (limites?.disponivel === 0)}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Criar Equipamento
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