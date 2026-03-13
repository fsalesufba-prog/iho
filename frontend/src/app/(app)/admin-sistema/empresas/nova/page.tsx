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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Alert, AlertDescription } from '@/components/ui/Alert'

import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { masks } from '@/lib/masks'

const empresaSchema = z.object({
  nome: z.string().min(1, 'Nome da empresa é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().min(8, 'CEP inválido').max(9),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  planoId: z.string().min(1, 'Plano é obrigatório'),
  status: z.enum(['ativo', 'inativo', 'pendente']).default('ativo'),
})

const usuarioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string().min(6, 'Confirme a senha'),
  telefone: z.string().min(10, 'Telefone inválido').optional(),
  cargo: z.string().optional(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não conferem",
  path: ["confirmarSenha"],
})

type EmpresaFormData = z.infer<typeof empresaSchema>
type UsuarioFormData = z.infer<typeof usuarioSchema>

export default function NovaEmpresaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [planos, setPlanos] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('empresa')
  const [criarUsuario, setCriarUsuario] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)


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
      numero: '',
      complemento: '',
      bairro: '',
      planoId: '',
      status: 'ativo',
    }
  })

  const usuarioForm = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      telefone: '',
      cargo: '',
    }
  })

  useEffect(() => {
    carregarPlanos()
  }, [])

  const carregarPlanos = async () => {
    try {
      const response = await api.get('/planos', { params: { limit: 100, ativos: true } })
      setPlanos(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar planos:', error)
    }
  }

  const onSubmit = async (data: EmpresaFormData) => {
    try {
      setLoading(true)

      let usuarioData = null
      if (criarUsuario) {
        const usuarioValid = await usuarioForm.trigger()
        if (!usuarioValid) {
          setActiveTab('usuario')
          return
        }
        usuarioData = usuarioForm.getValues()
      }

      const payload = {
        empresa: {
          ...data,
          planoId: parseInt(data.planoId),
          enderecoCompleto: `${data.endereco}, ${data.numero}${data.complemento ? ` - ${data.complemento}` : ''} - ${data.bairro}`,
        },
        usuario: usuarioData ? {
          ...usuarioData,
          tipo: 'adm_empresa',
        } : undefined
      }

      await api.post('/empresas', payload)

      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso'
      })

      router.push('/admin-sistema/empresas')
    } catch (error: any) {
      console.error('Erro ao criar empresa:', error)
      toast({
        title: 'Erro',
        description: error.response?.data?.message || 'Não foi possível criar a empresa',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <h1 className="text-3xl font-bold">Nova Empresa</h1>
            <p className="text-muted-foreground">
              Cadastre uma nova empresa no sistema
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="empresa">Dados da Empresa</TabsTrigger>
          <TabsTrigger value="usuario" disabled={!criarUsuario}>
            Usuário Administrador
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa" className="mt-6">
          <form onSubmit={empresaForm.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Empresa</Label>
                    <Input
                      id="nome"
                      {...empresaForm.register('nome')}
                      placeholder="Razão Social"
                    />
                    {empresaForm.formState.errors.nome && (
                      <p className="text-xs text-destructive">
                        {empresaForm.formState.errors.nome.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      {...empresaForm.register('cnpj')}
                      onChange={(e) => empresaForm.setValue('cnpj', masks.cnpj(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                    />
                    {empresaForm.formState.errors.cnpj && (
                      <p className="text-xs text-destructive">
                        {empresaForm.formState.errors.cnpj.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      {...empresaForm.register('email')}
                      placeholder="contato@empresa.com"
                    />
                    {empresaForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {empresaForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      {...empresaForm.register('telefone')}
                      onChange={(e) => empresaForm.setValue('telefone', masks.phone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                    {empresaForm.formState.errors.telefone && (
                      <p className="text-xs text-destructive">
                        {empresaForm.formState.errors.telefone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    {...empresaForm.register('endereco')}
                    placeholder="Rua, Avenida..."
                  />
                  {empresaForm.formState.errors.endereco && (
                    <p className="text-xs text-destructive">
                      {empresaForm.formState.errors.endereco.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      {...empresaForm.register('numero')}
                      placeholder="123"
                    />
                    {empresaForm.formState.errors.numero && (
                      <p className="text-xs text-destructive">
                        {empresaForm.formState.errors.numero.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      {...empresaForm.register('complemento')}
                      placeholder="Sala, Andar..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      {...empresaForm.register('bairro')}
                      placeholder="Centro"
                    />
                    {empresaForm.formState.errors.bairro && (
                      <p className="text-xs text-destructive">
                        {empresaForm.formState.errors.bairro.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      {...empresaForm.register('cidade')}
                      placeholder="São Paulo"
                    />
                    {empresaForm.formState.errors.cidade && (
                      <p className="text-xs text-destructive">
                        {empresaForm.formState.errors.cidade.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={empresaForm.watch('estado')}
                      onValueChange={(value) => empresaForm.setValue('estado', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((uf) => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {empresaForm.formState.errors.estado && (
                      <p className="text-xs text-destructive">
                        {empresaForm.formState.errors.estado.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      {...empresaForm.register('cep')}
                      onChange={(e) => empresaForm.setValue('cep', masks.cep(e.target.value))}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {empresaForm.formState.errors.cep && (
                      <p className="text-xs text-destructive">
                        {empresaForm.formState.errors.cep.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plano">Plano</Label>
                  <Select
                    value={empresaForm.watch('planoId')}
                    onValueChange={(value) => empresaForm.setValue('planoId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {planos.map((plano) => (
                        <SelectItem key={plano.id} value={plano.id.toString()}>
                          {plano.nome} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valorMensal)}/mês
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {empresaForm.formState.errors.planoId && (
                    <p className="text-xs text-destructive">
                      {empresaForm.formState.errors.planoId.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={empresaForm.watch('status')}
                    onValueChange={(value: any) => empresaForm.setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Switch
                    id="criar-usuario"
                    checked={criarUsuario}
                    onCheckedChange={setCriarUsuario}
                  />
                  <Label htmlFor="criar-usuario" className="font-medium">
                    Criar usuário administrador
                  </Label>
                </div>

                {!criarUsuario && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      O administrador da empresa deverá fazer o primeiro acesso através da página de recuperação de senha.
                      Um e-mail será enviado para o endereço cadastrado.
                    </AlertDescription>
                  </Alert>
                )}
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
              {criarUsuario && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('usuario')}
                >
                  Próximo
                </Button>
              )}
              {!criarUsuario && (
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Empresa
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="usuario" className="mt-6">
          <form onSubmit={empresaForm.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>Dados do Administrador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="usuario-nome">Nome Completo</Label>
                  <Input
                    id="usuario-nome"
                    {...usuarioForm.register('nome')}
                    placeholder="Nome do administrador"
                  />
                  {usuarioForm.formState.errors.nome && (
                    <p className="text-xs text-destructive">
                      {usuarioForm.formState.errors.nome.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usuario-email">E-mail</Label>
                    <Input
                      id="usuario-email"
                      type="email"
                      {...usuarioForm.register('email')}
                      placeholder="admin@empresa.com"
                    />
                    {usuarioForm.formState.errors.email && (
                      <p className="text-xs text-destructive">
                        {usuarioForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usuario-telefone">Telefone</Label>
                    <Input
                      id="usuario-telefone"
                      {...usuarioForm.register('telefone')}
                      onChange={(e) => usuarioForm.setValue('telefone', masks.phone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usuario-cargo">Cargo</Label>
                  <Input
                    id="usuario-cargo"
                    {...usuarioForm.register('cargo')}
                    placeholder="Diretor, Gerente..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usuario-senha">Senha</Label>
                    <div className="relative">
                      <Input
                        id="usuario-senha"
                        type={showPassword ? 'text' : 'password'}
                        {...usuarioForm.register('senha')}
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
                    {usuarioForm.formState.errors.senha && (
                      <p className="text-xs text-destructive">
                        {usuarioForm.formState.errors.senha.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usuario-confirmar-senha">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="usuario-confirmar-senha"
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...usuarioForm.register('confirmarSenha')}
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
                    {usuarioForm.formState.errors.confirmarSenha && (
                      <p className="text-xs text-destructive">
                        {usuarioForm.formState.errors.confirmarSenha.message}
                      </p>
                    )}
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    O usuário administrador terá acesso completo à empresa e poderá gerenciar todos os recursos.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab('empresa')}
              >
                Voltar
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
                    Criar Empresa
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}