'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Building2, Loader2 } from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Separator } from '@/components/ui/Separator'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatCNPJ, formatPhone, formatCEP } from '@/lib/utils'

const empresaSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  numero: z.string().min(1, 'Número é obrigatório'),
  complemento: z.string().optional(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado inválido'),
  cep: z.string().min(8, 'CEP inválido')
})

type EmpresaFormData = z.infer<typeof empresaSchema>

export default function ConfiguracoesEmpresaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [logo, setLogo] = useState<string | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema)
  })

  useEffect(() => {
    carregarEmpresa()
  }, [])

  const carregarEmpresa = async () => {
    try {
      setLoading(true)
      const response = await api.get('/configuracoes/empresa')
      const empresa = response.data.data

      // Separar endereço completo em partes (assumindo formato "rua, numero - bairro")
      const enderecoParts = empresa.endereco.split(',')
      const rua = enderecoParts[0] || ''
      const resto = enderecoParts[1]?.split('-') || []
      const numero = resto[0]?.trim() || ''
      const bairro = resto[1]?.trim() || ''

      reset({
        nome: empresa.nome,
        cnpj: empresa.cnpj,
        email: empresa.email,
        telefone: empresa.telefone,
        endereco: rua,
        numero,
        complemento: empresa.complemento || '',
        bairro,
        cidade: empresa.cidade,
        estado: empresa.estado,
        cep: empresa.cep
      })

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

  const onSubmit = async (data: EmpresaFormData) => {
    try {
      setSaving(true)

      // Montar endereço completo
      const enderecoCompleto = `${data.endereco}, ${data.numero} - ${data.bairro}${data.complemento ? `, ${data.complemento}` : ''}`

      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'endereco' && key !== 'numero' && key !== 'complemento' && key !== 'bairro') {
          formData.append(key, value)
        }
      })
      formData.append('endereco', enderecoCompleto)
      
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Logo */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden">
                        {logo ? (
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
                        {...register('nome')}
                        error={!!errors.nome}
                      />
                      {errors.nome && (
                        <p className="text-sm text-destructive">{errors.nome.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cnpj">CNPJ *</Label>
                      <Input
                        id="cnpj"
                        {...register('cnpj')}
                        onChange={(e) => {
                          const formatted = formatCNPJ(e.target.value)
                          setValue('cnpj', formatted)
                        }}
                        error={!!errors.cnpj}
                      />
                      {errors.cnpj && (
                        <p className="text-sm text-destructive">{errors.cnpj.message}</p>
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
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        {...register('telefone')}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value)
                          setValue('telefone', formatted)
                        }}
                        error={!!errors.telefone}
                      />
                      {errors.telefone && (
                        <p className="text-sm text-destructive">{errors.telefone.message}</p>
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
                        {...register('endereco')}
                        error={!!errors.endereco}
                      />
                      {errors.endereco && (
                        <p className="text-sm text-destructive">{errors.endereco.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numero">Número *</Label>
                      <Input
                        id="numero"
                        {...register('numero')}
                        error={!!errors.numero}
                      />
                      {errors.numero && (
                        <p className="text-sm text-destructive">{errors.numero.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="complemento">Complemento</Label>
                      <Input
                        id="complemento"
                        {...register('complemento')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro *</Label>
                      <Input
                        id="bairro"
                        {...register('bairro')}
                        error={!!errors.bairro}
                      />
                      {errors.bairro && (
                        <p className="text-sm text-destructive">{errors.bairro.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade *</Label>
                      <Input
                        id="cidade"
                        {...register('cidade')}
                        error={!!errors.cidade}
                      />
                      {errors.cidade && (
                        <p className="text-sm text-destructive">{errors.cidade.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estado">UF *</Label>
                      <Input
                        id="estado"
                        {...register('estado')}
                        maxLength={2}
                        className="uppercase"
                        error={!!errors.estado}
                      />
                      {errors.estado && (
                        <p className="text-sm text-destructive">{errors.estado.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <Input
                        id="cep"
                        {...register('cep')}
                        onChange={(e) => {
                          const formatted = formatCEP(e.target.value)
                          setValue('cep', formatted)
                        }}
                        error={!!errors.cep}
                      />
                      {errors.cep && (
                        <p className="text-sm text-destructive">{errors.cep.message}</p>
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
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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