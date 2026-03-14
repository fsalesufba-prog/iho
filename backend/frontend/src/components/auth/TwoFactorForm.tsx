'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Shield, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

const formSchema = z.object({
  code: z.string()
    .length(6, 'Código deve ter 6 dígitos')
    .regex(/^\d+$/, 'Código deve conter apenas números'),
})

type FormData = z.infer<typeof formSchema>

interface TwoFactorFormProps {
  email: string
  onSuccess: () => void
  onCancel: () => void
}

export function TwoFactorForm({ email, onSuccess, onCancel }: TwoFactorFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos em segundos
  const [canResend, setCanResend] = useState(false)
  
  const { toast } = useToast()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
    },
  })

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = form.getValues('code').split('')
      newCode[index] = value
      form.setValue('code', newCode.join(''))

      // Mover para próximo input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !form.getValues('code')[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      setError(null)

      await api.post('/auth/verify-2fa', {
        email,
        code: data.code,
      })

      toast({
        title: 'Verificação concluída!',
        description: 'Código validado com sucesso.',
      })

      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Código inválido')
      form.setValue('code', '')
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    try {
      await api.post('/auth/resend-2fa', { email })
      setTimeLeft(300)
      setCanResend(false)
      toast({
        title: 'Código reenviado!',
        description: 'Verifique seu e-mail ou aplicativo autenticador.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível reenviar o código',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-center">Autenticação de dois fatores</CardTitle>
        <CardDescription className="text-center">
          Digite o código de 6 dígitos enviado para seu e-mail ou gerado pelo seu aplicativo autenticador
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de verificação</FormLabel>
                  <FormControl>
                    <div className="flex justify-center space-x-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <Input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={field.value[index] || ''}
                          onChange={(e) => handleCodeChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-12 text-center text-lg"
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center text-sm text-muted-foreground">
              {timeLeft > 0 ? (
                <p>Código expira em {formatTime(timeLeft)}</p>
              ) : (
                <p>Código expirado</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Verificar'
              )}
            </Button>

            <div className="flex justify-between text-sm">
              <button
                type="button"
                onClick={resendCode}
                disabled={!canResend || isLoading}
                className="text-primary hover:underline disabled:opacity-50 disabled:hover:no-underline"
              >
                Reenviar código
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="text-muted-foreground hover:underline"
              >
                Voltar
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}