'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  User,
  Shield,
  Eye,
  EyeOff,
  Key,
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
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { useEmpresa } from '@/hooks/useEmpresa'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

type TipoUsuario = 'adm_empresa' | 'controlador' | 'apontador'

export default function NovoUsuarioPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { empresa, plano } = useEmpresa()
  const { toast } = useToast()

  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estados do formulário
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cargo, setCargo] = useState('')
  const [departamento, setDepartamento] = useState('')
  const [tipo, setTipo] = useState<TipoUsuario>('apontador')
  const [enviarEmail, setEnviarEmail] = useState(true)

  // Estados de erro
  const [errors, setErrors] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    tipo: '',
  })

  // Verificar limites do plano
  const verificarLimites = () => {
    if (!plano || !empresa) return true

    // Garantir que stats existe com valores padrão
    const empresaAny = empresa as any
    const stats = {
      adm_empresa: empresaAny.stats?.admEmpresa || 0,
      controlador: empresaAny.stats?.controladores || 0,
      apontador: empresaAny.stats?.apontadores || 0
    }

    const limites = {
      adm_empresa: plano.limiteAdm || 0,
      controlador: plano.limiteControlador || 0,
      apontador: plano.limiteApontador || 0
    }

    const tipoKey = tipo as keyof typeof stats
    const limiteKey = tipo as keyof typeof limites

    if (stats[tipoKey] >= limites[limiteKey]) {
      const tipoNome = tipo === 'adm_empresa' ? 'administradores' : 
                       tipo === 'controlador' ? 'controladores' : 'apontadores'
      
      toast({
        title: 'Limite do plano atingido',
        description: `Você já atingiu o limite de ${tipoNome} do seu plano.`,
        variant: 'destructive'
      })
      return false
    }

    return true
  }

  const validate = () => {
    const newErrors = {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      tipo: '',
    }
    let isValid = true

    if (!nome || nome.length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres'
      isValid = false
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
      isValid = false
    }

    // Validação de senha
    if (!senha) {
      newErrors.senha = 'Senha é obrigatória'
      isValid = false
    } else {
      if (senha.length < 8) {
        newErrors.senha = 'Senha deve ter pelo menos 8 caracteres'
        isValid = false
      } else if (!/[A-Z]/.test(senha)) {
        newErrors.senha = 'Senha deve ter pelo menos uma letra maiúscula'
        isValid = false
      } else if (!/[a-z]/.test(senha)) {
        newErrors.senha = 'Senha deve ter pelo menos uma letra minúscula'
        isValid = false
      } else if (!/[0-9]/.test(senha)) {
        newErrors.senha = 'Senha deve ter pelo menos um número'
        isValid = false
      } else if (!/[^A-Za-z0-9]/.test(senha)) {
        newErrors.senha = 'Senha deve ter pelo menos um caractere especial'
        isValid = false
      }
    }

    if (!confirmarSenha) {
      newErrors.confirmarSenha = 'Confirme a senha'
      isValid = false
    } else if (senha !== confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não conferem'
      isValid = false
    }

    if (!tipo) {
      newErrors.tipo = 'Tipo de usuário é obrigatório'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (user?.tipo !== 'adm_empresa') {
      toast({
        title: 'Permissão negada',
        description: 'Apenas administradores da empresa podem criar usuários.',
        variant: 'destructive'
      })
      return
    }

    if (!validate()) return
    if (!verificarLimites()) return

    try {
      setSaving(true)

      const payload = {
        nome,
        email,
        senha,
        telefone: telefone || null,
        cargo: cargo || null,
        departamento: departamento || null,
        tipo,
        enviarEmail
      }

      await api.post('/usuarios', payload)
      
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
                <form onSubmit={onSubmit} className="space-y-6">
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
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className={errors.nome ? 'border-destructive' : ''}
                        />
                        {errors.nome && (
                          <p className="text-sm text-destructive">{errors.nome}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          placeholder="(11) 99999-9999"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo</Label>
                        <Input
                          id="cargo"
                          value={cargo}
                          onChange={(e) => setCargo(e.target.value)}
                          placeholder="Ex: Gerente de Operações"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="departamento">Departamento</Label>
                        <Input
                          id="departamento"
                          value={departamento}
                          onChange={(e) => setDepartamento(e.target.value)}
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
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className={errors.senha ? 'border-destructive' : ''}
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
                          <p className="text-sm text-destructive">{errors.senha}</p>
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
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            className={errors.confirmarSenha ? 'border-destructive' : ''}
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
                          <p className="text-sm text-destructive">{errors.confirmarSenha}</p>
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
                        <Select value={tipo} onValueChange={(value: TipoUsuario) => setTipo(value)}>
                          <SelectTrigger className={errors.tipo ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adm_empresa">ADM Empresa</SelectItem>
                            <SelectItem value="controlador">Controlador</SelectItem>
                            <SelectItem value="apontador">Apontador</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.tipo && (
                          <p className="text-sm text-destructive">{errors.tipo}</p>
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
                        checked={enviarEmail}
                        onCheckedChange={setEnviarEmail}
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