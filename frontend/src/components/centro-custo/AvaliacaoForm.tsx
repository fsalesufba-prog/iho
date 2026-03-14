'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'

const formSchema = z.object({
  precoCondicoes: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  qualidadeServico: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  qualidadeEntrega: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  segurançaSaude: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  estoque: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  administracao: z.number()
    .min(0, 'Nota deve ser entre 0 e 5')
    .max(5, 'Nota deve ser entre 0 e 5'),
  ocorrencias: z.string().optional(),
  observacoes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const pesos = {
  precoCondicoes: 0.20, // 20%
  qualidadeServico: 0.25, // 25%
  qualidadeEntrega: 0.15, // 15%
  segurançaSaude: 0.25, // 25%
  estoque: 0.10, // 10%
  administracao: 0.05, // 5%
}

interface AvaliacaoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  centroId: number
  centroNome: string
  avaliacao?: any
  onSuccess?: () => void
}

export function AvaliacaoForm({ 
  open, 
  onOpenChange, 
  centroId,
  centroNome,
  avaliacao,
  onSuccess 
}: AvaliacaoFormProps) {
  const [loading, setLoading] = useState(false)
  const [notaFinal, setNotaFinal] = useState(0)
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: avaliacao ? {
      precoCondicoes: avaliacao.precoCondicoes,
      qualidadeServico: avaliacao.qualidadeServico,
      qualidadeEntrega: avaliacao.qualidadeEntrega,
      segurançaSaude: avaliacao.segurançaSaude,
      estoque: avaliacao.estoque,
      administracao: avaliacao.administracao,
      ocorrencias: avaliacao.ocorrencias || '',
      observacoes: avaliacao.observacoes || '',
    } : {
      precoCondicoes: 3,
      qualidadeServico: 3,
      qualidadeEntrega: 3,
      segurançaSaude: 3,
      estoque: 3,
      administracao: 3,
      ocorrencias: '',
      observacoes: '',
    }
  })

  const watchAllFields = form.watch()

  React.useEffect(() => {
    calcularNotaFinal()
  }, [watchAllFields])

  const calcularNotaFinal = () => {
    const values = form.getValues()
    let total = 0
    
    total += values.precoCondicoes * pesos.precoCondicoes
    total += values.qualidadeServico * pesos.qualidadeServico
    total += values.qualidadeEntrega * pesos.qualidadeEntrega
    total += values.segurançaSaude * pesos.segurançaSaude
    total += values.estoque * pesos.estoque
    total += values.administracao * pesos.administracao

    setNotaFinal(Number(total.toFixed(2)))
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      const payload = {
        ...data,
        centroCustoId: centroId,
        avaliadorId: user?.id,
        notaFinal,
      }

      if (avaliacao) {
        await api.put(`/centros-custo/avaliacoes/${avaliacao.id}`, payload)
        toast({
          title: 'Sucesso',
          description: 'Avaliação atualizada com sucesso'
        })
      } else {
        await api.post('/centros-custo/avaliacoes', payload)
        toast({
          title: 'Sucesso',
          description: 'Avaliação registrada com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a avaliação',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600'
    if (nota >= 3.5) return 'text-blue-600'
    if (nota >= 2.5) return 'text-yellow-600'
    if (nota >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {avaliacao ? 'Editar Avaliação' : 'Nova Avaliação'}
          </DialogTitle>
          <DialogDescription>
            Centro de Custo: {centroNome}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nota Final em Destaque */}
            <Alert className="bg-primary/5 border-primary">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span className="font-medium">Nota Final Calculada:</span>
                <span className={`text-2xl font-bold ${getNotaColor(notaFinal)}`}>
                  {notaFinal.toFixed(2)}
                </span>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              {/* Preço e Condições (20%) */}
              <FormField
                control={form.control}
                name="precoCondicoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Preço e Condições (20%)
                      <span className="ml-2 text-xs text-muted-foreground">
                        Peso: 20%
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Avalie o preço e as condições de pagamento
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Qualidade do Serviço (25%) */}
              <FormField
                control={form.control}
                name="qualidadeServico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Qualidade do Serviço (25%)
                      <span className="ml-2 text-xs text-muted-foreground">
                        Peso: 25%
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Avalie a qualidade dos serviços prestados
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Qualidade de Entrega (15%) */}
              <FormField
                control={form.control}
                name="qualidadeEntrega"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Qualidade de Entrega (15%)
                      <span className="ml-2 text-xs text-muted-foreground">
                        Peso: 15%
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Avalie o cumprimento de prazos e cronogramas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Segurança, Meio Ambiente e Saúde (25%) */}
              <FormField
                control={form.control}
                name="segurançaSaude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Segurança, Meio Ambiente e Saúde (25%)
                      <span className="ml-2 text-xs text-muted-foreground">
                        Peso: 25%
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Avalie as práticas de segurança e meio ambiente
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estoque (10%) */}
              <FormField
                control={form.control}
                name="estoque"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Estoque (10%)
                      <span className="ml-2 text-xs text-muted-foreground">
                        Peso: 10%
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Avalie a gestão de estoque e materiais
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Administração (5%) */}
              <FormField
                control={form.control}
                name="administracao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Administração (5%)
                      <span className="ml-2 text-xs text-muted-foreground">
                        Peso: 5%
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Avalie a parte administrativa e documentação
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ocorrencias"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ocorrências (afetam a nota)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva ocorrências que impactaram negativamente..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ocorrências como acidentes, atrasos graves, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Gerais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observações adicionais sobre a avaliação..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                {avaliacao ? 'Atualizar Avaliação' : 'Registrar Avaliação'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}