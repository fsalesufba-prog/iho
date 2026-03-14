'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
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
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

const formSchema = z.object({
  email: z.string().email('E-mail inválido'),
  nome: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export function Newsletter() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      nome: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      await api.post('/newsletter/subscribe', data)

      setIsSuccess(true)
      toast({
        title: 'Inscrição realizada!',
        description: 'Você receberá nossas atualizações por e-mail.',
      })
    } catch (error) {
      console.error('Erro ao se inscrever:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível realizar a inscrição',
<<<<<<< HEAD
        variant: 'destructive',
=======
        variant: 'error',
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <section className="py-20">
        <Container size="lg">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Inscrição confirmada!</h3>
              <p className="text-muted-foreground">
                Agora você receberá nossas novidades e conteúdos exclusivos por e-mail.
              </p>
            </CardContent>
          </Card>
        </Container>
      </section>
    )
  }

  return (
    <section className="py-20">
      <Container size="lg">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Newsletter</CardTitle>
            <CardDescription className="text-lg">
              Receba conteúdos exclusivos sobre gestão de equipamentos e IHO
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md mx-auto space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="seu@email.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inscrevendo...
                    </>
                  ) : (
                    'Inscrever-se'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ao se inscrever, você concorda com nossa Política de Privacidade.
                  Você pode cancelar a inscrição a qualquer momento.
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </Container>
    </section>
  )
}