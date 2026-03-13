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
  Calendar,
  Clock,
  AlertCircle,
  Wrench
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

const manutencaoSchema = z.object({
  dataProgramada: z.string().min(1, 'Data programada é obrigatória'),
  dataRealizada: z.string().optional().nullable(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  observacoes: z.string().optional().nullable(),
  horasEquipamento: z.number().int().default(0),
  custo: z.number().optional().nullable(),
  status: z.enum(['programada', 'em_andamento', 'concluida', 'cancelada']),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica'])
})

type ManutencaoFormData = z.infer<typeof manutencaoSchema>

interface Manutencao {
  id: number
  tipo: string
  equipamentoId: number
  dataProgramada: string
  dataRealizada?: string
  descricao: string
  observacoes?: string
  horasEquipamento: number
  custo?: number
  status: string
  prioridade: string
  equipamento: {
    tag: string
    nome: string
  }
}

export default function EditarManutencaoPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [manutencao, setManutencao] = useState<Manutencao | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ManutencaoFormData>({
    resolver: zodResolver(manutencaoSchema)
  })

  const status = watch('status')
  const prioridade = watch('prioridade')

  useEffect(() => {
    carregarManutencao()
  }, [params.id])

  const carregarManutencao = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/manutencoes/${params.id}`)
      setManutencao(response.data)
      
      reset({
        dataProgramada: response.data.dataProgramada.split('T')[0],
        dataRealizada: response.data.dataRealizada ? response.data.dataRealizada.split('T')[0] : null,
        descricao: response.data.descricao,
        observacoes: response.data.observacoes || '',
        horasEquipamento: response.data.horasEquipamento,
        custo: response.data.custo,
        status: response.data.status,
        prioridade: response.data.prioridade
      })
    } catch (error) {
      toast({
        title: 'Erro ao carregar manutenção',
        description: 'Não foi possível carregar os dados da manutenção.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ManutencaoFormData) => {
    try {
      setSaving(true)
      await api.put(`/manutencoes/${params.id}`, data)
      
      toast({
        title: 'Manutenção atualizada',
        description: 'Os dados da manutenção foram atualizados com sucesso.'
      })

      router.push(`/app-empresa/manutencao/${params.id}`)
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.response?.data?.error || 'Não foi possível atualizar a manutenção.',
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

  if (!manutencao) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Manutenção não encontrada" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Wrench className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Manutenção não encontrada</h2>
              <p className="text-muted-foreground mb-6">
                A manutenção que você está tentando editar não existe.
              </p>
              <Link href="/app-empresa/manutencao">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para manutenções
                </Button>
              </Link>
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
        <Header title={`Editar Manutenção #${manutencao.id}`} />
        
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  Editar Manutenção {manutencao.tipo === 'preventiva' ? 'Preventiva' :
                                    manutencao.tipo === 'corretiva' ? 'Corretiva' : 'Preditiva'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="p-4 bg-muted/30 rounded-lg mb-4">
                    <p className="text-sm">
                      <span className="font-medium">Equipamento:</span> {manutencao.equipamento.tag} - {manutencao.equipamento.nome}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <Label htmlFor="dataRealizada">Data Realizada</Label>
                      <Input
                        id="dataRealizada"
                        type="date"
                        {...register('dataRealizada')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={status}
                        onValueChange={(value: any) => setValue('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programada">Programada</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluida">Concluída</SelectItem>
                          <SelectItem value="cancelada">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="prioridade">Prioridade *</Label>
                      <Select
                        value={prioridade}
                        onValueChange={(value: any) => setValue('prioridade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custo">Custo Total (R$)</Label>
                      <Input
                        id="custo"
                        type="number"
                        step="0.01"
                        {...register('custo', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Descrição *</Label>
                      <Textarea
                        id="descricao"
                        {...register('descricao')}
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
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>

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
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>
    </>
  )
}