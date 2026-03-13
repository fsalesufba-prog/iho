'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Clock,
  Calendar,
  Truck,
  User,
  Fuel,
  FileText,
  Info,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Rocket,
  Globe,
  Shield,
  Lock,
  Copy,
  Trash2,
  Plus,
  Minus,
  X,
  Check
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const apontamentoSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  equipamentoId: z.string().min(1, 'Equipamento é obrigatório'),
  operadorId: z.string().optional(),
  horasInicial: z.number().min(0, 'Horas iniciais devem ser maior ou igual a 0'),
  horasFinal: z.number().min(0, 'Horas finais devem ser maior ou igual a 0'),
  combustivelLitros: z.number().min(0).optional(),
  observacoes: z.string().optional(),
}).refine((data) => data.horasFinal > data.horasInicial, {
  message: "Horas finais devem ser maiores que horas iniciais",
  path: ["horasFinal"],
})

type ApontamentoFormData = z.infer<typeof apontamentoSchema>

export default function NovoApontamentoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [operadores, setOperadores] = useState<any[]>([])
  const [frenteNome, setFrenteNome] = useState('')

  const form = useForm<ApontamentoFormData>({
    resolver: zodResolver(apontamentoSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
      equipamentoId: '',
      operadorId: '',
      horasInicial: 0,
      horasFinal: 0,
      combustivelLitros: 0,
      observacoes: '',
    }
  })

  const horasInicial = form.watch('horasInicial')
  const horasFinal = form.watch('horasFinal')
  const horasTrabalhadas = horasFinal - horasInicial

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      const [frenteRes, equipamentosRes, operadoresRes] = await Promise.all([
        api.get(`/frentes-servico/${id}`),
        api.get('/equipamentos', {
          params: { empresaId: user?.empresaId, status: 'disponivel,em_uso', limit: 100 }
        }),
        api.get('/usuarios', {
          params: { empresaId: user?.empresaId, tipo: 'apontador,controlador', limit: 100 }
        })
      ])

      setFrenteNome(frenteRes.data.nome)
      setEquipamentos(equipamentosRes.data.data)
      setOperadores(operadoresRes.data.data)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ApontamentoFormData) => {
    try {
      setSaving(true)

      await api.post('/apontamentos', {
        ...data,
        frenteId: parseInt(id),
        horasTrabalhadas,
        equipamentoId: parseInt(data.equipamentoId),
        operadorId: data.operadorId ? parseInt(data.operadorId) : null,
      })

      toast({
        title: 'Sucesso',
        description: 'Apontamento registrado com sucesso'
      })

      router.push(`/app-empresa/frentes-servico/${id}/apontamentos`)
    } catch (error) {
      console.error('Erro ao criar apontamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o apontamento',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Novo Apontamento</h1>
          <p className="text-muted-foreground">
            {frenteNome}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Apontamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                {...form.register('data')}
              />
              {form.formState.errors.data && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.data.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipamentoId">Equipamento</Label>
                <Select
                  value={form.watch('equipamentoId')}
                  onValueChange={(value) => form.setValue('equipamentoId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentos.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id.toString()}>
                        {eq.nome} - {eq.tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.equipamentoId && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.equipamentoId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="operadorId">Operador</Label>
                <Select
                  value={form.watch('operadorId')}
                  onValueChange={(value) => form.setValue('operadorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {operadores.map((op) => (
                      <SelectItem key={op.id} value={op.id.toString()}>
                        {op.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horasInicial">Horas Iniciais</Label>
                <Input
                  id="horasInicial"
                  type="number"
                  {...form.register('horasInicial', { valueAsNumber: true })}
                />
                {form.formState.errors.horasInicial && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.horasInicial.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horasFinal">Horas Finais</Label>
                <Input
                  id="horasFinal"
                  type="number"
                  {...form.register('horasFinal', { valueAsNumber: true })}
                />
                {form.formState.errors.horasFinal && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.horasFinal.message}
                  </p>
                )}
              </div>
            </div>

            {horasTrabalhadas > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  Horas trabalhadas: <span className="font-bold">{horasTrabalhadas}h</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="combustivelLitros">Combustível (Litros)</Label>
              <Input
                id="combustivelLitros"
                type="number"
                step="0.1"
                {...form.register('combustivelLitros', { valueAsNumber: true })}
              />
              <p className="text-xs text-muted-foreground">
                Opcional - quantidade de combustível abastecida/utilizada
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...form.register('observacoes')}
                placeholder="Observações sobre o apontamento..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Registrar Apontamento
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}