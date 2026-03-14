'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, XCircle, Loader2 } from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

export default function CancelarAssinaturaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const [motivo, setMotivo] = useState('')
  const [step, setStep] = useState<'confirm' | 'feedback'>('confirm')

  const handleConfirm = () => {
    if (confirmacao !== 'CANCELAR') {
      toast({
        title: 'Confirmação inválida',
        description: 'Digite "CANCELAR" para confirmar o cancelamento.',
        variant: 'destructive'
      })
      return
    }
    setStep('feedback')
  }

  const handleCancelar = async () => {
    try {
      setLoading(true)
      await api.post('/configuracoes/assinatura/cancelar', { motivo, confirmacao: 'CANCELAR' })

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
      setLoading(false)
    }
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Cancelar Assinatura" />
        
        <Container size="lg" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/configuracoes/assinatura"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Cancelar Assinatura
                </CardTitle>
              </CardHeader>
              <CardContent>
                {step === 'confirm' ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-destructive/10 rounded-lg">
                      <h3 className="font-semibold text-destructive mb-2">
                        Você está prestes a cancelar sua assinatura
                      </h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>O acesso ao sistema será bloqueado imediatamente</li>
                        <li>Seus dados serão mantidos por 30 dias</li>
                        <li>Você pode reativar a qualquer momento dentro deste período</li>
                        <li>Após 30 dias, todos os dados serão permanentemente excluídos</li>
                      </ul>
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
                        className="font-mono"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Voltar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleConfirm}
                      >
                        Continuar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        Quase lá! Conte-nos o motivo
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Sua opinião é importante para melhorarmos nossos serviços
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="motivo">Motivo do cancelamento (opcional)</Label>
                      <Textarea
                        id="motivo"
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ex: Preço alto, falta de recursos, migração para outro sistema..."
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setStep('confirm')}
                      >
                        Voltar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancelar}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelando...
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-2 h-4 w-4" />
                            Confirmar Cancelamento
                          </>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      Você ainda pode reativar sua assinatura nos próximos 30 dias
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>
    </>
  )
}