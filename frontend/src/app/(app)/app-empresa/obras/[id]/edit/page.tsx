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
  Building2,
  MapPin,
  Calendar,
  DollarSign,
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
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'
import { masks } from '@/lib/masks'
import { validators } from '@/lib/validators'
import { cn } from '@/lib/utils'

const obraSchema = z.object({
  nome: z.string().min(1, 'Nome da obra é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().min(8, 'CEP inválido').max(9),
  status: z.enum(['ativa', 'paralisada', 'concluida', 'cancelada']),
  dataInicio: z.string().optional(),
  dataPrevisaoTermino: z.string().optional(),
  valor: z.number().min(0).optional(),
  observacoes: z.string().optional(),
})

type ObraFormData = z.infer<typeof obraSchema>

export default function EditarObraPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<ObraFormData>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      status: 'ativa',
      dataInicio: '',
      dataPrevisaoTermino: '',
      valor: 0,
      observacoes: '',
    }
  })

  useEffect(() => {
    carregarObra()
  }, [id])

  const carregarObra = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/obras/${id}`)
      const obra = response.data

      form.reset({
        nome: obra.nome,
        codigo: obra.codigo,
        cnpj: obra.cnpj,
        endereco: obra.endereco,
        cidade: obra.cidade,
        estado: obra.estado,
        cep: obra.cep,
        status: obra.status,
        dataInicio: obra.dataInicio?.split('T')[0] || '',
        dataPrevisaoTermino: obra.dataPrevisaoTermino?.split('T')[0] || '',
        valor: obra.valor || 0,
        observacoes: obra.observacoes || '',
      })
    } catch (error) {
      console.error('Erro ao carregar obra:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a obra',
        variant: 'destructive'
      })
      router.push('/app-empresa/obras')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ObraFormData) => {
    try {
      setSaving(true)

      await api.put(`/obras/${id}`, {
        ...data,
        empresaId: user?.empresaId,
      })

      toast({
        title: 'Sucesso',
        description: 'Obra atualizada com sucesso'
      })

      router.push(`/app-empresa/obras/${id}`)
    } catch (error) {
      console.error('Erro ao atualizar obra:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a obra',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  ]

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
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
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
          <h1 className="text-3xl font-bold">Editar Obra</h1>
          <p className="text-muted-foreground">
            {form.watch('nome')}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Obra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Obra</Label>
                <Input
                  id="nome"
                  {...form.register('nome')}
                  placeholder="Ex: Edifício Comercial"
                />
                {form.formState.errors.nome && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.nome.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  {...form.register('codigo')}
                  placeholder="Ex: OB-001"
                />
                {form.formState.errors.codigo && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.codigo.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                {...form.register('cnpj')}
                onChange={(e) => form.setValue('cnpj', masks.cnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              {form.formState.errors.cnpj && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.cnpj.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                {...form.register('endereco')}
                placeholder="Rua, número, complemento"
              />
              {form.formState.errors.endereco && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.endereco.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  {...form.register('cidade')}
                  placeholder="Cidade"
                />
                {form.formState.errors.cidade && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.cidade.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">UF</Label>
                <Select
                  value={form.watch('estado')}
                  onValueChange={(value) => form.setValue('estado', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.estado && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.estado.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  {...form.register('cep')}
                  onChange={(e) => form.setValue('cep', masks.cep(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {form.formState.errors.cep && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.cep.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  {...form.register('dataInicio')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPrevisaoTermino">Previsão de Término</Label>
                <Input
                  id="dataPrevisaoTermino"
                  type="date"
                  {...form.register('dataPrevisaoTermino')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor da Obra (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                {...form.register('valor', { valueAsNumber: true })}
              />
              {form.formState.errors.valor && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.valor.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(value: any) => form.setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="paralisada">Paralisada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...form.register('observacoes')}
                placeholder="Observações adicionais sobre a obra..."
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