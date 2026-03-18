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
import { Switch } from '@/components/ui/Switch'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'
import { masks } from '@/lib/masks'

export default function EditarCentroCustoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [obras, setObras] = useState<any[]>([])

  // Estados do formulário
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [obraId, setObraId] = useState('')
  const [contato, setContato] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [endereco, setEndereco] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [ativo, setAtivo] = useState(true)

  // Estados de erro
  const [errors, setErrors] = useState({
    nome: '',
    codigo: '',
    email: '',
  })

  useEffect(() => {
    carregarObras()
    carregarCentro()
  }, [id])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { empresaId: user?.empresaId, status: 'ativa', limit: 100 }
      })
      setObras(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const carregarCentro = async () => {
    try {
      const response = await api.get(`/centros-custo/${id}`)
      const centro = response.data

      setNome(centro.nome || '')
      setCodigo(centro.codigo || '')
      setObraId(centro.obraId?.toString() || '')
      setContato(centro.contato || '')
      setTelefone(centro.telefone || '')
      setEmail(centro.email || '')
      setEndereco(centro.endereco || '')
      setObservacoes(centro.observacoes || '')
      setAtivo(centro.status === 'ativo')
    } catch (error) {
      console.error('Erro ao carregar centro de custo:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o centro de custo',
        variant: 'error'
      })
      router.push('/app-empresa/centros-custo')
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors = {
      nome: '',
      codigo: '',
      email: '',
    }
    let isValid = true

    if (!nome) {
      newErrors.nome = 'Nome é obrigatório'
      isValid = false
    }

    if (!codigo) {
      newErrors.codigo = 'Código é obrigatório'
      isValid = false
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-mail inválido'
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

      await api.put(`/centros-custo/${id}`, {
        nome,
        codigo,
        obraId: obraId ? parseInt(obraId) : null,
        contato,
        telefone,
        email,
        endereco,
        observacoes,
        status: ativo ? 'ativo' : 'inativo'
      })

      toast({
        title: 'Sucesso',
        description: 'Centro de custo atualizado com sucesso'
      })

      router.push(`/app-empresa/centros-custo/${id}`)
    } catch (error) {
      console.error('Erro ao atualizar centro de custo:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o centro de custo',
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
          <h1 className="text-3xl font-bold">Editar Centro de Custo</h1>
          <p className="text-muted-foreground">{nome}</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Centro de Custo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome / Razão Social</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Nome do fornecedor"
                  className={errors.nome ? 'border-destructive' : ''}
                />
                {errors.nome && (
                  <p className="text-xs text-destructive">{errors.nome}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="Ex: FORN-001"
                  className={errors.codigo ? 'border-destructive' : ''}
                />
                {errors.codigo && (
                  <p className="text-xs text-destructive">{errors.codigo}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="obraId">Obra (opcional)</Label>
              <Select value={obraId} onValueChange={setObraId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma obra" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id.toString()}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contato">Nome do Contato</Label>
                <Input
                  id="contato"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  placeholder="Pessoa de contato"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(masks.phone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@fornecedor.com"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Endereço completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações adicionais..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={ativo}
                onCheckedChange={setAtivo}
              />
              <Label htmlFor="ativo">Centro de custo ativo</Label>
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