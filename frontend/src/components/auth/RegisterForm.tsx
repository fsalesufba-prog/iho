'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  MapPin,
  Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/Form'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Masks } from '@/lib/masks'

const formSchema = z.object({
  // Dados da Empresa
  empresaNome: z.string().min(1, 'Nome da empresa é obrigatório'),
  empresaCnpj: z.string().min(14, 'CNPJ inválido').max(18),
  empresaEmail: z.string().email('E-mail inválido'),
  empresaTelefone: z.string().min(10, 'Telefone inválido'),
  empresaEndereco: z.string().min(1, 'Endereço é obrigatório'),
  empresaCidade: z.string().min(1, 'Cidade é obrigatória'),
  empresaEstado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  empresaCep: z.string().min(8, 'CEP inválido').max(9),

  // Dados do Usuário Admin
  usuarioNome: z.string().min(1, 'Nome do administrador é obrigatório'),
  usuarioEmail: z.string().email('E-mail inválido'),
  usuarioSenha: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número'),
  usuarioConfirmarSenha: z.string(),
  usuarioTelefone: z.string().min(10, 'Telefone inválido'),

  // Plano
  planoId: z.number().min(1, 'Selecione um plano'),
  
  termos: z.boolean().refine(val => val === true, {
    message: 'Você deve aceitar os termos de uso',
  }),
}).refine((data) => data.usuarioSenha === data.usuarioConfirmarSenha, {
  message: "As senhas não conferem",
  path: ["usuarioConfirmarSenha"],
})

type FormData = z.infer<typeof formSchema>

interface RegisterFormProps {
  planos: Array<{
    id: number
    nome: string
    descricao: string
    valorImplantacao: number
    valorMensal: number
    recursos: string[]
  }>
  onSuccess?: () => void
}

export function RegisterForm({ planos, onSuccess }: RegisterFormProps) {
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlano, setSelectedPlano] = useState<number | null>(null)

  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresaNome: '',
      empresaCnpj: '',
      empresaEmail: '',
      empresaTelefone: '',
      empresaEndereco: '',
      empresaCidade: '',
      empresaEstado: '',
      empresaCep: '',
      usuarioNome: '',
      usuarioEmail: '',
      usuarioSenha: '',
      usuarioConfirmarSenha: '',
      usuarioTelefone: '',
      planoId: 0,
      termos: false,
    },
  })

  const nextStep = async () => {
    const fieldsToValidate = step === 1 
      ? ['empresaNome', 'empresaCnpj', 'empresaEmail', 'empresaTelefone', 'empresaEndereco', 'empresaCidade', 'empresaEstado', 'empresaCep']
      : ['usuarioNome', 'usuarioEmail', 'usuarioSenha', 'usuarioConfirmarSenha', 'usuarioTelefone', 'planoId', 'termos']

    const isValid = await form.trigger(fieldsToValidate as any)
    
    if (isValid) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setStep(step - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true)
      setError(null)

      await api.post('/auth/register', data)

      toast({
        title: 'Cadastro realizado com sucesso!',
        description: 'Você receberá um e-mail com as instruções para pagamento.',
      })

      router.push('/login?registered=true')
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao realizar cadastro')
      toast({
        title: 'Erro no cadastro',
        description: err.response?.data?.message || 'Tente novamente mais tarde',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {step === 1 && 'Dados da Empresa'}
          {step === 2 && 'Dados do Administrador'}
          {step === 3 && 'Escolha do Plano'}
        </CardTitle>
        <CardDescription>
          {step === 1 && 'Informe os dados da sua empresa para começar'}
          {step === 2 && 'Cadastre o administrador principal do sistema'}
          {step === 3 && 'Selecione o plano mais adequado para sua operação'}
        </CardDescription>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                s === step ? "bg-primary text-primary-foreground" :
                s < step ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
              )}>
                {s < step ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-12 h-1 mx-2",
                  s < step ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Dados da Empresa */}
            {step === 1 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="empresaNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Razão Social"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="empresaCnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00.000.000/0000-00"
                            {...field}
                            onChange={(e) => field.onChange(Masks.cnpj(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="empresaEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="empresa@email.com"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="empresaTelefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="(00) 00000-0000"
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(Masks.phone(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="empresaCep"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00000-000"
                            {...field}
                            onChange={(e) => field.onChange(Masks.cep(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="empresaEndereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Rua, número, complemento"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="empresaCidade"
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
                    control={form.control}
                    name="empresaEstado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
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
                </div>
              </div>
            )}

            {/* Step 2: Dados do Administrador */}
            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="usuarioNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Seu nome completo"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="usuarioEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="seu@email.com"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="usuarioTelefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="(00) 00000-0000"
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(Masks.phone(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="usuarioSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Mínimo 6 caracteres, com letra maiúscula e número
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="usuarioConfirmarSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Step 3: Escolha do Plano */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planos.map((plano) => (
                    <div
                      key={plano.id}
                      className={cn(
                        "border rounded-lg p-6 cursor-pointer transition-all",
                        selectedPlano === plano.id
                          ? "border-primary ring-2 ring-primary"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => {
                        setSelectedPlano(plano.id)
                        form.setValue('planoId', plano.id)
                      }}
                    >
                      <h3 className="text-lg font-semibold">{plano.nome}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{plano.descricao}</p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Implantação:</span>
                          <span className="font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valorImplantacao)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mensalidade:</span>
                          <span className="font-bold">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(plano.valorMensal)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Recursos inclusos:</p>
                        <ul className="text-sm space-y-1">
                          {plano.recursos.map((recurso, index) => (
                            <li key={index} className="flex items-center">
                              <span className="text-green-500 mr-2">✓</span>
                              {recurso}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="termos"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Eu li e aceito os{' '}
                          <Link href="/termos" className="text-primary hover:underline">
                            Termos de Uso
                          </Link>{' '}
                          e{' '}
                          <Link href="/privacidade" className="text-primary hover:underline">
                            Política de Privacidade
                          </Link>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                >
                  Voltar
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="ml-auto"
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    'Finalizar Cadastro'
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}