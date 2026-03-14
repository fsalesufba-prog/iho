'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Save, RefreshCw, Star } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Alert } from '@/components/ui/Alert'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'

const formSchema = z.object({
  precoCondicoes: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  qualidadeServico: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  qualidadeEntrega: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  segurancaSaude: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  estoque: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  administracao: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  ocorrencias: z.string().optional(),
  observacoes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const pesos = {
  precoCondicoes: 0.20, // 20%
  qualidadeServico: 0.25, // 25%
  qualidadeEntrega: 0.15, // 15%
  segurancaSaude: 0.25, // 25%
  estoque: 0.10, // 10%
  administracao: 0.05, // 5%
}

export default function NovaAvaliacaoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [centroNome, setCentroNome] = useState('')
  const [notaFinal, setNotaFinal] = useState(0)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      precoCondicoes: 3,
      qualidadeServico: 3,
      qualidadeEntrega: 3,
      segurancaSaude: 3,
      estoque: 3,
      administracao: 3,
      ocorrencias: '',
      observacoes: '',
    }
  })

  const watchAllFields = form.watch()

  useEffect(() => {
    carregarCentro()
  }, [id])

  useEffect(() => {
    calcularNotaFinal()
  }, [watchAllFields])

  const carregarCentro = async () => {
    try {
      const response = await api.get(`/centros-custo/${id}`)
      setCentroNome(response.data.nome)
    } catch (error) {
      console.error('Erro ao carregar centro:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularNotaFinal = () => {
    const values = form.getValues()
    let total = 0
    
    total += values.precoCondicoes * pesos.precoCondicoes
    total += values.qualidadeServico * pesos.qualidadeServico
    total += values.qualidadeEntrega * pesos.qualidadeEntrega
    total += values.segurancaSaude * pesos.segurancaSaude
    total += values.estoque * pesos.estoque
    total += values.administracao * pesos.administracao

    setNotaFinal(Number(total.toFixed(2)))
  }

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true)

      await api.post('/centros-custo/avaliacoes', {
        ...data,
        centroCustoId: parseInt(id),
        avaliadorId: user?.id,
        notaFinal,
      })

      toast({
        title: 'Sucesso',
        description: 'Avaliação registrada com sucesso'
      })

      router.push(`/app-empresa/centros-custo/${id}/avaliacoes`)
    } catch (error) {
      console.error('Erro ao criar avaliação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a avaliação',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600'
    if (nota >= 3.5) return 'text-blue-600'
    if (nota >= 2.5) return 'text-yellow-600'
    if (nota >= 1.5) return 'text-orange-600'
    return 'text-red-600'
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
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-32" />
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
          <h1 className="text-3xl font-bold">Nova Avaliação</h1>
          <p className="text-muted-foreground">
            {centroNome}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Avaliação do Fornecedor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Nota Final em Destaque */}
            <Alert className="bg-primary/5 border-primary">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  <span className="font-medium">Nota Final Calculada:</span>
                </div>
                <span className={`text-2xl font-bold ${getNotaColor(notaFinal)}`}>
                  {notaFinal.toFixed(2)}
                </span>
              </div>
            </Alert>

            <div className="grid grid-cols-2 gap-6">
              {/* Preço e Condições (20%) */}
              <div className="space-y-2">
                <Label htmlFor="precoCondicoes">
                  Preço e Condições (20%)
                  <span className="ml-2 text-xs text-muted-foreground">
                    Peso: 20%
                  </span>
                </Label>
                <Input
                  id="precoCondicoes"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...form.register('precoCondicoes', { valueAsNumber: true })}
                />
                {form.formState.errors.precoCondicoes && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.precoCondicoes.message}
                  </p>
                )}
              </div>

              {/* Qualidade do Serviço (25%) */}
              <div className="space-y-2">
                <Label htmlFor="qualidadeServico">
                  Qualidade do Serviço (25%)
                  <span className="ml-2 text-xs text-muted-foreground">
                    Peso: 25%
                  </span>
                </Label>
                <Input
                  id="qualidadeServico"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...form.register('qualidadeServico', { valueAsNumber: true })}
                />
                {form.formState.errors.qualidadeServico && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.qualidadeServico.message}
                  </p>
                )}
              </div>

              {/* Qualidade de Entrega (15%) */}
              <div className="space-y-2">
                <Label htmlFor="qualidadeEntrega">
                  Qualidade de Entrega (15%)
                  <span className="ml-2 text-xs text-muted-foreground">
                    Peso: 15%
                  </span>
                </Label>
                <Input
                  id="qualidadeEntrega"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...form.register('qualidadeEntrega', { valueAsNumber: true })}
                />
                {form.formState.errors.qualidadeEntrega && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.qualidadeEntrega.message}
                  </p>
                )}
              </div>

              {/* Segurança, Meio Ambiente e Saúde (25%) */}
              <div className="space-y-2">
                <Label htmlFor="segurancaSaude">
                  Segurança, Meio Ambiente e Saúde (25%)
                  <span className="ml-2 text-xs text-muted-foreground">
                    Peso: 25%
                  </span>
                </Label>
                <Input
                  id="segurancaSaude"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...form.register('segurancaSaude', { valueAsNumber: true })}
                />
                {form.formState.errors.segurancaSaude && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.segurancaSaude.message}
                  </p>
                )}
              </div>

              {/* Estoque (10%) */}
              <div className="space-y-2">
                <Label htmlFor="estoque">
                  Estoque (10%)
                  <span className="ml-2 text-xs text-muted-foreground">
                    Peso: 10%
                  </span>
                </Label>
                <Input
                  id="estoque"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...form.register('estoque', { valueAsNumber: true })}
                />
                {form.formState.errors.estoque && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.estoque.message}
                  </p>
                )}
              </div>

              {/* Administração (5%) */}
              <div className="space-y-2">
                <Label htmlFor="administracao">
                  Administração (5%)
                  <span className="ml-2 text-xs text-muted-foreground">
                    Peso: 5%
                  </span>
                </Label>
                <Input
                  id="administracao"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  {...form.register('administracao', { valueAsNumber: true })}
                />
                {form.formState.errors.administracao && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.administracao.message}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="ocorrencias">Ocorrências (afetam a nota)</Label>
              <Textarea
                id="ocorrencias"
                {...form.register('ocorrencias')}
                placeholder="Descreva ocorrências que impactaram negativamente..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Ocorrências como acidentes, atrasos graves, não conformidades, etc.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações Gerais</Label>
              <Textarea
                id="observacoes"
                {...form.register('observacoes')}
                placeholder="Observações adicionais sobre a avaliação..."
                rows={3}
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
                Registrar Avaliação
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}