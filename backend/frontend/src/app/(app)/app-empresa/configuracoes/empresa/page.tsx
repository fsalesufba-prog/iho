'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Building2 } from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { formatCNPJ, formatPhone, formatCEP } from '@/lib/utils'

export default function ConfiguracoesEmpresaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  // Estados do formulário
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [cep, setCep] = useState('')

  // Estados de erro
  const [errors, setErrors] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  })

  useEffect(() => {
    carregarEmpresa()
  }, [])

  const carregarEmpresa = async () => {
    try {
      setLoading(true)
      const response = await api.get('/configuracoes/empresa')
      const empresa = response.data.data

      // Separar endereço completo em partes
      const enderecoParts = empresa.endereco?.split(',') || []
      const rua = enderecoParts[0] || ''
      const resto = enderecoParts[1]?.split('-') || []
      const numeroPart = resto[0]?.trim() || ''
      const bairroPart = resto[1]?.trim() || ''

      setNome(empresa.nome || '')
      setCnpj(empresa.cnpj || '')
      setEmail(empresa.email || '')
      setTelefone(empresa.telefone || '')
      setEndereco(rua)
      setNumero(numeroPart)
      setComplemento(empresa.complemento || '')
      setBairro(bairroPart)
      setCidade(empresa.cidade || '')
      setEstado(empresa.estado || '')
      setCep(empresa.cep || '')

      if (empresa.logo) {
        setLogo(empresa.logo)
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar empresa',
        description: 'Não foi possível carregar os dados da empresa.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const validate = () => {
    const newErrors = {
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
      cep: '',
    }
    let isValid = true

    if (!nome) {
      newErrors.nome = 'Nome é obrigatório'
      isValid = false
    }

    if (!cnpj || cnpj.replace(/\D/g, '').length < 14) {
      newErrors.cnpj = 'CNPJ inválido'
      isValid = false
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
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

    if (!numero) {
      newErrors.numero = 'Número é obrigatório'
      isValid = false
    }

    if (!bairro) {
      newErrors.bairro = 'Bairro é obrigatório'
      isValid = false
    }

    if (!cidade) {
      newErrors.cidade = 'Cidade é obrigatória'
      isValid = false
    }

    if (!estado || estado.length !== 2) {
      newErrors.estado = 'Estado inválido'
      isValid = false
    }

    if (!cep || cep.replace(/\D/g, '').length < 8) {
      newErrors.cep = 'CEP inválido'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      setSaving(true)

      // Montar endereço completo
      const enderecoCompleto = `${endereco}, ${numero} - ${bairro}${complemento ? `, ${complemento}` : ''}`

      const formData = new FormData()
      formData.append('nome', nome)
      formData.append('cnpj', cnpj.replace(/\D/g, ''))
      formData.append('email', email)
      formData.append('telefone', telefone.replace(/\D/g, ''))
      formData.append('endereco', enderecoCompleto)
      formData.append('cidade', cidade)
      formData.append('estado', estado)
      formData.append('cep', cep.replace(/\D/g, ''))
      
      if (logoFile) {
        formData.append('logo', logoFile)
      }

      await api.put('/configuracoes/empresa', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast({
        title: 'Empresa atualizada',
        description: 'Os dados da empresa foram atualizados com sucesso.'
      })

      router.push('/app-empresa/configuracoes')
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.response?.data?.error || 'Não foi possível atualizar a empresa.',
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
          <Header title="Configurações da Empresa" />
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
        <Header title="Configurações da Empresa" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
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
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Dados da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Logo */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden">
                        {logo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logo} alt="Logo" className="h-full w-full object-cover" />
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <div>
                      <p className="font-medium">Logo da Empresa</p>
                      <p className="text-sm text-muted-foreground">
                        Clique na imagem para alterar. Formatos aceitos: PNG, JPG (máx. 2MB)
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Dados principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Razão Social *</Label>
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
                      <Label htmlFor="cnpj">CNPJ *</Label>
                      <Input
                        id="cnpj"
                        value={cnpj}
                        onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                        className={errors.cnpj ? 'border-destructive' : ''}
                      />
                      {errors.cnpj && (
                        <p className="text-sm text-destructive">{errors.cnpj}</p>
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
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={telefone}
                        onChange={(e) => setTelefone(formatPhone(e.target.value))}
                        className={errors.telefone ? 'border-destructive' : ''}
                      />
                      {errors.telefone && (
                        <p className="text-sm text-destructive">{errors.telefone}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Endereço */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <Label htmlFor="endereco">Logradouro *</Label>
                      <Input
                        id="endereco"
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        className={errors.endereco ? 'border-destructive' : ''}
                      />
                      {errors.endereco && (
                        <p className="text-sm text-destructive">{errors.endereco}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numero">Número *</Label>
                      <Input
                        id="numero"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        className={errors.numero ? 'border-destructive' : ''}
                      />
                      {errors.numero && (
                        <p className="text-sm text-destructive">{errors.numero}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        value={complemento}
                        onChange={(e) => setComplemento(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro *</Label>
                      <Input
                        id="bairro"
                        value={bairro}
                        onChange={(e) => setBairro(e.target.value)}
                        className={errors.bairro ? 'border-destructive' : ''}
                      />
                      {errors.bairro && (
                        <p className="text-sm text-destructive">{errors.bairro}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade *</Label>
                      <Input
                        id="cidade"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        className={errors.cidade ? 'border-destructive' : ''}
                      />
                      {errors.cidade && (
                        <p className="text-sm text-destructive">{errors.cidade}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado">UF *</Label>
                      <Input
                        id="estado"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value.toUpperCase())}
                        maxLength={2}
                        className={`uppercase ${errors.estado ? 'border-destructive' : ''}`}
                      />
                      {errors.estado && (
                        <p className="text-sm text-destructive">{errors.estado}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <Input
                        id="cep"
                        value={cep}
                        onChange={(e) => setCep(formatCEP(e.target.value))}
                        className={errors.cep ? 'border-destructive' : ''}
                      />
                      {errors.cep && (
                        <p className="text-sm text-destructive">{errors.cep}</p>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex justify-end gap-2 pt-4">
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