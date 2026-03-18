'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
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

export default function NovaFrentePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [obras, setObras] = useState<any[]>([])

  // Estados do formulário
  const [obraId, setObraId] = useState('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')

  // Estados de erro
  const [errors, setErrors] = useState({
    obraId: '',
    nome: '',
  })

  useEffect(() => {
    carregarObras()
  }, [])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { empresaId: user?.empresaId, status: 'ativa', limit: 100 }
      })
      setObras(response.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as obras',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors = {
      obraId: '',
      nome: '',
    }
    let isValid = true

    if (!obraId) {
      newErrors.obraId = 'Obra é obrigatória'
      isValid = false
    }

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

      await api.post('/frentes-servico', {
        nome,
        descricao,
        obraId: parseInt(obraId),
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

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Frente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="obraId">Obra</Label>
              <Select value={obraId} onValueChange={setObraId}>
                <SelectTrigger className={errors.obraId ? 'border-destructive' : ''}>
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
              {errors.obraId && (
                <p className="text-xs text-destructive">{errors.obraId}</p>
              )}
            </div>

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