'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Shield,
  AlertCircle,
  Eye,
  EyeOff,
  Key
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useEmpresa } from '@/hooks/useEmpresa'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

const usuarioSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve ter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve ter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve ter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve ter pelo menos um caractere especial'),
  confirmarSenha: z.string(),
  telefone: z.string().optional(),
  cargo: z.string().optional(),
  departamento: z.string().optional(),
  tipo: z.enum(['adm_empresa', 'controlador', 'apontador']),
  enviarEmail: z.boolean().default(true)
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não conferem',
  path: ['confirmarSenha']
})

type UsuarioFormData = z.infer<typeof usuarioSchema>

export default function NovoUsuarioPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { empresa, plano } = useEmpresa()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      tipo: 'apontador',
      enviarEmail: true
    }
  })

  const tipo = watch('tipo')
  const senha = watch('senha')

  // Verificar limites do plano
  const verificarLimites = () => {
    if (!plano || !empresa) return true

    const stats = {
      adm_empresa: empresa.stats?.admEmpresa || 0,
      controlador: empresa.stats?.controladores || 0,
      apontador: empresa.stats?.apontadores || 0
    }

    const limites = {
      adm_empresa: plano.limiteAdm,
      controlador: plano.limiteControlador,
      apontador: plano.limiteApontador
    }

    if (stats[tipo] >= limites[tipo]) {
      toast({
        title: 'Limite do plano atingido',
        description: `Você já atingiu o limite de ${tipo === 'adm_empresa' ? 'administradores' : tipo === 'controlador' ? 'controladores' : 'apontadores'} do seu plano.`,
        variant: 'destructive'
      })
      return false
    }

    return true
  }

  const onSubmit = async (data: UsuarioFormData) => {
    if (user?.tipo !== 'adm_empresa') {
      toast({
        title: 'Permissão negada',
        description: 'Apenas administradores da empresa podem criar usuários.',
        variant: 'destructive'
      })
      return
    }

    if (!verificarLimites()) return

    try {
      setSaving(true)
      await api.post('/usuarios', data)
      
      toast({
        title: 'Usuário criado',
        description: 'O usuário foi criado com sucesso.'
      })

      router.push('/app-empresa/usuarios')
    } catch (error: any) {
      toast({
        title: 'Erro ao criar',
        description: error.response?.data?.message || 'Não foi possível criar o usuário.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  // Força da senha
  const getPasswordStrength = () => {
    if (!senha) return null

    let strength = 0
    if (senha.length >= 8) strength++
    if (/[A-Z]/.test(senha)) strength++
    if (/[a-z]/.test(senha)) strength++
    if (/[0-9]/.test(senha)) strength++
    if (/[^A-Za-z0-9]/.test(senha)) strength++

    if (strength <= 2) return { label: 'Fraca', color: 'bg-red-500', textColor: 'text-red-600' }
    if (strength <= 3) return { label: 'Média', color: 'bg-yellow-500', textColor: 'text-yellow-600' }
    if (strength <= 4) return { label: 'Boa', color: 'bg-blue-500', textColor: 'text-blue-600' }
    return { label: 'Forte', color: 'bg-green-500', textColor: 'text-green-600' }
  }

  const passwordStrength = getPasswordStrength()

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Novo Usuário" />
        
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
                <CardTitle>Novo Usuário</CardTitle>
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

                  {/* Senha */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" />
                      Senha
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="senha">Senha *</Label>
                        <div className="relative">
                          <Input
                            id="senha"
                            type={showPassword ? 'text' : 'password'}
                            {...register('senha')}
                            error={!!errors.senha}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.senha && (
                          <p className="text-sm text-destructive">{errors.senha.message}</p>
                        )}
                        {senha && passwordStrength && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                  style={{ width: `${(senha.length / 20) * 100}%` }}
                                />
                              </div>
                              <span className={`text-xs font-medium ${passwordStrength.textColor}`}>
                                {passwordStrength.label}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmarSenha">Confirmar senha *</Label>
                        <div className="relative">
                          <Input
                            id="confirmarSenha"
                            type={showConfirmPassword ? 'text' : 'password'}
                            {...register('confirmarSenha')}
                            error={!!errors.confirmarSenha}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmarSenha && (
                          <p className="text-sm text-destructive">{errors.confirmarSenha.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium mb-2">Requisitos da senha:</p>
                      <ul className="space-y-1 text-sm">
                        <li className={cn('flex items-center gap-2', 
                          senha?.length >= 8 ? 'text-green-600' : 'text-muted-foreground'
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full',
                            senha?.length >= 8 ? 'bg-green-600' : 'bg-muted-foreground'
                          )} />
                          Pelo menos 8 caracteres
                        </li>
                        <li className={cn('flex items-center gap-2',
                          /[A-Z]/.test(senha) ? 'text-green-600' : 'text-muted-foreground'
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full',
                            /[A-Z]/.test(senha) ? 'bg-green-600' : 'bg-muted-foreground'
                          )} />
                          Uma letra maiúscula
                        </li>
                        <li className={cn('flex items-center gap-2',
                          /[a-z]/.test(senha) ? 'text-green-600' : 'text-muted-foreground'
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full',
                            /[a-z]/.test(senha) ? 'bg-green-600' : 'bg-muted-foreground'
                          )} />
                          Uma letra minúscula
                        </li>
                        <li className={cn('flex items-center gap-2',
                          /[0-9]/.test(senha) ? 'text-green-600' : 'text-muted-foreground'
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full',
                            /[0-9]/.test(senha) ? 'bg-green-600' : 'bg-muted-foreground'
                          )} />
                          Um número
                        </li>
                        <li className={cn('flex items-center gap-2',
                          /[^A-Za-z0-9]/.test(senha) ? 'text-green-600' : 'text-muted-foreground'
                        )}>
                          <div className={cn('w-1.5 h-1.5 rounded-full',
                            /[^A-Za-z0-9]/.test(senha) ? 'bg-green-600' : 'bg-muted-foreground'
                          )} />
                          Um caractere especial
                        </li>
                      </ul>
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

                  {/* Configurações adicionais */}
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-semibold">Configurações</h3>

                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <Label htmlFor="enviarEmail" className="font-medium">Enviar email de boas-vindas</Label>
                        <p className="text-sm text-muted-foreground">
                          O usuário receberá um email com instruções de acesso
                        </p>
                      </div>
                      <Switch
                        id="enviarEmail"
                        checked={watch('enviarEmail')}
                        onCheckedChange={(checked) => setValue('enviarEmail', checked)}
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
                          Criando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Criar usuário
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