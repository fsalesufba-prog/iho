'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  FileText,
  Plus,
  X,
  Calendar,
  Globe,
  Lock,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Switch } from '@/components/ui/Switch'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

const relatorioSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().optional(),
  tipo: z.enum(['operacional', 'financeiro', 'manutencao', 'equipamentos', 'obras']),
  isPublico: z.boolean().default(false),
  agendado: z.boolean().default(false),
  frequencia: z.enum(['diario', 'semanal', 'mensal']).optional(),
  destinatarios: z.array(z.string().email()).optional()
})

type RelatorioFormData = z.infer<typeof relatorioSchema>

export default function EditarRelatorioPersonalizadoPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [destinatarios, setDestinatarios] = useState<string[]>([])
  const [novoEmail, setNovoEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<RelatorioFormData>({
    resolver: zodResolver(relatorioSchema)
  })

  const agendado = watch('agendado')

  useEffect(() => {
    carregarRelatorio()
  }, [params.id])

  const carregarRelatorio = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/relatorios/personalizados/${params.id}`)
      const relatorio = response.data.data

      reset({
        nome: relatorio.nome,
        descricao: relatorio.descricao || '',
        tipo: relatorio.tipo,
        isPublico: relatorio.isPublico,
        agendado: relatorio.agendado,
        frequencia: relatorio.frequencia
      })

      if (relatorio.destinatarios) {
        setDestinatarios(relatorio.destinatarios)
      }
    } catch (error) {
      toast({
        title: 'Erro ao carregar relatório',
        description: 'Não foi possível carregar os dados do relatório.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const adicionarDestinatario = () => {
    if (!novoEmail) return

    if (!novoEmail.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Digite um endereço de email válido.',
        variant: 'destructive'
      })
      return
    }

    if (destinatarios.includes(novoEmail)) {
      toast({
        title: 'Email duplicado',
        description: 'Este email já foi adicionado.',
        variant: 'destructive'
      })
      return
    }

    setDestinatarios([...destinatarios, novoEmail])
    setNovoEmail('')
  }

  const removerDestinatario = (email: string) => {
    setDestinatarios(destinatarios.filter(e => e !== email))
  }

  const onSubmit = async (data: RelatorioFormData) => {
    try {
      setSaving(true)
      
      const payload = {
        ...data,
        destinatarios: data.agendado ? destinatarios : undefined
      }

      await api.put(`/relatorios/personalizados/${params.id}`, payload)
      
      toast({
        title: 'Relatório atualizado',
        description: 'O relatório foi atualizado com sucesso.'
      })

      router.push(`/app-empresa/relatorios/personalizados/${params.id}`)
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.response?.data?.error || 'Não foi possível atualizar o relatório.',
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
        <Header title="Editar Relatório Personalizado" />
        
        <Container size="xl" className="py-8">
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
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Editar Relatório Personalizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Informações Básicas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Relatório *</Label>
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
                      <Label htmlFor="tipo">Tipo de Relatório *</Label>
                      <Select
                        value={watch('tipo')}
                        onValueChange={(value: any) => setValue('tipo', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operacional">Operacional</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="obras">Obras</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        {...register('descricao')}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>

                  {/* Configurações de Visibilidade */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Visibilidade</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {watch('isPublico') ? (
                          <Globe className="h-5 w-5 text-green-600" />
                        ) : (
                          <Lock className="h-5 w-5 text-yellow-600" />
                        )}
                        <div>
                          <Label htmlFor="isPublico" className="font-medium">
                            {watch('isPublico') ? 'Relatório Público' : 'Relatório Privado'}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {watch('isPublico')
                              ? 'Qualquer usuário pode visualizar e executar este relatório'
                              : 'Apenas você pode visualizar e executar este relatório'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="isPublico"
                        checked={watch('isPublico')}
                        onCheckedChange={(checked) => setValue('isPublico', checked)}
                      />
                    </div>
                  </div>

                  {/* Agendamento */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Agendamento</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <Label htmlFor="agendado" className="font-medium">
                            {agendado ? 'Relatório Agendado' : 'Relatório Não Agendado'}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {agendado
                              ? 'O relatório será gerado automaticamente'
                              : 'O relatório será gerado manualmente'}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="agendado"
                        checked={agendado}
                        onCheckedChange={(checked) => setValue('agendado', checked)}
                      />
                    </div>

                    {agendado && (
                      <div className="space-y-4 pl-8">
                        <div className="space-y-2">
                          <Label htmlFor="frequencia">Frequência *</Label>
                          <Select
                            value={watch('frequencia')}
                            onValueChange={(value: any) => setValue('frequencia', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a frequência" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="diario">Diário</SelectItem>
                              <SelectItem value="semanal">Semanal</SelectItem>
                              <SelectItem value="mensal">Mensal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Destinatários (emails para receber o relatório)</Label>
                          
                          <div className="flex gap-2">
                            <Input
                              placeholder="email@exemplo.com"
                              value={novoEmail}
                              onChange={(e) => setNovoEmail(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={adicionarDestinatario}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          {destinatarios.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {destinatarios.map((email) => (
                                <Badge
                                  key={email}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  {email}
                                  <button
                                    type="button"
                                    onClick={() => removerDestinatario(email)}
                                    className="ml-1 hover:text-destructive"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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