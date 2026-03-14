'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
<<<<<<< HEAD
import Link from 'next/link'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
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
<<<<<<< HEAD
import { useAuth } from '@/components/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'

const frenteSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  status: z.enum(['ativa', 'inativa', 'concluida']),
})

type FrenteFormData = z.infer<typeof frenteSchema>

export default function EditarFrentePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<FrenteFormData>({
    resolver: zodResolver(frenteSchema),
    defaultValues: {
      nome: '',
      descricao: '',
      status: 'ativa',
    }
  })

  useEffect(() => {
    carregarFrente()
  }, [id])

  const carregarFrente = async () => {
    try {
      const response = await api.get(`/frentes-servico/${id}`)
      const frente = response.data

      form.reset({
        nome: frente.nome,
        descricao: frente.descricao || '',
        status: frente.status,
      })
    } catch (error) {
      console.error('Erro ao carregar frente de serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a frente de serviço',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
      router.push('/app-empresa/frentes-servico')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FrenteFormData) => {
    try {
      setSaving(true)

      await api.put(`/frentes-servico/${id}`, data)

      toast({
        title: 'Sucesso',
        description: 'Frente de serviço atualizada com sucesso'
      })

      router.push(`/app-empresa/frentes-servico/${id}`)
    } catch (error) {
      console.error('Erro ao atualizar frente de serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a frente de serviço',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
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
          <h1 className="text-3xl font-bold">Editar Frente de Serviço</h1>
          <p className="text-muted-foreground">
            {form.watch('nome')}
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
                  <SelectItem value="inativa">Inativa</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                </SelectContent>
              </Select>
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