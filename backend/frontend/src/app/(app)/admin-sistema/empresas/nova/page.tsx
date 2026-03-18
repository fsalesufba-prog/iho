'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
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

export default function NovaEmpresaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [planos, setPlanos] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('empresa')
  const [criarUsuario, setCriarUsuario] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Estados da empresa
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [cep, setCep] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [planoId, setPlanoId] = useState('')
  const [status, setStatus] = useState('ativo')

  // Estados do usuário
  const [usuarioNome, setUsuarioNome] = useState('')
  const [usuarioEmail, setUsuarioEmail] = useState('')
  const [usuarioTelefone, setUsuarioTelefone] = useState('')
  const [usuarioCargo, setUsuarioCargo] = useState('')
  const [usuarioSenha, setUsuarioSenha] = useState('')
  const [usuarioConfirmarSenha, setUsuarioConfirmarSenha] = useState('')

  // Estados de erro
  const [empresaErrors, setEmpresaErrors] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    numero: '',
    bairro: '',
    planoId: '',
  })

  const [usuarioErrors, setUsuarioErrors] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
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

  const validateEmpresa = () => {
    const newErrors = {
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      numero: '',
      bairro: '',
      planoId: '',
    }
    let isValid = true

    if (!nome) {
      newErrors.nome = 'Nome da empresa é obrigatório'
      isValid = false
    }
    if (!cnpj || cnpj.replace(/\D/g, '').length < 14) {
      newErrors.cnpj = 'CNPJ inválido'
      isValid = false
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-mail inválido'
      isValid = false
    }
    if (!telefone || telefone.replace(/\D/g, '').length < 10) {
      newErrors.telefone = 'Telefone inválido'
      isValid = false
    }
    if (!endereco) {
      newErrors.endereco = 'Endereço é obrigatório'
      isValid = false
    }
    if (!cidade) {
      newErrors.cidade = 'Cidade é obrigatória'
      isValid = false
    }
    if (!estado || estado.length !== 2) {
      newErrors.estado = 'Estado deve ter 2 caracteres'
      isValid = false
    }
    if (!cep || cep.replace(/\D/g, '').length < 8) {
      newErrors.cep = 'CEP inválido'
      isValid = false
    }
    if (!numero) {
      newErrors.numero = 'Número é obrigatório'
      isValid = false
    }
    if (!bairro) {
      newErrors.bairro = 'Bairro é obrigatório'
      isValid = false
    }
    if (!planoId) {
      newErrors.planoId = 'Plano é obrigatório'
      isValid = false
    }

    setEmpresaErrors(newErrors)
    return isValid
  }

  const validateUsuario = () => {
    const newErrors = {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
    }
    let isValid = true

    if (!usuarioNome) {
      newErrors.nome = 'Nome é obrigatório'
      isValid = false
    }
    if (!usuarioEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuarioEmail)) {
      newErrors.email = 'E-mail inválido'
      isValid = false
    }
    if (!usuarioSenha || usuarioSenha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres'
      isValid = false
    }
    if (usuarioSenha !== usuarioConfirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não conferem'
      isValid = false
    }

    setUsuarioErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === 'empresa' && criarUsuario) {
      setActiveTab('usuario')
      return
    }

    if (!validateEmpresa()) {
      setActiveTab('empresa')
      return
    }

    if (criarUsuario && !validateUsuario()) {
      setActiveTab('usuario')
      return
    }

    try {
      setLoading(true)

      const payload = {
        empresa: {
          nome,
          cnpj: cnpj.replace(/\D/g, ''),
          email,
          telefone: telefone.replace(/\D/g, ''),
          endereco,
          cidade,
          estado,
          cep: cep.replace(/\D/g, ''),
          numero,
          complemento,
          bairro,
          planoId: parseInt(planoId),
          status,
          enderecoCompleto: `${endereco}, ${numero}${complemento ? ` - ${complemento}` : ''} - ${bairro}`,
        },
        usuario: criarUsuario ? {
          nome: usuarioNome,
          email: usuarioEmail,
          telefone: usuarioTelefone.replace(/\D/g, ''),
          cargo: usuarioCargo,
          senha: usuarioSenha,
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

        <form onSubmit={handleSubmit}>
          <TabsContent value="empresa" className="mt-6">
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
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Razão Social"
                    />
                    {empresaErrors.nome && (
                      <p className="text-xs text-destructive">{empresaErrors.nome}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      value={cnpj}
                      onChange={(e) => setCnpj(masks.cnpj(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                    />
                    {empresaErrors.cnpj && (
                      <p className="text-xs text-destructive">{empresaErrors.cnpj}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="contato@empresa.com"
                    />
                    {empresaErrors.email && (
                      <p className="text-xs text-destructive">{empresaErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={telefone}
                      onChange={(e) => setTelefone(masks.phone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                    {empresaErrors.telefone && (
                      <p className="text-xs text-destructive">{empresaErrors.telefone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, Avenida..."
                  />
                  {empresaErrors.endereco && (
                    <p className="text-xs text-destructive">{empresaErrors.endereco}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input
                      id="numero"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="123"
                    />
                    {empresaErrors.numero && (
                      <p className="text-xs text-destructive">{empresaErrors.numero}</p>
                    )}
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={complemento}
                      onChange={(e) => setComplemento(e.target.value)}
                      placeholder="Sala, Andar..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input
                      id="bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Centro"
                    />
                    {empresaErrors.bairro && (
                      <p className="text-xs text-destructive">{empresaErrors.bairro}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input
                      id="cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="São Paulo"
                    />
                    {empresaErrors.cidade && (
                      <p className="text-xs text-destructive">{empresaErrors.cidade}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((uf) => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {empresaErrors.estado && (
                      <p className="text-xs text-destructive">{empresaErrors.estado}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input
                      id="cep"
                      value={cep}
                      onChange={(e) => setCep(masks.cep(e.target.value))}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {empresaErrors.cep && (
                      <p className="text-xs text-destructive">{empresaErrors.cep}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plano">Plano</Label>
                  <Select value={planoId} onValueChange={setPlanoId}>
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
                  {empresaErrors.planoId && (
                    <p className="text-xs text-destructive">{empresaErrors.planoId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
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
                  type="submit"
                  variant="default"
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
          </TabsContent>

          <TabsContent value="usuario" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Administrador</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="usuario-nome">Nome Completo</Label>
                  <Input
                    id="usuario-nome"
                    value={usuarioNome}
                    onChange={(e) => setUsuarioNome(e.target.value)}
                    placeholder="Nome do administrador"
                  />
                  {usuarioErrors.nome && (
                    <p className="text-xs text-destructive">{usuarioErrors.nome}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usuario-email">E-mail</Label>
                    <Input
                      id="usuario-email"
                      type="email"
                      value={usuarioEmail}
                      onChange={(e) => setUsuarioEmail(e.target.value)}
                      placeholder="admin@empresa.com"
                    />
                    {usuarioErrors.email && (
                      <p className="text-xs text-destructive">{usuarioErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usuario-telefone">Telefone</Label>
                    <Input
                      id="usuario-telefone"
                      value={usuarioTelefone}
                      onChange={(e) => setUsuarioTelefone(masks.phone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usuario-cargo">Cargo</Label>
                  <Input
                    id="usuario-cargo"
                    value={usuarioCargo}
                    onChange={(e) => setUsuarioCargo(e.target.value)}
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
                        value={usuarioSenha}
                        onChange={(e) => setUsuarioSenha(e.target.value)}
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
                    {usuarioErrors.senha && (
                      <p className="text-xs text-destructive">{usuarioErrors.senha}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usuario-confirmar-senha">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="usuario-confirmar-senha"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={usuarioConfirmarSenha}
                        onChange={(e) => setUsuarioConfirmarSenha(e.target.value)}
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
                    {usuarioErrors.confirmarSenha && (
                      <p className="text-xs text-destructive">{usuarioErrors.confirmarSenha}</p>
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
          </TabsContent>
        </form>
      </Tabs>
    </motion.div>
  )
}