'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  MapPin,
  Wrench,
  AlertCircle,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Textarea } from '@/components/ui/Textarea'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { useToast } from '@/components/ui/use-toast'
import { useEmpresa } from '@/hooks/useEmpresa'
import { api } from '@/lib/api'

type Status = 'disponivel' | 'em_uso' | 'manutencao' | 'inativo'

interface Obra {
  id: number
  nome: string
  codigo: string
}

interface FrenteServico {
  id: number
  nome: string
  obraId: number
}

interface CentroCusto {
  id: number
  nome: string
  codigo: string
}

export default function NovoEquipamentoPage() {
  const router = useRouter()
  const { empresa } = useEmpresa()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [obras, setObras] = useState<Obra[]>([])
  const [frentesServico, setFrentesServico] = useState<FrenteServico[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])
  const [limites, setLimites] = useState<{ atual: number; maximo: number; disponivel: number } | null>(null)

  // Estados do formulário
  const [tag, setTag] = useState('')
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [anoFabricacao, setAnoFabricacao] = useState(new Date().getFullYear())
  const [numeroSerie, setNumeroSerie] = useState('')
  const [placa, setPlaca] = useState('')
  const [status, setStatus] = useState<Status>('disponivel')
  const [obraId, setObraId] = useState<number | null>(null)
  const [frenteServicoId, setFrenteServicoId] = useState<number | null>(null)
  const [centroCustoId, setCentroCustoId] = useState<number | null>(null)
  const [horaAtual, setHoraAtual] = useState(0)
  const [kmAtual, setKmAtual] = useState<number | null>(null)
  const [valorAquisicao, setValorAquisicao] = useState<number | null>(null)
  const [dataAquisicao, setDataAquisicao] = useState('')
  const [vidaUtilAnos, setVidaUtilAnos] = useState(5)
  const [valorResidual, setValorResidual] = useState(0)
  const [valorLocacaoDiaria, setValorLocacaoDiaria] = useState<number | null>(null)
  const [valorLocacaoMensal, setValorLocacaoMensal] = useState<number | null>(null)
  const [comOperador, setComOperador] = useState(false)
  const [planoManutencao, setPlanoManutencao] = useState('')

  // Estados de erro
  const [errors, setErrors] = useState({
    tag: '',
    nome: '',
    tipo: '',
    marca: '',
    modelo: '',
    anoFabricacao: '',
    numeroSerie: '',
  })

  useEffect(() => {
    carregarObras()
    carregarCentrosCusto()
    verificarLimites()
  }, [])

  useEffect(() => {
    if (obraId) {
      carregarFrentesServico(obraId)
    } else {
      setFrentesServico([])
      setFrenteServicoId(null)
    }
  }, [obraId])

  const carregarObras = async () => {
    try {
      const response = await api.get('/obras', {
        params: { limit: 100, status: 'ativa' }
      })
      setObras(response.data.obras || [])
    } catch (error) {
      console.error('Erro ao carregar obras:', error)
    }
  }

  const carregarFrentesServico = async (obraId: number) => {
    try {
      const response = await api.get('/frentes-servico', {
        params: { obraId, limit: 100 }
      })
      setFrentesServico(response.data.frentes || [])
    } catch (error) {
      console.error('Erro ao carregar frentes de serviço:', error)
    }
  }

  const carregarCentrosCusto = async () => {
    try {
      const response = await api.get('/centros-custo', {
        params: { limit: 100 }
      })
      setCentrosCusto(response.data.centros || [])
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error)
    }
  }

  const verificarLimites = async () => {
    try {
      if (!empresa?.id) return
      const response = await api.get(`/empresas/${empresa.id}/limites/equipamentos`)
      setLimites(response.data)
    } catch (error) {
      console.error('Erro ao verificar limites:', error)
    }
  }

  const validate = () => {
    const newErrors = {
      tag: '',
      nome: '',
      tipo: '',
      marca: '',
      modelo: '',
      anoFabricacao: '',
      numeroSerie: '',
    }
    let isValid = true

    if (!tag) {
      newErrors.tag = 'Tag é obrigatória'
      isValid = false
    }

    if (!nome) {
      newErrors.nome = 'Nome é obrigatório'
      isValid = false
    }

    if (!tipo) {
      newErrors.tipo = 'Tipo é obrigatório'
      isValid = false
    }

    if (!marca) {
      newErrors.marca = 'Marca é obrigatória'
      isValid = false
    }

    if (!modelo) {
      newErrors.modelo = 'Modelo é obrigatório'
      isValid = false
    }

    if (anoFabricacao < 1900 || anoFabricacao > new Date().getFullYear()) {
      newErrors.anoFabricacao = 'Ano de fabricação inválido'
      isValid = false
    }

    if (!numeroSerie) {
      newErrors.numeroSerie = 'Número de série é obrigatório'
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

      const payload = {
        tag,
        nome,
        tipo,
        marca,
        modelo,
        anoFabricacao,
        numeroSerie,
        placa: placa || null,
        status,
        obraId: obraId || null,
        frenteServicoId: frenteServicoId || null,
        centroCustoId: centroCustoId || null,
        horaAtual,
        kmAtual: kmAtual || null,
        valorAquisicao: valorAquisicao || null,
        dataAquisicao: dataAquisicao || null,
        vidaUtilAnos,
        valorResidual,
        valorLocacaoDiaria: valorLocacaoDiaria || null,
        valorLocacaoMensal: valorLocacaoMensal || null,
        comOperador,
        planoManutencao: planoManutencao || null,
      }

      await api.post('/equipamentos', payload)
      
      toast({
        title: 'Equipamento criado',
        description: 'O equipamento foi criado com sucesso.'
      })

      router.push('/app-empresa/equipamentos')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar',
        description: error.response?.data?.error || 'Não foi possível criar o equipamento.',
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
        <Header title="Novo Equipamento" />
        
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

          {limites && limites.disponivel <= 0 && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Você atingiu o limite de equipamentos do seu plano ({limites.atual}/{limites.maximo}).
                Para adicionar mais equipamentos, faça um upgrade do seu plano.
              </AlertDescription>
            </Alert>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Identificação */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Identificação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tag">Tag *</Label>
                      <Input
                        id="tag"
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                        placeholder="Ex: EQ-001"
                        className={errors.tag ? 'border-destructive' : ''}
                      />
                      {errors.tag && (
                        <p className="text-sm text-destructive">{errors.tag}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Caminhão Caçamba"
                        className={errors.nome ? 'border-destructive' : ''}
                      />
                      {errors.nome && (
                        <p className="text-sm text-destructive">{errors.nome}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Input
                        id="tipo"
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        placeholder="Ex: Caminhão, Escavadeira..."
                        className={errors.tipo ? 'border-destructive' : ''}
                      />
                      {errors.tipo && (
                        <p className="text-sm text-destructive">{errors.tipo}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="marca">Marca *</Label>
                      <Input
                        id="marca"
                        value={marca}
                        onChange={(e) => setMarca(e.target.value)}
                        placeholder="Ex: Volvo"
                        className={errors.marca ? 'border-destructive' : ''}
                      />
                      {errors.marca && (
                        <p className="text-sm text-destructive">{errors.marca}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modelo">Modelo *</Label>
                      <Input
                        id="modelo"
                        value={modelo}
                        onChange={(e) => setModelo(e.target.value)}
                        placeholder="Ex: FH 540"
                        className={errors.modelo ? 'border-destructive' : ''}
                      />
                      {errors.modelo && (
                        <p className="text-sm text-destructive">{errors.modelo}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="anoFabricacao">Ano de Fabricação *</Label>
                      <Input
                        id="anoFabricacao"
                        type="number"
                        value={anoFabricacao}
                        onChange={(e) => setAnoFabricacao(parseInt(e.target.value) || new Date().getFullYear())}
                        placeholder="2024"
                        className={errors.anoFabricacao ? 'border-destructive' : ''}
                      />
                      {errors.anoFabricacao && (
                        <p className="text-sm text-destructive">{errors.anoFabricacao}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numeroSerie">Número de Série *</Label>
                      <Input
                        id="numeroSerie"
                        value={numeroSerie}
                        onChange={(e) => setNumeroSerie(e.target.value)}
                        placeholder="Ex: 9BWHE21JX24060971"
                        className={errors.numeroSerie ? 'border-destructive' : ''}
                      />
                      {errors.numeroSerie && (
                        <p className="text-sm text-destructive">{errors.numeroSerie}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="placa">Placa</Label>
                      <Input
                        id="placa"
                        value={placa}
                        onChange={(e) => setPlaca(e.target.value)}
                        placeholder="Ex: ABC-1234"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status e Localização */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Status e Localização
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select value={status} onValueChange={(value: Status) => setStatus(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="disponivel">Disponível</SelectItem>
                            <SelectItem value="em_uso">Em Uso</SelectItem>
                            <SelectItem value="manutencao">Em Manutenção</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="obraId">Obra</Label>
                        <Select
                          value={obraId?.toString() || ''}
                          onValueChange={(value) => setObraId(value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a obra" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhuma</SelectItem>
                            {obras.map(obra => (
                              <SelectItem key={obra.id} value={obra.id.toString()}>
                                {obra.nome} - {obra.codigo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {obraId && (
                        <div className="space-y-2">
                          <Label htmlFor="frenteServicoId">Frente de Serviço</Label>
                          <Select
                            value={frenteServicoId?.toString() || ''}
                            onValueChange={(value) => setFrenteServicoId(value ? parseInt(value) : null)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frente" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">Nenhuma</SelectItem>
                              {frentesServico.map(frente => (
                                <SelectItem key={frente.id} value={frente.id.toString()}>
                                  {frente.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="centroCustoId">Centro de Custo</Label>
                        <Select
                          value={centroCustoId?.toString() || ''}
                          onValueChange={(value) => setCentroCustoId(value ? parseInt(value) : null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o centro" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Nenhum</SelectItem>
                            {centrosCusto.map(centro => (
                              <SelectItem key={centro.id} value={centro.id.toString()}>
                                {centro.nome} - {centro.codigo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="horaAtual">Horímetro Atual (h)</Label>
                          <Input
                            id="horaAtual"
                            type="number"
                            value={horaAtual}
                            onChange={(e) => setHoraAtual(parseInt(e.target.value) || 0)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="kmAtual">KM Atual</Label>
                          <Input
                            id="kmAtual"
                            type="number"
                            value={kmAtual || ''}
                            onChange={(e) => setKmAtual(e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valorAquisicao">Valor de Aquisição (R$)</Label>
                      <Input
                        id="valorAquisicao"
                        type="number"
                        step="0.01"
                        value={valorAquisicao || ''}
                        onChange={(e) => setValorAquisicao(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataAquisicao">Data de Aquisição</Label>
                      <Input
                        id="dataAquisicao"
                        type="date"
                        value={dataAquisicao}
                        onChange={(e) => setDataAquisicao(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vidaUtilAnos">Vida Útil (anos)</Label>
                      <Input
                        id="vidaUtilAnos"
                        type="number"
                        value={vidaUtilAnos}
                        onChange={(e) => setVidaUtilAnos(parseInt(e.target.value) || 5)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorResidual">Valor Residual (R$)</Label>
                      <Input
                        id="valorResidual"
                        type="number"
                        step="0.01"
                        value={valorResidual}
                        onChange={(e) => setValorResidual(parseFloat(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorLocacaoDiaria">Valor Locação Diária (R$)</Label>
                      <Input
                        id="valorLocacaoDiaria"
                        type="number"
                        step="0.01"
                        value={valorLocacaoDiaria || ''}
                        onChange={(e) => setValorLocacaoDiaria(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="valorLocacaoMensal">Valor Locação Mensal (R$)</Label>
                      <Input
                        id="valorLocacaoMensal"
                        type="number"
                        step="0.01"
                        value={valorLocacaoMensal || ''}
                        onChange={(e) => setValorLocacaoMensal(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>

                    <div className="col-span-3">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div>
                          <Label htmlFor="comOperador" className="font-medium">Com Operador</Label>
                          <p className="text-sm text-muted-foreground">
                            O valor da locação inclui operador
                          </p>
                        </div>
                        <Switch
                          id="comOperador"
                          checked={comOperador}
                          onCheckedChange={setComOperador}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plano de Manutenção */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    Plano de Manutenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={planoManutencao}
                    onChange={(e) => setPlanoManutencao(e.target.value)}
                    placeholder="Descreva o plano de manutenção do equipamento (periodicidade, itens a verificar, etc)..."
                    className="min-h-[100px]"
                  />
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
                  disabled={saving || (limites?.disponivel === 0)}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Criar Equipamento
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