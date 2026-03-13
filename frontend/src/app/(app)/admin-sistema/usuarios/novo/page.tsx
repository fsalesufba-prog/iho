'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Info,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Alert, AlertDescription } from '@/components/ui/Alert'

import { Progress } from '@/components/ui/Progress'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { masks } from '@/lib/masks'

import { cn } from '@/lib/utils'

const usuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido').optional(),
  tipo: z.enum(['adm_sistema', 'adm_empresa', 'controlador', 'apontador']),
  empresaId: z.string().optional(),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirme a senha'),
  ativo: z.boolean().default(true),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
})

type UsuarioFormData = z.infer<typeof usuarioSchema>

export default function NovoUsuarioPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [empresas, setEmpresas] = useState<any[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [forcaSenha, setForcaSenha] = useState(0)

  const form = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      tipo: 'apontador',
      empresaId: '',
      senha: '',
      confirmarSenha: '',
      ativo: true,
    }
  })

  const tipoSelecionado = form.watch('tipo')
  const senha = form.watch('senha')

  useEffect(() => {
    carregarEmpresas()
  }, [])

  useEffect(() => {
    // Calcular força da senha
    let forca = 0
    if (senha.length >= 6) forca++
    if (/[A-Z]/.test(senha)) forca++
    if (/[a-z]/.test(senha)) forca++
    if (/[0-9]/.test(senha)) forca++
    if (/[^A-Za-z0-9]/.test(senha)) forca++
    setForcaSenha(forca)
  }, [senha])

  const carregarEmpresas = async () => {
    try {
      const response = await api.get('/empresas', { params: { limit: 100, status: 'ativo' } })
      setEmpresas(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const onSubmit = async (data: UsuarioFormData) => {
    try {
      setLoading(true)

      const payload = {
        ...data,
        empresaId: data.empresaId ? parseInt(data.empresaId) : null,
      }

      await api.post('/usuarios', payload)

      toast({
        title: 'Sucesso',
        description: 'Usuário criado com sucesso'
      })

      router.push('/admin-sistema/usuarios')
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error)
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Não foi possível criar o usuário',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getForcaTexto = () => {
    if (forcaSenha <= 2) return { texto: 'Fraca', cor: 'text-red-600' }
    if (forcaSenha <= 3) return { texto: 'Média', cor: 'text-yellow-600' }
    if (forcaSenha <= 4) return { texto: 'Boa', cor: 'text-blue-600' }
    return { texto: 'Forte', cor: 'text-green-600' }
  }

  const forcaTexto = getForcaTexto()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Novo Usuário</h1>
          <p className="text-muted-foreground">
            Cadastre um novo usuário no sistema
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                {...form.register('nome')}
                placeholder="Nome do usuário"
              />
              {form.formState.errors.nome && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.nome.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="usuario@email.com"
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  {...form.register('telefone')}
                  onChange={(e) => form.setValue('telefone', masks.phone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Usuário</Label>
                <Select
                  value={form.watch('tipo')}
                  onValueChange={(value: any) => form.setValue('tipo', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adm_sistema">Admin Sistema</SelectItem>
                    <SelectItem value="adm_empresa">Admin Empresa</SelectItem>
                    <SelectItem value="controlador">Controlador</SelectItem>
                    <SelectItem value="apontador">Apontador</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.tipo && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.tipo.message}
                  </p>
                )}
              </div>

              {tipoSelecionado !== 'adm_sistema' && (
                <div className="space-y-2">
                  <Label htmlFor="empresaId">Empresa</Label>
                  <Select
                    value={form.watch('empresaId')}
                    onValueChange={(value) => form.setValue('empresaId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.empresaId && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.empresaId.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    {...form.register('senha')}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.senha && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.senha.message}
                  </p>
                )}

                {senha.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs">Força da senha:</span>
                      <span className={cn('text-xs font-medium', forcaTexto.cor)}>
                        {forcaTexto.texto}
                      </span>
                    </div>
                    <Progress value={(forcaSenha / 5) * 100} className="h-1" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...form.register('confirmarSenha')}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {form.formState.errors.confirmarSenha && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.confirmarSenha.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <Switch
                id="ativo"
                checked={form.watch('ativo')}
                onCheckedChange={(checked) => form.setValue('ativo', checked)}
              />
              <Label htmlFor="ativo" className="font-medium">
                Usuário ativo
              </Label>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                O usuário receberá um e-mail com as instruções de acesso após a criação.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Usuário
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}