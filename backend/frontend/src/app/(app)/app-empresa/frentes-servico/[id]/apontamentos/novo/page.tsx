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
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'

export default function NovoApontamentoPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [operadores, setOperadores] = useState<any[]>([])
  const [frenteNome, setFrenteNome] = useState('')

  // Estados do formulário
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [equipamentoId, setEquipamentoId] = useState('')
  const [operadorId, setOperadorId] = useState('')
  const [horasInicial, setHorasInicial] = useState(0)
  const [horasFinal, setHorasFinal] = useState(0)
  const [combustivelLitros, setCombustivelLitros] = useState(0)
  const [observacoes, setObservacoes] = useState('')

  // Estados de erro
  const [errors, setErrors] = useState({
    data: '',
    equipamentoId: '',
    horasInicial: '',
    horasFinal: '',
  })

  const horasTrabalhadas = horasFinal - horasInicial

  useEffect(() => {
    carregarDados()
  }, [id])

  const carregarDados = async () => {
    try {
      const [frenteRes, equipamentosRes, operadoresRes] = await Promise.all([
        api.get(`/frentes-servico/${id}`),
        api.get('/equipamentos', {
          params: { empresaId: user?.empresaId, status: 'disponivel,em_uso', limit: 100 }
        }),
        api.get('/usuarios', {
          params: { empresaId: user?.empresaId, tipo: 'apontador,controlador', limit: 100 }
        })
      ])

      setFrenteNome(frenteRes.data.nome)
      setEquipamentos(equipamentosRes.data.data || [])
      setOperadores(operadoresRes.data.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors = {
      data: '',
      equipamentoId: '',
      horasInicial: '',
      horasFinal: '',
    }
    let isValid = true

    if (!data) {
      newErrors.data = 'Data é obrigatória'
      isValid = false
    }

    if (!equipamentoId) {
      newErrors.equipamentoId = 'Equipamento é obrigatório'
      isValid = false
    }

    if (horasInicial < 0) {
      newErrors.horasInicial = 'Horas iniciais devem ser maior ou igual a 0'
      isValid = false
    }

    if (horasFinal < 0) {
      newErrors.horasFinal = 'Horas finais devem ser maior ou igual a 0'
      isValid = false
    }

    if (horasFinal <= horasInicial) {
      newErrors.horasFinal = 'Horas finais devem ser maiores que horas iniciais'
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

      await api.post('/apontamentos', {
        data,
        frenteId: parseInt(id),
        equipamentoId: parseInt(equipamentoId),
        operadorId: operadorId ? parseInt(operadorId) : null,
        horasInicial,
        horasFinal,
        horasTrabalhadas,
        combustivelLitros: combustivelLitros || 0,
        observacoes: observacoes || null,
      })

      toast({
        title: 'Sucesso',
        description: 'Apontamento registrado com sucesso'
      })

      router.push(`/app-empresa/frentes-servico/${id}/apontamentos`)
    } catch (error) {
      console.error('Erro ao criar apontamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o apontamento',
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
            <Skeleton className="h-4 w-24" />
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
          <h1 className="text-3xl font-bold">Novo Apontamento</h1>
          <p className="text-muted-foreground">
            {frenteNome}
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Apontamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className={errors.data ? 'border-destructive' : ''}
              />
              {errors.data && (
                <p className="text-xs text-destructive">{errors.data}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipamentoId">Equipamento</Label>
                <Select value={equipamentoId} onValueChange={setEquipamentoId}>
                  <SelectTrigger className={errors.equipamentoId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipamentos.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id.toString()}>
                        {eq.nome} - {eq.tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.equipamentoId && (
                  <p className="text-xs text-destructive">{errors.equipamentoId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="operadorId">Operador</Label>
                <Select value={operadorId} onValueChange={setOperadorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {operadores.map((op) => (
                      <SelectItem key={op.id} value={op.id.toString()}>
                        {op.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horasInicial">Horas Iniciais</Label>
                <Input
                  id="horasInicial"
                  type="number"
                  value={horasInicial}
                  onChange={(e) => setHorasInicial(parseInt(e.target.value) || 0)}
                  className={errors.horasInicial ? 'border-destructive' : ''}
                />
                {errors.horasInicial && (
                  <p className="text-xs text-destructive">{errors.horasInicial}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="horasFinal">Horas Finais</Label>
                <Input
                  id="horasFinal"
                  type="number"
                  value={horasFinal}
                  onChange={(e) => setHorasFinal(parseInt(e.target.value) || 0)}
                  className={errors.horasFinal ? 'border-destructive' : ''}
                />
                {errors.horasFinal && (
                  <p className="text-xs text-destructive">{errors.horasFinal}</p>
                )}
              </div>
            </div>

            {horasTrabalhadas > 0 && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">
                  Horas trabalhadas: <span className="font-bold">{horasTrabalhadas}h</span>
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="combustivelLitros">Combustível (Litros)</Label>
              <Input
                id="combustivelLitros"
                type="number"
                step="0.1"
                value={combustivelLitros}
                onChange={(e) => setCombustivelLitros(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Opcional - quantidade de combustível abastecida/utilizada
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações sobre o apontamento..."
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
                Registrando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Registrar Apontamento
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}