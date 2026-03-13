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
  CreditCard,
  Users,
  Truck,
  DollarSign,
  Package,
  Box,
  Archive,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Zap,
  Rocket,
  Globe,
  Shield,
  Lock,
  Award,
  Star,
  Crown,
  Gem,
  Diamond,
  Medal,
  Trophy,
  Gift,
  Edit,
  Copy,
  Eye,
  MoreVertical,
  MoreHorizontal,
  Settings,
  Sliders,
  ToggleLeft,
  ToggleRight,
  Switch,
  Radio,
  Checkbox,
  List,
  Grid,
  Table,
  Columns,
  Rows,
  Maximize,
  Minimize,
  Expand,
  Collapse,
  Move,
  MoveHorizontal,
  MoveVertical,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Focus,
  Crosshair,
  Target,
  Bullseye,
  Circle,
  CircleDot,
  CircleSlashed,
  Square,
  SquareDot,
  SquareSlashed,
  Triangle,
  TriangleRight,
  TriangleLeft,
  TriangleDown,
  TriangleUp
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
import { Switch } from '@/components/ui/Switch'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const planoSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valorImplantacao: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  valorMensal: z.number().min(0, 'Valor deve ser maior ou igual a 0'),
  limiteAdm: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
  limiteControlador: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
  limiteApontador: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
  limiteEquipamentos: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
  status: z.enum(['ativo', 'inativo']).default('ativo'),
})

type PlanoFormData = z.infer<typeof planoSchema>

export default function EditarPlanoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [recursos, setRecursos] = useState<string[]>([])
  const [novoRecurso, setNovoRecurso] = useState('')

  const form = useForm<PlanoFormData>({
    resolver: zodResolver(planoSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      valorImplantacao: 0,
      valorMensal: 0,
      limiteAdm: 0,
      limiteControlador: 0,
      limiteApontador: 0,
      limiteEquipamentos: 0,
      status: 'ativo',
    }
  })

  useEffect(() => {
    carregarPlano()
  }, [id])

  const carregarPlano = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/planos/${id}`)
      const plano = response.data

      form.reset({
        nome: plano.nome,
        descricao: plano.descricao,
        valorImplantacao: plano.valorImplantacao,
        valorMensal: plano.valorMensal,
        limiteAdm: plano.limiteAdm,
        limiteControlador: plano.limiteControlador,
        limiteApontador: plano.limiteApontador,
        limiteEquipamentos: plano.limiteEquipamentos,
        status: plano.status,
      })

      setRecursos(Array.isArray(plano.recursos) ? plano.recursos : JSON.parse(plano.recursos))
    } catch (error) {
      console.error('Erro ao carregar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o plano',
        variant: 'destructive'
      })
      router.push('/admin-sistema/planos')
    } finally {
      setLoading(false)
    }
  }

  const adicionarRecurso = () => {
    if (novoRecurso.trim() && !recursos.includes(novoRecurso.trim())) {
      setRecursos([...recursos, novoRecurso.trim()])
      setNovoRecurso('')
    }
  }

  const removerRecurso = (index: number) => {
    setRecursos(recursos.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PlanoFormData) => {
    try {
      setSaving(true)

      await api.put(`/planos/${id}`, {
        ...data,
        recursos: JSON.stringify(recursos),
      })

      toast({
        title: 'Sucesso',
        description: 'Plano atualizado com sucesso'
      })

      router.push(`/admin-sistema/planos/${id}`)
    } catch (error) {
      console.error('Erro ao atualizar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o plano',
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
            <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
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
          <h1 className="text-3xl font-bold">Editar Plano</h1>
          <p className="text-muted-foreground">
            {form.watch('nome')}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Plano</Label>
              <Input
                id="nome"
                {...form.register('nome')}
                placeholder="Ex: Start, Pro, Enterprise..."
              />
              {form.formState.errors.nome && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                {...form.register('descricao')}
                placeholder="Descrição do plano"
                rows={3}
              />
              {form.formState.errors.descricao && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.descricao.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorImplantacao">Valor de Implantação (R$)</Label>
                <Input
                  id="valorImplantacao"
                  type="number"
                  step="0.01"
                  {...form.register('valorImplantacao', { valueAsNumber: true })}
                />
                {form.formState.errors.valorImplantacao && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.valorImplantacao.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
                <Input
                  id="valorMensal"
                  type="number"
                  step="0.01"
                  {...form.register('valorMensal', { valueAsNumber: true })}
                />
                {form.formState.errors.valorMensal && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.valorMensal.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Limites</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limiteAdm">Administradores</Label>
                  <Input
                    id="limiteAdm"
                    type="number"
                    {...form.register('limiteAdm', { valueAsNumber: true })}
                  />
                  {form.formState.errors.limiteAdm && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.limiteAdm.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limiteControlador">Controladores</Label>
                  <Input
                    id="limiteControlador"
                    type="number"
                    {...form.register('limiteControlador', { valueAsNumber: true })}
                  />
                  {form.formState.errors.limiteControlador && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.limiteControlador.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limiteApontador">Apontadores</Label>
                  <Input
                    id="limiteApontador"
                    type="number"
                    {...form.register('limiteApontador', { valueAsNumber: true })}
                  />
                  {form.formState.errors.limiteApontador && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.limiteApontador.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limiteEquipamentos">Equipamentos</Label>
                  <Input
                    id="limiteEquipamentos"
                    type="number"
                    {...form.register('limiteEquipamentos', { valueAsNumber: true })}
                  />
                  {form.formState.errors.limiteEquipamentos && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.limiteEquipamentos.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recursos</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Novo recurso..."
                  value={novoRecurso}
                  onChange={(e) => setNovoRecurso(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarRecurso())}
                  className="flex-1"
                />
                <Button type="button" onClick={adicionarRecurso}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {recursos.map((recurso, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border group hover:border-primary transition-colors"
                  >
                    <span className="text-sm">{recurso}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removerRecurso(index)}
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Switch
                id="status"
                checked={form.watch('status') === 'ativo'}
                onCheckedChange={(checked) => form.setValue('status', checked ? 'ativo' : 'inativo')}
              />
              <Label htmlFor="status" className="font-medium">
                Plano ativo
              </Label>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Alterações neste plano afetarão todas as empresas que o utilizam.
              </AlertDescription>
            </Alert>
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
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}