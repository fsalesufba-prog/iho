'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Check,
  Download,
  Printer,
  ArrowRight,
  Clock,
  Calendar,
  DollarSign,
  CreditCard,
  QrCode,
  Barcode,
  AlertCircle,
  Home,
  FileText,
  Mail,
  Sparkles,
  Zap,
  Share2
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Separator } from '@/components/ui/Separator'
import { Progress } from '@/components/ui/Progress'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Pagamento {
  id: number
  valor: number
  status: 'pendente' | 'pago' | 'cancelado'
  metodo: 'cartao' | 'pix' | 'boleto'
  dataVencimento: string
  dataPagamento?: string
  linkPagamento?: string
  qrCode?: string
  codigoBarras?: string
  linhaDigitavel?: string
  urlBoleto?: string
}

export default function PagamentoDetalhePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [pagamento, setPagamento] = useState<Pagamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [tempoRestante, setTempoRestante] = useState<string>('')

  const tipo = searchParams.get('tipo') || 'pix'
  const statusParam = searchParams.get('status')

  useEffect(() => {
    const id = params.id as string
    if (id) {
      carregarPagamento(parseInt(id))
    }
  }, [params.id])

  useEffect(() => {
    if (pagamento?.status === 'pendente' && pagamento.metodo === 'pix') {
      const intervalo = setInterval(() => {
        verificarStatusPagamento()
      }, 5000)

      return () => clearInterval(intervalo)
    }
  }, [pagamento?.id, pagamento?.status])

  useEffect(() => {
    if (pagamento?.metodo === 'pix' && pagamento.dataVencimento) {
      const atualizarTimer = () => {
        const vencimento = new Date(pagamento.dataVencimento).getTime()
        const agora = new Date().getTime()
        const diferenca = vencimento - agora

        if (diferenca <= 0) {
          setTempoRestante('Expirado')
          return
        }

        const minutos = Math.floor(diferenca / (1000 * 60))
        const segundos = Math.floor((diferenca % (1000 * 60)) / 1000)
        setTempoRestante(`${minutos}:${segundos.toString().padStart(2, '0')}`)
      }

      atualizarTimer()
      const timer = setInterval(atualizarTimer, 1000)
      return () => clearInterval(timer)
    }
  }, [pagamento?.dataVencimento, pagamento?.metodo])

  const carregarPagamento = async (id: number) => {
    try {
      setLoading(true)
      const response = await api.get(`/pagamentos/${id}`)
      setPagamento(response.data)
    } catch (error) {
      console.error('Erro ao carregar pagamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as informações do pagamento',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const verificarStatusPagamento = async () => {
    if (!pagamento?.id) return

    try {
      const response = await api.get(`/pagamentos/${pagamento.id}/status`)
      if (response.data.status === 'pago') {
        setPagamento({ ...pagamento, status: 'pago' })
        toast({
          title: 'Pagamento confirmado!',
          description: 'Seu pagamento foi processado com sucesso.',
        })
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast({
      title: 'Copiado!',
      description: 'Código copiado para a área de transferência'
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading || !pagamento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando informações do pagamento...</p>
        </div>
      </div>
    )
  }

  if (pagamento.status === 'pago' || statusParam === 'sucesso') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <Container size="sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="relative mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="h-24 w-24 rounded-full bg-green-100 mx-auto flex items-center justify-center"
              >
                <CheckCircle className="h-12 w-12 text-green-600" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </motion.div>
            </div>

            <h1 className="text-3xl font-bold mb-2">Pagamento confirmado!</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Seu plano foi ativado com sucesso. Você já pode acessar o sistema.
            </p>

            <div className="bg-muted/50 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-sm text-muted-foreground">Valor pago</p>
                  <p className="text-xl font-bold text-primary">
                    {formatCurrency(pagamento.valor)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Forma de pagamento</p>
                  <p className="font-medium capitalize">{pagamento.metodo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data do pagamento</p>
                  <p className="font-medium">
                    {new Date().toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID da transação</p>
                  <p className="font-mono text-sm">#{pagamento.id}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="group">
                  Acessar o sistema
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                <FileText className="mr-2 h-5 w-5" />
                Ver comprovante
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Enviamos uma cópia do comprovante para o seu e-mail.
            </p>
          </motion.div>
        </Container>
      </div>
    )
  }

  if (pagamento.status === 'cancelado') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <Container size="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="h-24 w-24 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>

            <h1 className="text-3xl font-bold mb-2">Pagamento cancelado</h1>
            <p className="text-lg text-muted-foreground mb-6">
              O pagamento foi cancelado. Você pode tentar novamente ou escolher outra forma de pagamento.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/pagamento?plano=${pagamento.id}`}>
                <Button size="lg" className="group">
                  Tentar novamente
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/planos">
                <Button size="lg" variant="outline">
                  Ver outros planos
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <Container size="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <Badge className="mb-4 px-4 py-2">
              {pagamento.metodo === 'pix' && <QrCode className="h-4 w-4 mr-2" />}
              {pagamento.metodo === 'boleto' && <Barcode className="h-4 w-4 mr-2" />}
              {pagamento.metodo === 'cartao' && <CreditCard className="h-4 w-4 mr-2" />}
              Pagamento via {pagamento.metodo === 'pix' ? 'PIX' : 
                             pagamento.metodo === 'boleto' ? 'Boleto' : 'Cartão'}
            </Badge>
            
            <h1 className="text-3xl font-bold mb-2">
              {pagamento.metodo === 'pix' && 'Pague com PIX'}
              {pagamento.metodo === 'boleto' && 'Boleto Bancário'}
              {pagamento.metodo === 'cartao' && 'Pagamento com Cartão'}
            </h1>
            
            <p className="text-muted-foreground">
              {pagamento.metodo === 'pix' && 'Escaneie o QR Code ou copie o código para pagar'}
              {pagamento.metodo === 'boleto' && 'Pague o boleto em qualquer banco ou app'}
              {pagamento.metodo === 'cartao' && 'Preencha os dados do cartão para pagar'}
            </p>
          </div>

          {/* Valor */}
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Valor a pagar</p>
              <p className="text-4xl font-bold text-primary">
                {formatCurrency(pagamento.valor)}
              </p>
            </CardContent>
          </Card>

          {/* PIX */}
          {pagamento.metodo === 'pix' && (
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* QR Code */}
                {pagamento.qrCode ? (
                  <div className="flex justify-center">
                    <img 
                      src={pagamento.qrCode} 
                      alt="QR Code PIX" 
                      className="w-48 h-48"
                    />
                  </div>
                ) : (
                  <div className="flex justify-center p-8 bg-muted rounded-lg">
                    <QrCode className="h-32 w-32 text-muted-foreground" />
                  </div>
                )}

                {/* Código PIX */}
                {pagamento.linkPagamento && (
                  <div className="space-y-2">
                    <Label>Código PIX Copia e Cola</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={pagamento.linkPagamento} 
                        readOnly 
                        className="font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(pagamento.linkPagamento!)}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Timer */}
                {pagamento.dataVencimento && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Tempo restante</p>
                    <p className={cn(
                      "text-2xl font-mono font-bold",
                      tempoRestante === 'Expirado' ? 'text-red-600' : 'text-orange-600'
                    )}>
                      {tempoRestante}
                    </p>
                  </div>
                )}

                {/* Instruções */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-medium">Como pagar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Abra o app do seu banco</li>
                    <li>Escolha a opção PIX</li>
                    <li>Leia o QR Code ou cole o código</li>
                    <li>Confirme os dados e finalize</li>
                  </ol>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => verificarStatusPagamento()}
                >
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Aguardando pagamento
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Boleto */}
          {pagamento.metodo === 'boleto' && (
            <Card>
              <CardContent className="p-6 space-y-6">
                {/* Código de Barras */}
                <div className="text-center p-6 bg-muted rounded-lg">
                  <Barcode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  
                  {pagamento.linhaDigitavel && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Linha digitável</p>
                      <div className="flex gap-2">
                        <Input 
                          value={pagamento.linhaDigitavel} 
                          readOnly 
                          className="font-mono text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(pagamento.linhaDigitavel!)}
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Vencimento */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Vencimento:</span>
                  <span className="font-medium">
                    {new Date(pagamento.dataVencimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Ações */}
                <div className="grid grid-cols-2 gap-4">
                  {pagamento.urlBoleto && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(pagamento.urlBoleto, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Boleto
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.print()}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                </div>

                {/* Instruções */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-medium">Instruções:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>O boleto pode ser pago em qualquer banco ou casa lotérica</li>
                    <li>O pagamento pode levar até 3 dias úteis para ser confirmado</li>
                    <li>Após o pagamento, enviaremos a confirmação por e-mail</li>
                  </ul>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => verificarStatusPagamento()}
                >
                  Já realizei o pagamento
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Ajuda */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Precisa de ajuda?
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/contato" className="text-sm text-primary hover:underline">
                Fale conosco
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link href="/faq" className="text-sm text-primary hover:underline">
                Perguntas frequentes
              </Link>
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  )
}