'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
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
  CheckCircle,
  XCircle,
  Eye,
  MoreVertical,
  MoreHorizontal,
  Settings,
  Sliders,
  ToggleLeft,
  ToggleRight,
  List,
  Grid,
  Columns,
  Maximize,
  Minimize,
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
  Circle,
  Square,
  Triangle,
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

export default function NovoPlanoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [recursos, setRecursos] = useState<string[]>([])
  const [novoRecurso, setNovoRecurso] = useState('')

  const form = useForm<PlanoFormData>({
    resolver: zodResolver(planoSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      valorImplantacao: 3000,
      valorMensal: 0,
      limiteAdm: 1,
      limiteControlador: 2,
      limiteApontador: 2,
      limiteEquipamentos: 25,
      status: 'ativo',
    }
  })

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

      await api.post('/planos', {
        ...data,
        recursos: JSON.stringify(recursos),
      })

      toast({
        title: 'Sucesso',
        description: 'Plano criado com sucesso'
      })

      router.push('/admin-sistema/planos')
    } catch (error) {
      console.error('Erro ao criar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o plano',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
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
          <h1 className="text-3xl font-bold">Novo Plano</h1>
          <p className="text-muted-foreground">
            Crie um novo plano de assinatura
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
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Plano
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
