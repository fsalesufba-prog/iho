'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  Lock,
  Shield,
  Truck,
  Users,
  Building2,
  User,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { api } from '@/lib/api'

type Etapa = 'plano' | 'empresa' | 'responsavel' | 'confirmar'

interface Plano {
  id: number
  nome: string
  descricao: string
  valorImplantacao: number
  valorMensal: number
  limiteAdm: number
  limiteControlador: number
  limiteApontador: number
  limiteEquipamentos: number
  recursos: string[]
}

interface DadosEmpresa {
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  segmento: string
}

interface DadosResponsavel {
  nome: string
  email: string
  telefone: string
  cpf: string
  cargo: string
}

const ETAPAS: Etapa[] = ['plano', 'empresa', 'responsavel', 'confirmar']

const ETAPA_LABELS: Record<Etapa, string> = {
  plano: 'Plano',
  empresa: 'Empresa',
  responsavel: 'Responsável',
  confirmar: 'Confirmar',
}

const masks = {
  cnpj: (v: string) =>
    v.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18),
  cpf: (v: string) =>
    v.replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .slice(0, 14),
  phone: (v: string) =>
    v.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{4})$/, '$1-$2')
      .slice(0, 15),
  cep: (v: string) =>
    v.replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 9),
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function CheckoutPage() {
  const searchParams = useSearchParams()

  const [etapa, setEtapa] = useState<Etapa>('plano')
  const [planos, setPlanos] = useState<Plano[]>([])
  const [planoSelecionado, setPlanoSelecionado] = useState<Plano | null>(null)
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [erros, setErros] = useState<Record<string, string>>({})
  const [erroPagamento, setErroPagamento] = useState('')

  const [dadosEmpresa, setDadosEmpresa] = useState<DadosEmpresa>({
    nome: '', cnpj: '', email: '', telefone: '',
    endereco: '', numero: '', bairro: '', cidade: '', estado: '', cep: '',
    segmento: ''
  })

  const [dadosResponsavel, setDadosResponsavel] = useState<DadosResponsavel>({
    nome: '', email: '', telefone: '', cpf: '', cargo: ''
  })

  useEffect(() => {
    carregarPlanos()
  }, [])

  const carregarPlanos = async () => {
    try {
      setLoading(true)
      const res = await api.get('/comercial/planos')
      const lista: Plano[] = res.data.data || []
      setPlanos(lista)

      const planoParam = searchParams.get('plano')
      if (planoParam) {
        const encontrado = lista.find(
          p => p.id === parseInt(planoParam) || p.nome.toLowerCase() === planoParam.toLowerCase()
        )
        if (encontrado) setPlanoSelecionado(encontrado)
      }
    } catch (err) {
      console.error('Erro ao carregar planos:', err)
    } finally {
      setLoading(false)
    }
  }

  const validarEtapa = (): boolean => {
    const novosErros: Record<string, string> = {}

    if (etapa === 'plano') {
      if (!planoSelecionado) novosErros.plano = 'Selecione um plano para continuar'
    }

    if (etapa === 'empresa') {
      if (!dadosEmpresa.nome) novosErros.nome = 'Nome da empresa é obrigatório'
      if (!dadosEmpresa.cnpj || dadosEmpresa.cnpj.replace(/\D/g, '').length !== 14)
        novosErros.cnpj = 'CNPJ inválido'
      if (!dadosEmpresa.email || !dadosEmpresa.email.includes('@'))
        novosErros.email = 'E-mail inválido'
      if (!dadosEmpresa.telefone) novosErros.telefone = 'Telefone é obrigatório'
      if (!dadosEmpresa.cidade) novosErros.cidade = 'Cidade é obrigatória'
      if (!dadosEmpresa.estado) novosErros.estado = 'Estado é obrigatório'
    }

    if (etapa === 'responsavel') {
      if (!dadosResponsavel.nome) novosErros.nome = 'Nome é obrigatório'
      if (!dadosResponsavel.email || !dadosResponsavel.email.includes('@'))
        novosErros.email = 'E-mail inválido'
      if (!dadosResponsavel.telefone) novosErros.telefone = 'Telefone é obrigatório'
      if (!dadosResponsavel.cpf || dadosResponsavel.cpf.replace(/\D/g, '').length !== 11)
        novosErros.cpf = 'CPF inválido'
    }

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleProximo = () => {
    if (!validarEtapa()) return
    const idx = ETAPAS.indexOf(etapa)
    if (idx < ETAPAS.length - 1) setEtapa(ETAPAS[idx + 1])
  }

  const handleVoltar = () => {
    const idx = ETAPAS.indexOf(etapa)
    if (idx > 0) setEtapa(ETAPAS[idx - 1])
  }

  const handleConfirmar = async () => {
    setEnviando(true)
    setErroPagamento('')
    try {
      const res = await api.post('/comercial/pagamento/iniciar', {
        planoId: planoSelecionado!.id,
        dadosEmpresa,
        dadosResponsavel,
      })

      const { checkoutUrl } = res.data
      if (!checkoutUrl) throw new Error('Link de pagamento não retornado')

      window.location.href = checkoutUrl
    } catch (err: any) {
      console.error('Erro ao iniciar pagamento:', err)
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Não foi possível processar o pagamento. Tente novamente.'
      setErroPagamento(msg)
    } finally {
      setEnviando(false)
    }
  }

  const etapaIndex = ETAPAS.indexOf(etapa)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            IHO
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Checkout seguro</span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {ETAPAS.map((e, i) => (
              <div key={e} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${i <= etapaIndex ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                    i < etapaIndex ? 'bg-primary border-primary text-primary-foreground' :
                    i === etapaIndex ? 'border-primary text-primary' :
                    'border-muted-foreground/30 text-muted-foreground/50'
                  }`}>
                    {i < etapaIndex ? <CheckCircle className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{ETAPA_LABELS[e]}</span>
                </div>
                {i < ETAPAS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 transition-colors ${i < etapaIndex ? 'bg-primary' : 'bg-muted-foreground/20'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {/* Seleção de Plano */}
              {etapa === 'plano' && (
                <motion.div key="plano" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-semibold">Escolha seu plano</h2>
                  {erros.plano && (
                    <p className="text-sm text-destructive">{erros.plano}</p>
                  )}
                  {planos.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        Nenhum plano disponível no momento.
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {planos.map(plano => (
                        <Card
                          key={plano.id}
                          className={`cursor-pointer transition-all border-2 ${planoSelecionado?.id === plano.id ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'}`}
                          onClick={() => setPlanoSelecionado(plano)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-semibold">{plano.nome}</h3>
                                  {planoSelecionado?.id === plano.id && (
                                    <Badge className="bg-primary text-primary-foreground">Selecionado</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{plano.descricao}</p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {plano.limiteAdm} ADM · {plano.limiteControlador} Controle · {plano.limiteApontador} Apont.
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Truck className="h-3.5 w-3.5" />
                                    Até {plano.limiteEquipamentos} equipamentos
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-2xl font-bold text-primary">{formatCurrency(plano.valorMensal)}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                                <p className="text-xs text-muted-foreground mt-1">+ {formatCurrency(plano.valorImplantacao)} implantação</p>
                              </div>
                            </div>
                            {Array.isArray(plano.recursos) && plano.recursos.length > 0 && (
                              <>
                                <Separator className="my-4" />
                                <div className="flex flex-wrap gap-2">
                                  {plano.recursos.slice(0, 5).map((r: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs">{r}</Badge>
                                  ))}
                                  {plano.recursos.length > 5 && (
                                    <Badge variant="secondary" className="text-xs">+{plano.recursos.length - 5}</Badge>
                                  )}
                                </div>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Dados da Empresa */}
              {etapa === 'empresa' && (
                <motion.div key="empresa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <Building2 className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-semibold">Dados da Empresa</h2>
                      </div>
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Label htmlFor="emp-nome">Razão Social *</Label>
                            <Input id="emp-nome" value={dadosEmpresa.nome}
                              onChange={e => setDadosEmpresa({...dadosEmpresa, nome: e.target.value})}
                              placeholder="Empresa Ltda" className={erros.nome ? 'border-destructive' : ''} />
                            {erros.nome && <p className="text-xs text-destructive mt-1">{erros.nome}</p>}
                          </div>
                          <div>
                            <Label htmlFor="emp-cnpj">CNPJ *</Label>
                            <Input id="emp-cnpj" value={dadosEmpresa.cnpj}
                              onChange={e => setDadosEmpresa({...dadosEmpresa, cnpj: masks.cnpj(e.target.value)})}
                              placeholder="00.000.000/0000-00" maxLength={18}
                              className={erros.cnpj ? 'border-destructive' : ''} />
                            {erros.cnpj && <p className="text-xs text-destructive mt-1">{erros.cnpj}</p>}
                          </div>
                          <div>
                            <Label htmlFor="emp-segmento">Segmento</Label>
                            <Select value={dadosEmpresa.segmento}
                              onValueChange={v => setDadosEmpresa({...dadosEmpresa, segmento: v})}>
                              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="construcao">Construção Civil</SelectItem>
                                <SelectItem value="mineracao">Mineração</SelectItem>
                                <SelectItem value="agricultura">Agricultura</SelectItem>
                                <SelectItem value="logistica">Logística</SelectItem>
                                <SelectItem value="industria">Indústria</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="emp-email">E-mail *</Label>
                            <Input id="emp-email" type="email" value={dadosEmpresa.email}
                              onChange={e => setDadosEmpresa({...dadosEmpresa, email: e.target.value})}
                              placeholder="contato@empresa.com.br"
                              className={erros.email ? 'border-destructive' : ''} />
                            {erros.email && <p className="text-xs text-destructive mt-1">{erros.email}</p>}
                          </div>
                          <div>
                            <Label htmlFor="emp-telefone">Telefone *</Label>
                            <Input id="emp-telefone" value={dadosEmpresa.telefone}
                              onChange={e => setDadosEmpresa({...dadosEmpresa, telefone: masks.phone(e.target.value)})}
                              placeholder="(00) 00000-0000" maxLength={15}
                              className={erros.telefone ? 'border-destructive' : ''} />
                            {erros.telefone && <p className="text-xs text-destructive mt-1">{erros.telefone}</p>}
                          </div>
                          <div>
                            <Label htmlFor="emp-endereco">Endereço</Label>
                            <Input id="emp-endereco" value={dadosEmpresa.endereco}
                              onChange={e => setDadosEmpresa({...dadosEmpresa, endereco: e.target.value})}
                              placeholder="Rua, Avenida..." />
                          </div>
                          <div>
                            <Label htmlFor="emp-numero">Número</Label>
                            <Input id="emp-numero" value={dadosEmpresa.numero}
                              onChange={e => setDadosEmpresa({...dadosEmpresa, numero: e.target.value})}
                              placeholder="123" />
                          </div>
                          <div>
                            <Label htmlFor="emp-bairro">Bairro</Label>
                            <Input id="emp-bairro" value={dadosEmpresa.bairro}
                              onChange={e => setDadosEmpresa({...dadosEmpresa, bairro: e.target.value})}
                              placeholder="Centro" />
                          </div>
                          <div>
                            <Label htmlFor="emp-cidade">Cidade *</Label>
                            <Input id="emp-cidade" value={dadosEmpresa.cidade}
                              onChange={e => setDadosEmpresa({...dadosEmpresa, cidade: e.target.value})}
                              placeholder="São Paulo"
                              className={erros.cidade ? 'border-destructive' : ''} />
                            {erros.cidade && <p className="text-xs text-destructive mt-1">{erros.cidade}</p>}
                          </div>
                          <div>
                            <Label htmlFor="emp-estado">Estado *</Label>
                            <Select value={dadosEmpresa.estado}
                              onValueChange={v => setDadosEmpresa({...dadosEmpresa, estado: v})}>
                              <SelectTrigger className={erros.estado ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {erros.estado && <p className="text-xs text-destructive mt-1">{erros.estado}</p>}
                          </div>
                          <div>
                            <Label htmlFor="emp-cep">CEP</Label>
                            <Input id="emp-cep" value={dadosEmpresa.cep}
                              onChange={e => setDadosEmpresa({...dadosEmpresa, cep: masks.cep(e.target.value)})}
                              placeholder="00000-000" maxLength={9} />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Dados do Responsável */}
              {etapa === 'responsavel' && (
                <motion.div key="responsavel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-6">
                        <User className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-semibold">Dados do Responsável</h2>
                      </div>
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Label htmlFor="resp-nome">Nome Completo *</Label>
                            <Input id="resp-nome" value={dadosResponsavel.nome}
                              onChange={e => setDadosResponsavel({...dadosResponsavel, nome: e.target.value})}
                              placeholder="Nome do responsável"
                              className={erros.nome ? 'border-destructive' : ''} />
                            {erros.nome && <p className="text-xs text-destructive mt-1">{erros.nome}</p>}
                          </div>
                          <div>
                            <Label htmlFor="resp-email">E-mail *</Label>
                            <Input id="resp-email" type="email" value={dadosResponsavel.email}
                              onChange={e => setDadosResponsavel({...dadosResponsavel, email: e.target.value})}
                              placeholder="responsavel@email.com"
                              className={erros.email ? 'border-destructive' : ''} />
                            {erros.email && <p className="text-xs text-destructive mt-1">{erros.email}</p>}
                          </div>
                          <div>
                            <Label htmlFor="resp-telefone">Telefone *</Label>
                            <Input id="resp-telefone" value={dadosResponsavel.telefone}
                              onChange={e => setDadosResponsavel({...dadosResponsavel, telefone: masks.phone(e.target.value)})}
                              placeholder="(00) 00000-0000" maxLength={15}
                              className={erros.telefone ? 'border-destructive' : ''} />
                            {erros.telefone && <p className="text-xs text-destructive mt-1">{erros.telefone}</p>}
                          </div>
                          <div>
                            <Label htmlFor="resp-cpf">CPF *</Label>
                            <Input id="resp-cpf" value={dadosResponsavel.cpf}
                              onChange={e => setDadosResponsavel({...dadosResponsavel, cpf: masks.cpf(e.target.value)})}
                              placeholder="000.000.000-00" maxLength={14}
                              className={erros.cpf ? 'border-destructive' : ''} />
                            {erros.cpf && <p className="text-xs text-destructive mt-1">{erros.cpf}</p>}
                          </div>
                          <div>
                            <Label htmlFor="resp-cargo">Cargo</Label>
                            <Input id="resp-cargo" value={dadosResponsavel.cargo}
                              onChange={e => setDadosResponsavel({...dadosResponsavel, cargo: e.target.value})}
                              placeholder="Diretor, Gerente..." />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Confirmar */}
              {etapa === 'confirmar' && (
                <motion.div key="confirmar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-2xl font-semibold">Confirmar pedido</h2>

                  <Card>
                    <CardContent className="p-6 space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Plano</h3>
                        <p className="font-semibold text-lg">{planoSelecionado?.nome}</p>
                        <p className="text-sm text-muted-foreground">{planoSelecionado?.descricao}</p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Empresa</h3>
                        <p className="font-medium">{dadosEmpresa.nome}</p>
                        <p className="text-sm text-muted-foreground">{dadosEmpresa.cnpj}</p>
                        <p className="text-sm text-muted-foreground">{dadosEmpresa.email} · {dadosEmpresa.telefone}</p>
                        {dadosEmpresa.cidade && (
                          <p className="text-sm text-muted-foreground">{dadosEmpresa.cidade} - {dadosEmpresa.estado}</p>
                        )}
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Responsável</h3>
                        <p className="font-medium">{dadosResponsavel.nome}</p>
                        <p className="text-sm text-muted-foreground">{dadosResponsavel.email} · {dadosResponsavel.telefone}</p>
                        {dadosResponsavel.cargo && (
                          <p className="text-sm text-muted-foreground">{dadosResponsavel.cargo}</p>
                        )}
                      </div>
                      <Separator />
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Pagamento seguro via InfinitePay</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                              Ao confirmar, você será redirecionado para a página de pagamento seguro da InfinitePay, onde poderá pagar com cartão de crédito ou PIX.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {erroPagamento && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{erroPagamento}</p>
                    </div>
                  )}

                  <Button
                    onClick={handleConfirmar}
                    disabled={enviando}
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Confirmar e Pagar
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botões de navegação */}
            {etapa !== 'confirmar' && (
              <div className="flex justify-between">
                {etapa !== 'plano' ? (
                  <Button variant="outline" onClick={handleVoltar}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                ) : (
                  <div />
                )}
                <Button onClick={handleProximo}>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
            {etapa === 'confirmar' && (
              <Button variant="outline" onClick={handleVoltar} className="w-full sm:w-auto">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar e editar
              </Button>
            )}
          </div>

          {/* Resumo lateral */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {planoSelecionado ? (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Resumo</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Plano</p>
                        <p className="font-semibold">{planoSelecionado.nome}</p>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span>Implantação (única)</span>
                        <span className="font-medium">{formatCurrency(planoSelecionado.valorImplantacao)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Mensalidade</span>
                        <span className="font-medium">{formatCurrency(planoSelecionado.valorMensal)}/mês</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total hoje</span>
                        <span className="text-primary">{formatCurrency(planoSelecionado.valorImplantacao)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        * 1ª mensalidade vence 40 dias após a implantação
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground text-sm">
                    Selecione um plano para ver o resumo
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {[
                  { icon: Shield, text: 'Pagamento 100% seguro via InfinitePay' },
                  { icon: CheckCircle, text: 'Implantação em 10 dias úteis' },
                  { icon: Users, text: 'Suporte incluso no plano' },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon className="h-4 w-4 text-green-500 shrink-0" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
