'use client'

import React, { useState, useEffect } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { RefreshCw, CreditCard, QrCode, Barcode } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/components/hooks/useAuth'
import { useToast } from '@/components/hooks/useToast'

const formSchema = z.object({
  empresaId: z.string().min(1, 'Empresa é obrigatória'),
  tipo: z.enum(['implantacao', 'mensalidade']),
  valor: z.number().min(0.01, 'Valor deve ser maior que zero'),
  dataVencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  formaPagamento: z.enum(['cartao', 'pix', 'boleto']).optional(),
  observacoes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface PagamentoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pagamento?: any
  onSuccess?: () => void
}

export function PagamentoForm({ open, onOpenChange, pagamento, onSuccess }: PagamentoFormProps) {
  const [loading, setLoading] = useState(false)
  const [empresas, setEmpresas] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('principal')
  const [linkPagamento, setLinkPagamento] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [boleto, setBoleto] = useState<string | null>(null)

  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresaId: '',
      tipo: 'mensalidade',
      valor: 0,
      dataVencimento: '',
      formaPagamento: undefined,
      observacoes: '',
    }
  })

  const valor = form.watch('valor')

  useEffect(() => {
    if (user?.tipo === 'adm_sistema') {
      carregarEmpresas()
    } else {
      // Se for admin de empresa, seta o ID da empresa automaticamente
      form.setValue('empresaId', user?.empresaId?.toString() || '')
    }
  }, [user])

  useEffect(() => {
    if (pagamento) {
      form.reset({
        empresaId: pagamento.empresaId.toString(),
        tipo: pagamento.tipo,
        valor: pagamento.valor,
        dataVencimento: pagamento.dataVencimento?.split('T')[0] || '',
        formaPagamento: pagamento.formaPagamento,
        observacoes: pagamento.observacoes || '',
      })
    }
  }, [pagamento, form])

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/empresas', { params: { limit: 100 } })
      setEmpresas(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const gerarLinkPagamento = async () => {
    try {
      setLoading(true)
      const response = await api.post('/pagamentos/gerar-link', {
        empresaId: parseInt(form.getValues('empresaId')),
        tipo: form.getValues('tipo'),
        valor: form.getValues('valor')
      })
      
      if (response.data.link) {
        setLinkPagamento(response.data.link)
        setActiveTab('pagamento')
      }
    } catch (error) {
      console.error('Erro ao gerar link:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o link de pagamento',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const gerarPix = async () => {
    try {
      setLoading(true)
      const response = await api.post('/pagamentos/gerar-pix', {
        empresaId: parseInt(form.getValues('empresaId')),
        tipo: form.getValues('tipo'),
        valor: form.getValues('valor')
      })
      
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode)
        setActiveTab('pagamento')
      }
    } catch (error) {
      console.error('Erro ao gerar PIX:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PIX',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const gerarBoleto = async () => {
    try {
      setLoading(true)
      const response = await api.post('/pagamentos/gerar-boleto', {
        empresaId: parseInt(form.getValues('empresaId')),
        tipo: form.getValues('tipo'),
        valor: form.getValues('valor')
      })
      
      if (response.data.boleto) {
        setBoleto(response.data.boleto)
        setActiveTab('pagamento')
      }
    } catch (error) {
      console.error('Erro ao gerar boleto:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o boleto',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      const payload = {
        ...data,
        empresaId: parseInt(data.empresaId),
      }

      if (pagamento) {
        await api.put(`/pagamentos/${pagamento.id}`, payload)
        toast({
          title: 'Sucesso',
          description: 'Pagamento atualizado com sucesso'
        })
      } else {
        await api.post('/pagamentos', payload)
        toast({
          title: 'Sucesso',
          description: 'Pagamento criado com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar pagamento:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o pagamento',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {pagamento ? 'Editar Pagamento' : 'Novo Pagamento'}
          </DialogTitle>
          <DialogDescription>
            {pagamento 
              ? 'Edite as informações do pagamento'
              : 'Registre um novo pagamento no sistema'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="principal">Principal</TabsTrigger>
            <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="principal" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="empresaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      {user?.tipo === 'adm_sistema' ? (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a empresa" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {empresas.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id.toString()}>
                                {emp.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          value={user?.empresaId?.toString() || ''} 
                          disabled 
                          className="bg-muted"
                        />
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="implantacao">Implantação</SelectItem>
                            <SelectItem value="mensalidade">Mensalidade</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dataVencimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="formaPagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione (opcional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cartao">Cartão de Crédito</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Opcional - pode ser definido depois
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
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações sobre o pagamento..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!pagamento && (
                  <div className="grid grid-cols-3 gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={gerarLinkPagamento}
                      disabled={loading || !valor}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Link
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={gerarPix}
                      disabled={loading || !valor}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      PIX
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={gerarBoleto}
                      disabled={loading || !valor}
                    >
                      <Barcode className="h-4 w-4 mr-2" />
                      Boleto
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="pagamento" className="space-y-4 mt-4">
                {linkPagamento && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Link de Pagamento</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm break-all">{linkPagamento}</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(linkPagamento)
                        toast({
                          title: 'Copiado!',
                          description: 'Link copiado para a área de transferência'
                        })
                      }}
                    >
                      Copiar Link
                    </Button>
                  </div>
                )}

                {qrCode && (
                  <div className="space-y-4 text-center">
                    <h3 className="text-lg font-medium">PIX Copia e Cola</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <img src={qrCode} alt="QR Code PIX" className="mx-auto w-64 h-64" />
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(qrCode)
                        toast({
                          title: 'Copiado!',
                          description: 'Código PIX copiado para a área de transferência'
                        })
                      }}
                    >
                      Copiar Código PIX
                    </Button>
                  </div>
                )}

                {boleto && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Boleto Bancário</h3>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm">Linha Digitável: {boleto}</p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => window.open(boleto, '_blank')}
                    >
                      Visualizar Boleto
                    </Button>
                  </div>
                )}
              </TabsContent>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                  {pagamento ? 'Atualizar' : 'Criar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}