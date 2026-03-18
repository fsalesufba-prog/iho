'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
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

  // Estados do formulário
  const [precoCondicoes, setPrecoCondicoes] = useState(3)
  const [qualidadeServico, setQualidadeServico] = useState(3)
  const [qualidadeEntrega, setQualidadeEntrega] = useState(3)
  const [segurancaSaude, setSegurancaSaude] = useState(3)
  const [estoque, setEstoque] = useState(3)
  const [administracao, setAdministracao] = useState(3)
  const [ocorrencias, setOcorrencias] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Estados de erro
  const [errors, setErrors] = useState({
    precoCondicoes: '',
    qualidadeServico: '',
    qualidadeEntrega: '',
    segurancaSaude: '',
    estoque: '',
    administracao: '',
  })

  useEffect(() => {
    carregarCentro()
  }, [id])

  useEffect(() => {
    calcularNotaFinal()
  }, [precoCondicoes, qualidadeServico, qualidadeEntrega, segurancaSaude, estoque, administracao])

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
    let total = 0
    
    total += precoCondicoes * pesos.precoCondicoes
    total += qualidadeServico * pesos.qualidadeServico
    total += qualidadeEntrega * pesos.qualidadeEntrega
    total += segurancaSaude * pesos.segurancaSaude
    total += estoque * pesos.estoque
    total += administracao * pesos.administracao

    setNotaFinal(Number(total.toFixed(2)))
  }

  const validate = () => {
    const newErrors = {
      precoCondicoes: '',
      qualidadeServico: '',
      qualidadeEntrega: '',
      segurancaSaude: '',
      estoque: '',
      administracao: '',
    }
    let isValid = true

    if (precoCondicoes < 0 || precoCondicoes > 5) {
      newErrors.precoCondicoes = 'Nota deve ser entre 0 e 5'
      isValid = false
    }
    if (qualidadeServico < 0 || qualidadeServico > 5) {
      newErrors.qualidadeServico = 'Nota deve ser entre 0 e 5'
      isValid = false
    }
    if (qualidadeEntrega < 0 || qualidadeEntrega > 5) {
      newErrors.qualidadeEntrega = 'Nota deve ser entre 0 e 5'
      isValid = false
    }
    if (segurancaSaude < 0 || segurancaSaude > 5) {
      newErrors.segurancaSaude = 'Nota deve ser entre 0 e 5'
      isValid = false
    }
    if (estoque < 0 || estoque > 5) {
      newErrors.estoque = 'Nota deve ser entre 0 e 5'
      isValid = false
    }
    if (administracao < 0 || administracao > 5) {
      newErrors.administracao = 'Nota deve ser entre 0 e 5'
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

      await api.post('/centros-custo/avaliacoes', {
        precoCondicoes,
        qualidadeServico,
        qualidadeEntrega,
        segurancaSaude,
        estoque,
        administracao,
        ocorrencias,
        observacoes,
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
        variant: 'error'
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

      <form onSubmit={onSubmit}>
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
                  value={precoCondicoes}
                  onChange={(e) => setPrecoCondicoes(parseFloat(e.target.value) || 0)}
                  className={errors.precoCondicoes ? 'border-destructive' : ''}
                />
                {errors.precoCondicoes && (
                  <p className="text-xs text-destructive">{errors.precoCondicoes}</p>
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
                  value={qualidadeServico}
                  onChange={(e) => setQualidadeServico(parseFloat(e.target.value) || 0)}
                  className={errors.qualidadeServico ? 'border-destructive' : ''}
                />
                {errors.qualidadeServico && (
                  <p className="text-xs text-destructive">{errors.qualidadeServico}</p>
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
                  value={qualidadeEntrega}
                  onChange={(e) => setQualidadeEntrega(parseFloat(e.target.value) || 0)}
                  className={errors.qualidadeEntrega ? 'border-destructive' : ''}
                />
                {errors.qualidadeEntrega && (
                  <p className="text-xs text-destructive">{errors.qualidadeEntrega}</p>
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
                  value={segurancaSaude}
                  onChange={(e) => setSegurancaSaude(parseFloat(e.target.value) || 0)}
                  className={errors.segurancaSaude ? 'border-destructive' : ''}
                />
                {errors.segurancaSaude && (
                  <p className="text-xs text-destructive">{errors.segurancaSaude}</p>
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
                  value={estoque}
                  onChange={(e) => setEstoque(parseFloat(e.target.value) || 0)}
                  className={errors.estoque ? 'border-destructive' : ''}
                />
                {errors.estoque && (
                  <p className="text-xs text-destructive">{errors.estoque}</p>
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
                  value={administracao}
                  onChange={(e) => setAdministracao(parseFloat(e.target.value) || 0)}
                  className={errors.administracao ? 'border-destructive' : ''}
                />
                {errors.administracao && (
                  <p className="text-xs text-destructive">{errors.administracao}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="ocorrencias">Ocorrências (afetam a nota)</Label>
              <Textarea
                id="ocorrencias"
                value={ocorrencias}
                onChange={(e) => setOcorrencias(e.target.value)}
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
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
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