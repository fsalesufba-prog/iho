'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
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
import { api } from '@/lib/api'

type Status = 'ativa' | 'inativa' | 'concluida'

export default function EditarFrentePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados do formulário
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [status, setStatus] = useState<Status>('ativa')

  // Estados de erro
  const [errors, setErrors] = useState({
    nome: '',
  })

  useEffect(() => {
    carregarFrente()
  }, [id])

  const carregarFrente = async () => {
    try {
      const response = await api.get(`/frentes-servico/${id}`)
      const frente = response.data

      setNome(frente.nome || '')
      setDescricao(frente.descricao || '')
      setStatus(frente.status || 'ativa')
    } catch (error) {
      console.error('Erro ao carregar frente de serviço:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a frente de serviço',
        variant: 'error'
      })
      router.push('/app-empresa/frentes-servico')
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors = {
      nome: '',
    }
    let isValid = true

    if (!nome) {
      newErrors.nome = 'Nome é obrigatório'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setSaving(true)

      await api.put(`/frentes-servico/${id}`, {
        nome,
        descricao,
        status,
      })

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
        variant: 'error'
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
          <p className="text-muted-foreground">{nome}</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Frente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Frente</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Terraplenagem"
                className={errors.nome ? 'border-destructive' : ''}
              />
              {errors.nome && (
                <p className="text-xs text-destructive">{errors.nome}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição detalhada da frente de serviço..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: Status) => setStatus(value)}>
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