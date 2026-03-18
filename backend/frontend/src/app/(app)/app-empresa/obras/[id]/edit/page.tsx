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
import { masks } from '@/lib/masks'

type Status = 'ativa' | 'paralisada' | 'concluida' | 'cancelada'

export default function EditarObraPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados do formulário
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [cep, setCep] = useState('')
  const [status, setStatus] = useState<Status>('ativa')
  const [dataInicio, setDataInicio] = useState('')
  const [dataPrevisaoTermino, setDataPrevisaoTermino] = useState('')
  const [valor, setValor] = useState(0)
  const [observacoes, setObservacoes] = useState('')

  // Estados de erro
  const [errors, setErrors] = useState({
    nome: '',
    codigo: '',
    cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
  })

  useEffect(() => {
    carregarObra()
  }, [id])

  const carregarObra = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/obras/${id}`)
      const obra = response.data

      setNome(obra.nome || '')
      setCodigo(obra.codigo || '')
      setCnpj(obra.cnpj || '')
      setEndereco(obra.endereco || '')
      setCidade(obra.cidade || '')
      setEstado(obra.estado || '')
      setCep(obra.cep || '')
      setStatus(obra.status || 'ativa')
      setDataInicio(obra.dataInicio?.split('T')[0] || '')
      setDataPrevisaoTermino(obra.dataPrevisaoTermino?.split('T')[0] || '')
      setValor(obra.valor || 0)
      setObservacoes(obra.observacoes || '')
    } catch (error) {
      console.error('Erro ao carregar obra:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a obra',
        variant: 'error'
      })
      router.push('/app-empresa/obras')
    } finally {
      setLoading(false)
    }
  }

  const validate = () => {
    const newErrors = {
      nome: '',
      codigo: '',
      cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
    }
    let isValid = true

    if (!nome) {
      newErrors.nome = 'Nome da obra é obrigatório'
      isValid = false
    }

    if (!codigo) {
      newErrors.codigo = 'Código é obrigatório'
      isValid = false
    }

    if (!cnpj || cnpj.replace(/\D/g, '').length < 14) {
      newErrors.cnpj = 'CNPJ inválido'
      isValid = false
    }

    if (!endereco) {
      newErrors.endereco = 'Endereço é obrigatório'
      isValid = false
    }

    if (!cidade) {
      newErrors.cidade = 'Cidade é obrigatória'
      isValid = false
    }

    if (!estado || estado.length !== 2) {
      newErrors.estado = 'Estado deve ter 2 caracteres'
      isValid = false
    }

    if (!cep || cep.replace(/\D/g, '').length < 8) {
      newErrors.cep = 'CEP inválido'
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

      await api.put(`/obras/${id}`, {
        nome,
        codigo,
        cnpj: cnpj.replace(/\D/g, ''),
        endereco,
        cidade,
        estado,
        cep: cep.replace(/\D/g, ''),
        status,
        dataInicio: dataInicio || null,
        dataPrevisaoTermino: dataPrevisaoTermino || null,
        valor,
        observacoes: observacoes || null,
        empresaId: user?.empresaId,
      })

      toast({
        title: 'Sucesso',
        description: 'Obra atualizada com sucesso'
      })

      router.push(`/app-empresa/obras/${id}`)
    } catch (error) {
      console.error('Erro ao atualizar obra:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a obra',
        variant: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  ]

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
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
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
          <h1 className="text-3xl font-bold">Editar Obra</h1>
          <p className="text-muted-foreground">{nome}</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Obra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Obra</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Edifício Comercial"
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
                  placeholder="Ex: OB-001"
                  className={errors.codigo ? 'border-destructive' : ''}
                />
                {errors.codigo && (
                  <p className="text-xs text-destructive">{errors.codigo}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(masks.cnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className={errors.cnpj ? 'border-destructive' : ''}
              />
              {errors.cnpj && (
                <p className="text-xs text-destructive">{errors.cnpj}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Rua, número, complemento"
                className={errors.endereco ? 'border-destructive' : ''}
              />
              {errors.endereco && (
                <p className="text-xs text-destructive">{errors.endereco}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade"
                  className={errors.cidade ? 'border-destructive' : ''}
                />
                {errors.cidade && (
                  <p className="text-xs text-destructive">{errors.cidade}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">UF</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger className={errors.estado ? 'border-destructive' : ''}>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.estado && (
                  <p className="text-xs text-destructive">{errors.estado}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={cep}
                  onChange={(e) => setCep(masks.cep(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                  className={errors.cep ? 'border-destructive' : ''}
                />
                {errors.cep && (
                  <p className="text-xs text-destructive">{errors.cep}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPrevisaoTermino">Previsão de Término</Label>
                <Input
                  id="dataPrevisaoTermino"
                  type="date"
                  value={dataPrevisaoTermino}
                  onChange={(e) => setDataPrevisaoTermino(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor da Obra (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={valor}
                onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
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
                  <SelectItem value="paralisada">Paralisada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações adicionais sobre a obra..."
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