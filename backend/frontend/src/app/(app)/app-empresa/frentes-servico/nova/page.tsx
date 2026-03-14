'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/Button'

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

import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'

const frenteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  obraId: z.string().min(1, 'Obra é obrigatória'),
})

type FrenteFormData = z.infer<typeof frenteSchema>

export default function NovaFrentePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [obras, setObras] = useState<any[]>([])

  const form = useForm<FrenteFormData>({
    resolver: zodResolver(frenteSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      obraId: '',
    }
  })

  useEffect(() => {
    carregarObras()
  }, [])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { empresaId: user?.empresaId, status: 'ativa', limit: 100 }
      })
      setObras(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as obras',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FrenteFormData) => {
    try {
      setSaving(true)

      await api.post('/frentes-servico', {
        ...data,
        obraId: parseInt(data.obraId),
        empresaId: user?.empresaId,
        status: 'ativa'
      })

      toast({
        title: 'Sucesso',
        description: 'Frente de serviço criada com sucesso'
      })

      router.push('/app-empresa/frentes-servico')
    } catch (error) {
      console.error('Erro ao criar frente de serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a frente de serviço',
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
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-24" />
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
          <h1 className="text-3xl font-bold">Nova Frente de Serviço</h1>
          <p className="text-muted-foreground">
            Cadastre uma nova frente de serviço
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Frente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="obraId">Obra</Label>
              <Select
                value={form.watch('obraId')}
                onValueChange={(value) => form.setValue('obraId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id.toString()}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.obraId && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.obraId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Frente</Label>
              <Input
                id="nome"
                {...form.register('nome')}
                placeholder="Ex: Terraplenagem"
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
                placeholder="Descrição detalhada da frente de serviço..."
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
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Frente
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}