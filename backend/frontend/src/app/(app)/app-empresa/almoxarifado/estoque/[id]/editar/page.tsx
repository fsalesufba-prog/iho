'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Package } from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

const itemSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  descricao: z.string().optional(),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  unidade: z.enum(['un', 'kg', 'l', 'm', 'cx', 'pc']),
  estoqueMinimo: z.number().int().min(0),
  estoqueMaximo: z.number().int().min(0),
  valorUnitario: z.number().optional().nullable(),
  localizacao: z.string().optional()
})

type ItemFormData = z.infer<typeof itemSchema>

export default function EditarItemPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema)
  })

  const unidade = watch('unidade')

  useEffect(() => {
    carregarItem()
  }, [params.id])

  const carregarItem = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/almoxarifado/${params.id}`)
      const item = response.data.data

      reset({
        nome: item.nome,
        codigo: item.codigo,
        descricao: item.descricao || '',
        categoria: item.categoria,
        unidade: item.unidade,
        estoqueMinimo: item.estoqueMinimo,
        estoqueMaximo: item.estoqueMaximo,
        valorUnitario: item.valorUnitario,
        localizacao: item.localizacao || ''
      })
    } catch (error) {
      toast({
        title: 'Erro ao carregar item',
        description: 'Não foi possível carregar os dados do item.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: ItemFormData) => {
    try {
      setSaving(true)
      await api.put(`/almoxarifado/${params.id}`, data)
      
      toast({
        title: 'Item atualizado',
        description: 'Os dados do item foram atualizados com sucesso.'
      })

      router.push(`/app-empresa/almoxarifado/estoque/${params.id}`)
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.response?.data?.error || 'Não foi possível atualizar o item.',
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
        <Header title="Editar Item" />
        
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
                  <Package className="h-5 w-5 text-primary" />
                  Editar Item
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Identificação */}
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
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
                      <Label htmlFor="codigo">Código *</Label>
                      <Input
                        id="codigo"
                        {...register('codigo')}
                        error={!!errors.codigo}
                      />
                      {errors.codigo && (
                        <p className="text-sm text-destructive">{errors.codigo.message}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        {...register('descricao')}
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* Categoria e Unidade */}
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Input
                        id="categoria"
                        {...register('categoria')}
                        error={!!errors.categoria}
                      />
                      {errors.categoria && (
                        <p className="text-sm text-destructive">{errors.categoria.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unidade">Unidade *</Label>
                      <Select
                        value={unidade}
                        onValueChange={(value: any) => setValue('unidade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="un">Unidade</SelectItem>
                          <SelectItem value="kg">Quilograma</SelectItem>
                          <SelectItem value="l">Litro</SelectItem>
                          <SelectItem value="m">Metro</SelectItem>
                          <SelectItem value="cx">Caixa</SelectItem>
                          <SelectItem value="pc">Peça</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Estoque */}
                    <div className="space-y-2">
                      <Label htmlFor="estoqueMinimo">Estoque Mínimo *</Label>
                      <Input
                        id="estoqueMinimo"
                        type="number"
                        min="0"
                        {...register('estoqueMinimo', { valueAsNumber: true })}
                        error={!!errors.estoqueMinimo}
                      />
                      {errors.estoqueMinimo && (
                        <p className="text-sm text-destructive">{errors.estoqueMinimo.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estoqueMaximo">Estoque Máximo *</Label>
                      <Input
                        id="estoqueMaximo"
                        type="number"
                        min="0"
                        {...register('estoqueMaximo', { valueAsNumber: true })}
                        error={!!errors.estoqueMaximo}
                      />
                      {errors.estoqueMaximo && (
                        <p className="text-sm text-destructive">{errors.estoqueMaximo.message}</p>
                      )}
                    </div>

                    {/* Valor e Localização */}
                    <div className="space-y-2">
                      <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                      <Input
                        id="valorUnitario"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register('valorUnitario', { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="localizacao">Localização</Label>
                      <Input
                        id="localizacao"
                        {...register('localizacao')}
                        placeholder="Ex: Prateleira A1"
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