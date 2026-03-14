'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

interface VerifyEmailFormProps {
  token: string
}

export function VerifyEmailForm({ token }: VerifyEmailFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    verifyEmail()
  }, [token])

  const verifyEmail = async () => {
    try {
      setIsLoading(true)
      setError(null)

      await api.get(`/auth/verify-email/${token}`)

      setIsVerified(true)
      toast({
        title: 'E-mail verificado!',
        description: 'Seu e-mail foi verificado com sucesso.',
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao verificar e-mail')
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async () => {
    try {
      setResendLoading(true)
      await api.post('/auth/resend-verification', { token })

      toast({
        title: 'E-mail reenviado!',
        description: 'Verifique sua caixa de entrada.',
      })
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: err.response?.data?.message || 'Erro ao reenviar e-mail',
<<<<<<< HEAD
        variant: 'destructive',
=======
        variant: 'error',
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    } finally {
      setResendLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-lg font-medium">Verificando seu e-mail...</p>
            <p className="text-sm text-muted-foreground mt-2">
              Aguarde um momento
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isVerified) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl">
            E-mail verificado!
          </CardTitle>
          <CardDescription className="text-center">
            Seu e-mail foi verificado com sucesso. Agora você já pode acessar todos os recursos do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => router.push('/login')}
          >
            Ir para o login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl">
          Erro na verificação
        </CardTitle>
        <CardDescription className="text-center">
          {error || 'Não foi possível verificar seu e-mail'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            O link de verificação pode ter expirado. Solicite um novo link clicando no botão abaixo.
          </AlertDescription>
        </Alert>

        <Button
          className="w-full"
          onClick={resendVerification}
          disabled={resendLoading}
        >
          {resendLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Reenviar link de verificação'
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push('/login')}
        >
          Voltar para o login
        </Button>
      </CardContent>
    </Card>
  )
}