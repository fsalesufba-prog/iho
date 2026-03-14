'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
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
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  empresa: z.string().optional(),
  mensagem: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
})

type FormData = z.infer<typeof formSchema>

export function Contato() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      mensagem: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      await api.post('/contato', data)
      
      toast({
        title: 'Mensagem enviada!',
        description: 'Entraremos em contato em breve.',
      })
      
      form.reset()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20">
      <Container size="lg">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Entre em Contato</h2>
          <p className="text-xl text-muted-foreground">
            Tire suas dúvidas ou agende uma demonstração
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações de Contato */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">E-mail</h3>
                      <a
                        href="mailto:contato@sqtecnologiadainformacao.com"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        contato@sqtecnologiadainformacao.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Telefone</h3>
                      <p className="text-sm text-muted-foreground">
                        (11) 0000-0000
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Segunda a Sexta, 9h às 18h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">Endereço</h3>
                      <p className="text-sm text-muted-foreground">
                        São Paulo, SP
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Seu nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail</FormLabel>
                            <FormControl>
                              <Input placeholder="seu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da sua empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mensagem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Digite sua mensagem..."
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Mensagem
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </section>
  )
}