'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  TrendingUp,
  Plus,
  X,
  Package,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

type TipoItem = 'servico' | 'peca' | 'insumo'

interface Item {
  descricao: string
  quantidade: number
  valorUnitario?: number | null
  tipo: TipoItem
}

interface Equipamento {
  id: number
  tag: string
  nome: string
  modelo: string
  horaAtual: number
  status: string
}

export default function NovaManutencaoPreditivaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [itens, setItens] = useState<Item[]>([])

  // Estados do formulário
  const [equipamentoId, setEquipamentoId] = useState<number | null>(null)
  const [dataProgramada, setDataProgramada] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [descricao, setDescricao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [horasEquipamento, setHorasEquipamento] = useState(0)
  const [confiabilidade, setConfiabilidade] = useState(85)

  // Estados para novo item
  const [novoItemDescricao, setNovoItemDescricao] = useState('')
  const [novoItemQuantidade, setNovoItemQuantidade] = useState<number | null>(null)
  const [novoItemValor, setNovoItemValor] = useState<number | null>(null)
  const [novoItemTipo, setNovoItemTipo] = useState<TipoItem>('servico')

  // Estados de erro
  const [errors, setErrors] = useState({
    equipamentoId: '',
    dataProgramada: '',
    descricao: '',
    confiabilidade: '',
  })

  useEffect(() => {
    carregarEquipamentos()
  }, [])

  useEffect(() => {
    if (equipamentoId) {
      const equipamento = equipamentos.find(e => e.id === equipamentoId)
      if (equipamento) {
        setHorasEquipamento(equipamento.horaAtual)
      }
    }
  }, [equipamentoId, equipamentos])

  const carregarEquipamentos = async () => {
    try {
      const response = await api.get('/equipamentos', {
        params: { limit: 100 }
      })
      setEquipamentos(response.data.equipamentos || [])
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error)
    }
  }

  const adicionarItem = () => {
    if (!novoItemDescricao || !novoItemQuantidade) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha a descrição e quantidade do item.',
        variant: 'destructive'
      })
      return
    }

    const item: Item = {
      descricao: novoItemDescricao,
      quantidade: novoItemQuantidade,
      valorUnitario: novoItemValor || null,
      tipo: novoItemTipo
    }

    setItens([...itens, item])
    setNovoItemDescricao('')
    setNovoItemQuantidade(null)
    setNovoItemValor(null)
    setNovoItemTipo('servico')
  }

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const calcularCustoTotal = () => {
    return itens.reduce((total, item) => {
      return total + (item.valorUnitario || 0) * item.quantidade
    }, 0)
  }

  const validate = () => {
    const newErrors = {
      equipamentoId: '',
      dataProgramada: '',
      descricao: '',
      confiabilidade: '',
    }
    let isValid = true

    if (!equipamentoId) {
      newErrors.equipamentoId = 'Selecione um equipamento'
      isValid = false
    }

    if (!dataProgramada) {
      newErrors.dataProgramada = 'Data prevista é obrigatória'
      isValid = false
    }

    if (!descricao) {
      newErrors.descricao = 'Descrição é obrigatória'
      isValid = false
    }

    if (confiabilidade < 0 || confiabilidade > 100) {
      newErrors.confiabilidade = 'Confiabilidade deve ser entre 0 e 100'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const getPrioridade = () => {
    if (confiabilidade < 60) return 'alta'
    if (confiabilidade < 80) return 'media'
    return 'baixa'
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setSaving(true)
      
      const payload = {
        equipamentoId,
        dataProgramada,
        descricao,
        observacoes: observacoes || null,
        horasEquipamento,
        confiabilidade,
        tipo: 'preditiva',
        custo: calcularCustoTotal(),
        status: 'programada',
        prioridade: getPrioridade(),
        itens
      }

      await api.post('/manutencoes', payload)
      
      toast({
        title: 'Análise criada',
        description: 'A análise preditiva foi registrada com sucesso.'
      })

      router.push('/app-empresa/manutencao/preditiva')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar',
        description: error.response?.data?.error || 'Não foi possível criar a análise.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Nova Análise Preditiva" />
        
        <Container size="xl" className="py-8">
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Dados da Análise */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Análise Preditiva
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="equipamentoId">Equipamento *</Label>
                      <Select 
                        value={equipamentoId?.toString() || ''} 
                        onValueChange={(value) => setEquipamentoId(value ? parseInt(value) : null)}
                      >
                        <SelectTrigger className={errors.equipamentoId ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Selecione o equipamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipamentos.map(equip => (
                            <SelectItem key={equip.id} value={equip.id.toString()}>
                              {equip.tag} - {equip.nome} ({equip.horaAtual}h)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.equipamentoId && (
                        <p className="text-sm text-destructive">{errors.equipamentoId}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataProgramada">Data Prevista *</Label>
                      <Input
                        id="dataProgramada"
                        type="date"
                        value={dataProgramada}
                        onChange={(e) => setDataProgramada(e.target.value)}
                        className={errors.dataProgramada ? 'border-destructive' : ''}
                      />
                      {errors.dataProgramada && (
                        <p className="text-sm text-destructive">{errors.dataProgramada}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confiabilidade">Índice de Confiabilidade (%) *</Label>
                      <Input
                        id="confiabilidade"
                        type="number"
                        min="0"
                        max="100"
                        value={confiabilidade}
                        onChange={(e) => setConfiabilidade(parseInt(e.target.value) || 0)}
                        className={errors.confiabilidade ? 'border-destructive' : ''}
                      />
                      <p className="text-xs text-muted-foreground">
                        {confiabilidade < 60 ? 'Crítico - Intervenção imediata' :
                         confiabilidade < 80 ? 'Atenção - Monitorar' :
                         'Bom - Operação normal'}
                      </p>
                      {errors.confiabilidade && (
                        <p className="text-sm text-destructive">{errors.confiabilidade}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horasEquipamento">Horas Atuais</Label>
                      <Input
                        id="horasEquipamento"
                        type="number"
                        value={horasEquipamento}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Recomendação *</Label>
                      <Textarea
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Descreva a recomendação baseada na análise preditiva..."
                        className={`min-h-[100px] ${errors.descricao ? 'border-destructive' : ''}`}
                      />
                      {errors.descricao && (
                        <p className="text-sm text-destructive">{errors.descricao}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="observacoes">Observações Técnicas</Label>
                      <Textarea
                        id="observacoes"
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Dados da análise, parâmetros monitorados..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Itens da Manutenção */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Itens Recomendados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {itens.length > 0 && (
                      <div className="space-y-2">
                        {itens.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.descricao}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantidade}x {item.tipo} - 
                                {item.valorUnitario ? ` R$ ${item.valorUnitario.toFixed(2)}` : 'Sem valor'}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removerItem(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input
                        placeholder="Descrição do item"
                        value={novoItemDescricao}
                        onChange={(e) => setNovoItemDescricao(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Quantidade"
                        value={novoItemQuantidade || ''}
                        onChange={(e) => setNovoItemQuantidade(e.target.value ? parseInt(e.target.value) : null)}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Valor unitário"
                        value={novoItemValor || ''}
                        onChange={(e) => setNovoItemValor(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                      <Select value={novoItemTipo} onValueChange={(value: TipoItem) => setNovoItemTipo(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="servico">Serviço</SelectItem>
                          <SelectItem value="peca">Peça</SelectItem>
                          <SelectItem value="insumo">Insumo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={adicionarItem}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Item
                    </Button>

                    {itens.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Custo total estimado:</span>
                          <span className="text-xl font-bold text-primary">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(calcularCustoTotal())}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Ações */}
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Registrar Análise
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </Container>
      </main>
    </>
  )
}