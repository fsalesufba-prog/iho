'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
<<<<<<< HEAD
import Link from 'next/link'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import {
  ArrowLeft,
  CreditCard,
  Calendar,
  AlertCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { Progress } from '@/components/ui/Progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useToast } from '@/components/ui/use-toast'
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

interface AssinaturaData {
  plano: {
    id: number
    nome: string
    valorMensal: number
    limiteAdm: number
    limiteControlador: number
    limiteApontador: number
    limiteEquipamentos: number
  }
  status: string
  dataContratacao: string
  proximoVencimento: string
  diasAteVencimento: number
  valorMensal: number
  historicoPagamentos: Array<{
    id: number
    dataVencimento: string
    dataPagamento: string | null
    valor: number
    status: string
  }>
}

export default function AssinaturaPage() {
  const router = useRouter()
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AssinaturaData | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const [motivo, setMotivo] = useState('')
  const [canceling, setCanceling] = useState(false)

  useEffect(() => {
    carregarAssinatura()
  }, [])

  const carregarAssinatura = async () => {
    try {
      setLoading(true)
      const response = await api.get('/configuracoes/assinatura')
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar assinatura',
        description: 'Não foi possível carregar os dados da assinatura.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelar = async () => {
    if (confirmacao !== 'CANCELAR') {
      toast({
        title: 'Confirmação inválida',
        description: 'Digite "CANCELAR" para confirmar o cancelamento.',
        variant: 'destructive'
      })
      return
    }

    try {
      setCanceling(true)
      await api.post('/configuracoes/assinatura/cancelar', { motivo, confirmacao })

      toast({
        title: 'Assinatura cancelada',
        description: 'Sua assinatura foi cancelada com sucesso.'
      })

      router.push('/app-empresa/configuracoes')
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar',
        description: error.response?.data?.error || 'Não foi possível cancelar a assinatura.',
        variant: 'destructive'
      })
    } finally {
      setCanceling(false)
      setCancelDialogOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      atrasado: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      inativo: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  const getPagamentoStatusBadge = (status: string) => {
    const variants = {
      pago: 'bg-green-100 text-green-800',
      pendente: 'bg-yellow-100 text-yellow-800',
      cancelado: 'bg-red-100 text-red-800'
    }
    return variants[status as keyof typeof variants] || ''
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Assinatura" />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </Container>
        </main>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Assinatura" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Dados não encontrados</h2>
              <p className="text-muted-foreground mb-6">
                Não foi possível carregar os dados da assinatura.
              </p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </Container>
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Assinatura" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
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
            className="space-y-6"
          >
            {/* Status do Plano */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{data.plano.nome}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusBadge(data.status)}>
                          {data.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Contratado em {formatDate(data.dataContratacao, 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(data.valorMensal)}
                    </p>
                    <p className="text-sm text-muted-foreground">/mês</p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* Próximo Vencimento */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Próximo vencimento:</span>
                    <span>{formatDate(data.proximoVencimento, 'dd/MM/yyyy')}</span>
                  </div>
                  <Badge
                    className={
                      data.diasAteVencimento <= 5
                        ? 'bg-red-100 text-red-800'
                        : data.diasAteVencimento <= 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }
                  >
                    {data.diasAteVencimento} dias
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Limites do Plano */}
            <Card>
              <CardHeader>
                <CardTitle>Limites do Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Administradores</span>
                    <span className="text-sm text-muted-foreground">
                      {data.plano.limiteAdm} disponíveis
                    </span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Controladores</span>
                    <span className="text-sm text-muted-foreground">
                      {data.plano.limiteControlador} disponíveis
                    </span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Apontadores</span>
                    <span className="text-sm text-muted-foreground">
                      {data.plano.limiteApontador} disponíveis
                    </span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Equipamentos</span>
                    <span className="text-sm text-muted-foreground">
                      {data.plano.limiteEquipamentos} disponíveis
                    </span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Pagamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.historicoPagamentos.map((pagamento) => (
                    <div
                      key={pagamento.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          Vencimento: {formatDate(pagamento.dataVencimento, 'dd/MM/yyyy')}
                        </p>
                        {pagamento.dataPagamento && (
                          <p className="text-sm text-muted-foreground">
                            Pago em: {formatDate(pagamento.dataPagamento, 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(pagamento.valor)}</p>
                        <Badge className={getPagamentoStatusBadge(pagamento.status)}>
                          {pagamento.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ações */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Gerenciar Assinatura</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full" disabled>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Fazer Upgrade
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setCancelDialogOpen(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar Assinatura
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>

      {/* Modal de Cancelamento */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Cancelar Assinatura</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Todos os dados serão mantidos por 30 dias
              para possível reativação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-300">Atenção!</p>
                  <p className="text-yellow-700 dark:text-yellow-400">
                    Ao cancelar sua assinatura:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-yellow-700 dark:text-yellow-400">
                    <li>O acesso ao sistema será bloqueado imediatamente</li>
                    <li>Seus dados serão mantidos por 30 dias</li>
                    <li>Você pode reativar a qualquer momento dentro deste período</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo do cancelamento (opcional)</Label>
              <Input
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Mudança de empresa, preço, etc..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmacao">
                Digite <span className="font-bold">CANCELAR</span> para confirmar
              </Label>
              <Input
                id="confirmacao"
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                placeholder="CANCELAR"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelar}
              disabled={canceling}
            >
              {canceling ? 'Cancelando...' : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}