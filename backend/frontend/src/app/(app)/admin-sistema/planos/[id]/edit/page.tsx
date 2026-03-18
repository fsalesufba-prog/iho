'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Info,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

export default function EditarPlanoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados do formulário
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valorImplantacao, setValorImplantacao] = useState(0)
  const [valorMensal, setValorMensal] = useState(0)
  const [limiteAdm, setLimiteAdm] = useState(0)
  const [limiteControlador, setLimiteControlador] = useState(0)
  const [limiteApontador, setLimiteApontador] = useState(0)
  const [limiteEquipamentos, setLimiteEquipamentos] = useState(0)
  const [status, setStatus] = useState('ativo')

  const [recursos, setRecursos] = useState<string[]>([])
  const [novoRecurso, setNovoRecurso] = useState('')

  // Estados de erro
  const [errors, setErrors] = useState({
    nome: '',
    descricao: '',
    valorImplantacao: '',
    valorMensal: '',
    limiteAdm: '',
    limiteControlador: '',
    limiteApontador: '',
    limiteEquipamentos: '',
  })

  useEffect(() => {
    carregarPlano()
  }, [id])

  const carregarPlano = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/planos/${id}`)
      const plano = response.data

      setNome(plano.nome || '')
      setDescricao(plano.descricao || '')
      setValorImplantacao(plano.valorImplantacao || 0)
      setValorMensal(plano.valorMensal || 0)
      setLimiteAdm(plano.limiteAdm || 0)
      setLimiteControlador(plano.limiteControlador || 0)
      setLimiteApontador(plano.limiteApontador || 0)
      setLimiteEquipamentos(plano.limiteEquipamentos || 0)
      setStatus(plano.status || 'ativo')

      setRecursos(Array.isArray(plano.recursos) ? plano.recursos : JSON.parse(plano.recursos || '[]'))
    } catch (error) {
      console.error('Erro ao carregar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o plano',
        variant: 'error'
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

  const validate = () => {
    const newErrors = {
      nome: '',
      descricao: '',
      valorImplantacao: '',
      valorMensal: '',
      limiteAdm: '',
      limiteControlador: '',
      limiteApontador: '',
      limiteEquipamentos: '',
    }
    let isValid = true

    if (!nome) {
      newErrors.nome = 'Nome é obrigatório'
      isValid = false
    }
    if (!descricao) {
      newErrors.descricao = 'Descrição é obrigatória'
      isValid = false
    }
    if (valorImplantacao < 0) {
      newErrors.valorImplantacao = 'Valor deve ser maior ou igual a 0'
      isValid = false
    }
    if (valorMensal < 0) {
      newErrors.valorMensal = 'Valor deve ser maior ou igual a 0'
      isValid = false
    }
    if (limiteAdm < 0) {
      newErrors.limiteAdm = 'Limite deve ser maior ou igual a 0'
      isValid = false
    }
    if (limiteControlador < 0) {
      newErrors.limiteControlador = 'Limite deve ser maior ou igual a 0'
      isValid = false
    }
    if (limiteApontador < 0) {
      newErrors.limiteApontador = 'Limite deve ser maior ou igual a 0'
      isValid = false
    }
    if (limiteEquipamentos < 0) {
      newErrors.limiteEquipamentos = 'Limite deve ser maior ou igual a 0'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setSaving(true)

      await api.put(`/planos/${id}`, {
        nome,
        descricao,
        valorImplantacao,
        valorMensal,
        limiteAdm,
        limiteControlador,
        limiteApontador,
        limiteEquipamentos,
        status,
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
          <p className="text-muted-foreground">{nome}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Plano</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Start, Pro, Enterprise..."
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
                placeholder="Descrição do plano"
                rows={3}
              />
              {errors.descricao && (
                <p className="text-xs text-destructive">{errors.descricao}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valorImplantacao">Valor de Implantação (R$)</Label>
                <Input
                  id="valorImplantacao"
                  type="number"
                  step="0.01"
                  value={valorImplantacao}
                  onChange={(e) => setValorImplantacao(parseFloat(e.target.value) || 0)}
                />
                {errors.valorImplantacao && (
                  <p className="text-xs text-destructive">{errors.valorImplantacao}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="valorMensal">Valor Mensal (R$)</Label>
                <Input
                  id="valorMensal"
                  type="number"
                  step="0.01"
                  value={valorMensal}
                  onChange={(e) => setValorMensal(parseFloat(e.target.value) || 0)}
                />
                {errors.valorMensal && (
                  <p className="text-xs text-destructive">{errors.valorMensal}</p>
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
                    value={limiteAdm}
                    onChange={(e) => setLimiteAdm(parseInt(e.target.value) || 0)}
                  />
                  {errors.limiteAdm && (
                    <p className="text-xs text-destructive">{errors.limiteAdm}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limiteControlador">Controladores</Label>
                  <Input
                    id="limiteControlador"
                    type="number"
                    value={limiteControlador}
                    onChange={(e) => setLimiteControlador(parseInt(e.target.value) || 0)}
                  />
                  {errors.limiteControlador && (
                    <p className="text-xs text-destructive">{errors.limiteControlador}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limiteApontador">Apontadores</Label>
                  <Input
                    id="limiteApontador"
                    type="number"
                    value={limiteApontador}
                    onChange={(e) => setLimiteApontador(parseInt(e.target.value) || 0)}
                  />
                  {errors.limiteApontador && (
                    <p className="text-xs text-destructive">{errors.limiteApontador}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limiteEquipamentos">Equipamentos</Label>
                  <Input
                    id="limiteEquipamentos"
                    type="number"
                    value={limiteEquipamentos}
                    onChange={(e) => setLimiteEquipamentos(parseInt(e.target.value) || 0)}
                  />
                  {errors.limiteEquipamentos && (
                    <p className="text-xs text-destructive">{errors.limiteEquipamentos}</p>
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
                checked={status === 'ativo'}
                onCheckedChange={(checked) => setStatus(checked ? 'ativo' : 'inativo')}
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