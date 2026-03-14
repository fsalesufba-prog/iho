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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { RefreshCw, UserPlus } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'
<<<<<<< HEAD
import { Masks } from '@/lib/masks'
=======
import { masks } from '@/lib/masks'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be

const empresaSchema = z.object({
  // Dados da Empresa
  nome: z.string().min(1, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().min(8, 'CEP inválido').max(9),
  planoId: z.number().min(1, 'Plano é obrigatório'),
  status: z.enum(['ativo', 'inativo', 'atrasado', 'cancelado']).default('ativo'),
})

const usuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  telefone: z.string().min(10, 'Telefone inválido'),
})

type EmpresaFormData = z.infer<typeof empresaSchema>
type UsuarioFormData = z.infer<typeof usuarioSchema>

interface EmpresaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  empresa?: any
  onSuccess?: () => void
}

export function EmpresaForm({ open, onOpenChange, empresa, onSuccess }: EmpresaFormProps) {
  const [loading, setLoading] = useState(false)
  const [planos, setPlanos] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('empresa')
  const [criarUsuario, setCriarUsuario] = useState(!empresa)

  const { toast } = useToast()

  const empresaForm = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      planoId: 0,
      status: 'ativo',
    }
  })

  const usuarioForm = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      telefone: '',
    }
  })

  useEffect(() => {
    carregarPlanos()
  }, [])

  useEffect(() => {
    if (empresa) {
      empresaForm.reset({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        email: empresa.email,
        telefone: empresa.telefone,
        endereco: empresa.endereco,
        cidade: empresa.cidade,
        estado: empresa.estado,
        cep: empresa.cep,
        planoId: empresa.planoId,
        status: empresa.status,
      })
    }
  }, [empresa, empresaForm])

  const carregarPlanos = async () => {
    try {
      const response = await api.get('/planos', { params: { limit: 100 } })
      setPlanos(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    }
  }

  const onSubmit = async (data: EmpresaFormData) => {
    try {
      setLoading(true)

      let usuarioData = null
      if (criarUsuario && !empresa) {
        const isValid = await usuarioForm.trigger()
        if (!isValid) {
          setActiveTab('usuario')
          return
        }
        usuarioData = usuarioForm.getValues()
      }

      if (empresa) {
        await api.put(`/empresas/${empresa.id}`, data)
        toast({
          title: 'Sucesso',
          description: 'Empresa atualizada com sucesso'
        })
      } else {
        await api.post('/empresas', {
          empresa: data,
          usuario: usuarioData
        })
        toast({
          title: 'Sucesso',
          description: 'Empresa criada com sucesso'
        })
      }

      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a empresa',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {empresa ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
          <DialogDescription>
            {empresa 
              ? 'Edite as informações da empresa'
              : 'Adicione uma nova empresa ao sistema'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
            {!empresa && criarUsuario && (
              <TabsTrigger value="usuario">Usuário Administrador</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="empresa">
            <Form {...empresaForm}>
              <form onSubmit={empresaForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={empresaForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Razão Social" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={empresaForm.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00.000.000/0000-00"
                            {...field}
<<<<<<< HEAD
                            onChange={(e) => field.onChange(Masks.cnpj(e.target.value))}
=======
                            onChange={(e) => field.onChange(masks.cnpj(e.target.value))}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={empresaForm.control}
                    name="planoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plano</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um plano" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {planos.map((plano) => (
                              <SelectItem key={plano.id} value={plano.id.toString()}>
                                {plano.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={empresaForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="empresa@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={empresaForm.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            {...field}
<<<<<<< HEAD
                            onChange={(e) => field.onChange(Masks.phone(e.target.value))}
=======
                            onChange={(e) => field.onChange(masks.phone(e.target.value))}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={empresaForm.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, complemento" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={empresaForm.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={empresaForm.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="UF"
                            maxLength={2}
                            className="uppercase"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={empresaForm.control}
                    name="cep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000-000"
                            {...field}
<<<<<<< HEAD
                            onChange={(e) => field.onChange(Masks.cep(e.target.value))}
=======
                            onChange={(e) => field.onChange(masks.cep(e.target.value))}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={empresaForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="atrasado">Em atraso</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!empresa && !criarUsuario && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCriarUsuario(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar usuário administrador
                  </Button>
                )}

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
                    {empresa ? 'Atualizar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {!empresa && criarUsuario && (
            <TabsContent value="usuario">
              <Form {...usuarioForm}>
                <div className="space-y-4">
                  <FormField
                    control={usuarioForm.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do administrador" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={usuarioForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input placeholder="admin@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={usuarioForm.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="(00) 00000-0000"
                              {...field}
<<<<<<< HEAD
                              onChange={(e) => field.onChange(Masks.phone(e.target.value))}
=======
                              onChange={(e) => field.onChange(masks.phone(e.target.value))}
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={usuarioForm.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Mínimo de 6 caracteres
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab('empresa')}
                    >
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        usuarioForm.trigger().then((isValid) => {
                          if (isValid) {
                            setActiveTab('empresa')
                          }
                        })
                      }}
                    >
                      Continuar
                    </Button>
                  </DialogFooter>
                </div>
              </Form>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}