'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  QrCode,
  Scan,
  ArrowRight,
  Lock,
  Shield,
  Truck,
  Users,
  Loader2,
  ChevronLeft,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { masks } from '@/lib/masks'
import { validators } from '@/lib/validators'
import { cn } from '@/lib/utils'

interface Plano {
  id: number
  nome: string
  valorImplantacao: number
  valorMensal: number
  limiteAdm: number
  limiteControlador: number
  limiteApontador: number
  limiteEquipamentos: number
}

interface DadosEmpresa {
  nome: string
  cnpj: string
  email: string
  telefone: string
}

function PagamentoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [plano, setPlano] = useState<Plano | null>(null)
  const [loading, setLoading] = useState(true)
  const [metodo, setMetodo] = useState<'cartao' | 'pix' | 'boleto' | null>(null)
  const [parcelas, setParcelas] = useState(1)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState(1)
  const [termos, setTermos] = useState(false)

  const [dadosEmpresa, setDadosEmpresa] = useState<DadosEmpresa>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: ''
  })

  const [erros, setErros] = useState<Partial<Record<keyof DadosEmpresa, string>>>({})

  useEffect(() => {
    const planoId = searchParams.get('plano')
    if (!planoId) {
      router.push('/planos')
      return
    }
    carregarPlano(parseInt(planoId))
  }, [searchParams, router])

  const carregarPlano = async (id: number) => {
    try {
      setLoading(true)
      const response = await api.get(`/planos/${id}`)
      setPlano(response.data)
    } catch (error) {
      console.error('Erro ao carregar plano:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as informações do plano',
        variant: 'error'
      })
      router.push('/planos')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const validarDadosEmpresa = (): boolean => {
    const novosErros: Partial<Record<keyof DadosEmpresa, string>> = {}

    if (!dadosEmpresa.nome) novosErros.nome = 'Nome é obrigatório'
    if (!dadosEmpresa.cnpj) novosErros.cnpj = 'CNPJ é obrigatório'
    else if (!validators.cnpj(dadosEmpresa.cnpj)) novosErros.cnpj = 'CNPJ inválido'
    
    if (!dadosEmpresa.email) novosErros.email = 'E-mail é obrigatório'
    else if (!validators.email(dadosEmpresa.email)) novosErros.email = 'E-mail inválido'
    
    if (!dadosEmpresa.telefone) novosErros.telefone = 'Telefone é obrigatório'
    else if (!validators.phone(dadosEmpresa.telefone)) novosErros.telefone = 'Telefone inválido'

    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  const handleProximo = () => {
    if (step === 1) {
      if (validarDadosEmpresa()) {
        setStep(2)
      }
    } else if (step === 2) {
      if (metodo) {
        setStep(3)
      } else {
        toast({
          title: 'Atenção',
          description: 'Selecione um método de pagamento',
          variant: 'error'
        })
      }
    }
  }

  const handleVoltar = () => {
    setStep(step - 1)
  }

  const handleConfirmar = async () => {
    if (!termos) {
      toast({
        title: 'Atenção',
        description: 'Você precisa aceitar os termos de uso',
        variant: 'error'
      })
      return
    }

    setProcessing(true)
    
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const response = await api.post('/pagamentos/iniciar', {
        planoId: plano?.id,
        metodo,
        parcelas,
        dadosEmpresa
      })

      if (metodo === 'pix') {
        router.push(`/pagamento/${response.data.id}?tipo=pix`)
      } else if (metodo === 'boleto') {
        router.push(`/pagamento/${response.data.id}?tipo=boleto`)
      } else {
        router.push(`/pagamento/${response.data.id}?tipo=cartao&status=sucesso`)
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível processar o pagamento',
        variant: 'error'
      })
      setProcessing(false)
    }
  }

  if (loading || !plano) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando informações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <Container size="lg">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/planos" className="hover:text-primary transition-colors">
            Planos
          </Link>
          <ChevronLeft className="h-4 w-4" />
          <span className="text-foreground font-medium">Pagamento</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário de Pagamento */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progresso */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center",
                      i < 3 && "flex-1"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      step >= i
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {i}
                    </div>
                    {i < 3 && (
                      <div className={cn(
                        "flex-1 h-1 mx-2 transition-colors",
                        step > i ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Dados da Empresa</span>
                <span>Método de Pagamento</span>
                <span>Confirmação</span>
              </div>
            </div>

            {/* Step 1: Dados da Empresa */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Dados da Empresa</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome da Empresa</Label>
                        <Input
                          id="nome"
                          value={dadosEmpresa.nome}
                          onChange={(e) => setDadosEmpresa({...dadosEmpresa, nome: e.target.value})}
                          placeholder="Razão Social"
                          className={erros.nome ? 'border-destructive' : ''}
                        />
                        {erros.nome && (
                          <p className="text-xs text-destructive mt-1">{erros.nome}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input
                          id="cnpj"
                          value={dadosEmpresa.cnpj}
                          onChange={(e) => setDadosEmpresa({...dadosEmpresa, cnpj: masks.cnpj(e.target.value)})}
                          placeholder="00.000.000/0000-00"
                          maxLength={18}
                          className={erros.cnpj ? 'border-destructive' : ''}
                        />
                        {erros.cnpj && (
                          <p className="text-xs text-destructive mt-1">{erros.cnpj}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={dadosEmpresa.email}
                          onChange={(e) => setDadosEmpresa({...dadosEmpresa, email: e.target.value})}
                          placeholder="contato@empresa.com"
                          className={erros.email ? 'border-destructive' : ''}
                        />
                        {erros.email && (
                          <p className="text-xs text-destructive mt-1">{erros.email}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={dadosEmpresa.telefone}
                          onChange={(e) => setDadosEmpresa({...dadosEmpresa, telefone: masks.phone(e.target.value)})}
                          placeholder="(00) 00000-0000"
                          maxLength={15}
                          className={erros.telefone ? 'border-destructive' : ''}
                        />
                        {erros.telefone && (
                          <p className="text-xs text-destructive mt-1">{erros.telefone}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Método de Pagamento */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Método de Pagamento</h2>
                    
                    <RadioGroup
                      value={metodo || ''}
                      onValueChange={(value: any) => setMetodo(value)}
                      className="grid gap-4"
                    >
                      <div>
                        <RadioGroupItem value="cartao" id="cartao" className="peer sr-only" />
                        <Label
                          htmlFor="cartao"
                          className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <CreditCard className="h-6 w-6" />
                          <div className="flex-1">
                            <p className="font-medium">Cartão de Crédito</p>
                            <p className="text-sm text-muted-foreground">
                              Parcele em até 10x sem juros
                            </p>
                          </div>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                        <Label
                          htmlFor="pix"
                          className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <QrCode className="h-6 w-6" />
                          <div className="flex-1">
                            <p className="font-medium">PIX</p>
                            <p className="text-sm text-muted-foreground">
                              Pagamento instantâneo com 5% de desconto
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">5% OFF</Badge>
                        </Label>
                      </div>

                      <div>
                        <RadioGroupItem value="boleto" id="boleto" className="peer sr-only" />
                        <Label
                          htmlFor="boleto"
                          className="flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <Scan className="h-6 w-6" />
                          <div className="flex-1">
                            <p className="font-medium">Boleto Bancário</p>
                            <p className="text-sm text-muted-foreground">
                              Pagamento em até 3 dias úteis
                            </p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>

                    {metodo === 'cartao' && (
                      <div className="mt-4">
                        <Label htmlFor="parcelas">Número de parcelas</Label>
                        <Select
                          value={parcelas.toString()}
                          onValueChange={(value) => setParcelas(parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1,2,3,4,5,6,7,8,9,10].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}x de {formatCurrency(plano.valorImplantacao / num)} {num === 1 ? '(à vista)' : 'sem juros'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Confirmação */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Confirme seus dados</h2>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h3 className="font-medium">Dados da Empresa</h3>
                        <p className="text-sm"><span className="text-muted-foreground">Nome:</span> {dadosEmpresa.nome}</p>
                        <p className="text-sm"><span className="text-muted-foreground">CNPJ:</span> {dadosEmpresa.cnpj}</p>
                        <p className="text-sm"><span className="text-muted-foreground">E-mail:</span> {dadosEmpresa.email}</p>
                        <p className="text-sm"><span className="text-muted-foreground">Telefone:</span> {dadosEmpresa.telefone}</p>
                      </div>

                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <h3 className="font-medium">Pagamento</h3>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Método:</span>{' '}
                          {metodo === 'cartao' && 'Cartão de Crédito'}
                          {metodo === 'pix' && 'PIX'}
                          {metodo === 'boleto' && 'Boleto Bancário'}
                        </p>
                        {metodo === 'cartao' && (
                          <p className="text-sm">
                            <span className="text-muted-foreground">Parcelas:</span> {parcelas}x
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="termos"
                          checked={termos}
                          onChange={(e) => setTermos(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="termos" className="text-sm">
                          Li e aceito os{' '}
                          <Link href="/termos" className="text-primary hover:underline">
                            Termos de Uso
                          </Link>{' '}
                          e{' '}
                          <Link href="/privacidade" className="text-primary hover:underline">
                            Política de Privacidade
                          </Link>
                        </Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Botões de navegação */}
            <div className="flex justify-between">
              {step > 1 && (
                <Button variant="outline" onClick={handleVoltar}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              )}
              <div className="flex-1" />
              {step < 3 ? (
                <Button onClick={handleProximo}>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleConfirmar}
                  disabled={processing || !termos}
                  className="min-w-[200px]"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    'Confirmar Pagamento'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Resumo do Pedido</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plano</p>
                    <p className="font-medium">{plano.nome}</p>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground">Implantação</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(plano.valorImplantacao)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Mensalidade</p>
                    <p className="font-medium">{formatCurrency(plano.valorMensal)}/mês</p>
                  </div>

                  {metodo === 'pix' && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        Desconto de 5% no PIX
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Valor final: {formatCurrency(plano.valorImplantacao * 0.95)}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>1 ADM + {plano.limiteControlador} Controladores + {plano.limiteApontador} Apontadores</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Até {plano.limiteEquipamentos} equipamentos</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span className="text-green-600 font-medium">Pagamento 100% seguro</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Seus dados são protegidos com criptografia de ponta a ponta
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Compra protegida pelo IHO</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  )
}
export default function PagamentoPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>}>
      <PagamentoPage />
    </Suspense>
  )
}
