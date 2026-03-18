'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Plus,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

export default function NovoPlanoPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  
  // Estados do formulário
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valorImplantacao, setValorImplantacao] = useState(3000)
  const [valorMensal, setValorMensal] = useState(0)
  const [limiteAdm, setLimiteAdm] = useState(1)
  const [limiteControlador, setLimiteControlador] = useState(2)
  const [limiteApontador, setLimiteApontador] = useState(2)
  const [limiteEquipamentos, setLimiteEquipamentos] = useState(25)
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

      await api.post('/planos', {
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
        description: 'Plano criado com sucesso'
      })

      router.push('/admin-sistema/planos')
    } catch (error) {
      console.error('Erro ao criar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o plano',
        variant: 'error'
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