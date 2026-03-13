'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, User, Shield } from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  tipo: z.enum(['adm_empresa', 'controlador', 'apontador']),
  ativo: z.boolean()
})

type UsuarioFormData = z.infer<typeof usuarioSchema>

export default function EditarUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      ativo: true
    }
  })

  const tipo = watch('tipo')
  const ativo = watch('ativo')

  useEffect(() => {
    carregarUsuario()
  }, [params.id])

  const carregarUsuario = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/usuarios/${params.id}`)
      const usuario = response.data

      reset({
        nome: usuario.nome,
        email: usuario.email,
        telefone: usuario.telefone || '',
        cargo: usuario.cargo || '',
        departamento: usuario.departamento || '',
        tipo: usuario.tipo,
        ativo: usuario.ativo
      })
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuário',
        description: 'Não foi possível carregar os dados do usuário.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: UsuarioFormData) => {
    if (user?.tipo !== 'adm_empresa') {
      toast({
        title: 'Permissão negada',
        description: 'Apenas administradores da empresa podem editar usuários.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      await api.put(`/usuarios/${params.id}`, data)
      
      toast({
        title: 'Usuário atualizado',
        description: 'Os dados do usuário foram atualizados com sucesso.'
      })

      router.push(`/app-empresa/usuarios/${params.id}`)
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.response?.data?.message || 'Não foi possível atualizar o usuário.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Carregando..." />
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

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Editar Usuário" />
        
        <Container size="lg" className="py-8">
          <div className="mb-6">
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
          >
            <Card>
              <CardHeader>
                <CardTitle>Editar Usuário</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Dados Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Dados Pessoais
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome completo *</Label>
                        <Input
                          id="nome"
                          {...register('nome')}
                          error={!!errors.nome}
                        />
                        {errors.nome && (
                          <p className="text-sm text-destructive">{errors.nome.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          error={!!errors.email}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          {...register('telefone')}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo</Label>
                        <Input
                          id="cargo"
                          {...register('cargo')}
                          placeholder="Ex: Gerente de Operações"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="departamento">Departamento</Label>
                        <Input
                          id="departamento"
                          {...register('departamento')}
                          placeholder="Ex: Operações"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Permissões */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Permissões
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo de usuário *</Label>
                        <Select
                          value={tipo}
                          onValueChange={(value: any) => setValue('tipo', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adm_empresa">ADM Empresa</SelectItem>
                            <SelectItem value="controlador">Controlador</SelectItem>
                            <SelectItem value="apontador">Apontador</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.tipo && (
                          <p className="text-sm text-destructive">{errors.tipo.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        <strong>ADM Empresa:</strong> Acesso completo à gestão da empresa
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Controlador:</strong> Acesso a controle e indicadores
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        <strong>Apontador:</strong> Acesso apenas a apontamentos
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Status</h3>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <Label htmlFor="ativo" className="font-medium">Usuário ativo</Label>
                        <p className="text-sm text-muted-foreground">
                          {ativo 
                            ? 'Usuário pode acessar o sistema' 
                            : 'Usuário não pode acessar o sistema'}
                        </p>
                      </div>
                      <Switch
                        id="ativo"
                        checked={ativo}
                        onCheckedChange={(checked) => setValue('ativo', checked)}
                      />
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Salvar alterações
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>
    </>
  )
}