'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Save, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'

import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'
import { masks } from '@/lib/masks'

const obraSchema = z.object({
  nome: z.string().min(1, 'Nome da obra é obrigatório'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  cnpj: z.string().min(14, 'CNPJ inválido').max(18),
  endereco: z.string().min(1, 'Endereço é obrigatório'),
  cidade: z.string().min(1, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres'),
  cep: z.string().min(8, 'CEP inválido').max(9),
  dataInicio: z.string().optional(),
  dataPrevisaoTermino: z.string().optional(),
  valor: z.number().min(0).optional(),
  observacoes: z.string().optional(),
})

type ObraFormData = z.infer<typeof obraSchema>

export default function NovaObraPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const [saving, setSaving] = useState(false)

  const form = useForm<ObraFormData>({
    resolver: zodResolver(obraSchema),
    defaultValues: {
      nome: '',
      codigo: '',
      cnpj: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
      dataInicio: '',
      dataPrevisaoTermino: '',
      valor: 0,
      observacoes: '',
    }
  })

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  ]

  const onSubmit = async (data: ObraFormData) => {
    try {
      setSaving(true)

      await api.post('/obras', {
        ...data,
        empresaId: user?.empresaId,
        status: 'ativa'
      })

      toast({
        title: 'Sucesso',
        description: 'Obra criada com sucesso'
      })

      router.push('/app-empresa/obras')
    } catch (error) {
      console.error('Erro ao criar obra:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a obra',
        variant: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

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
          <h1 className="text-3xl font-bold">Nova Obra</h1>
          <p className="text-muted-foreground">
            Cadastre uma nova obra
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Obra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Obra</Label>
                <Input
                  id="nome"
                  {...form.register('nome')}
                  placeholder="Ex: Edifício Comercial"
                />
                {form.formState.errors.nome && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.nome.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input
                  id="codigo"
                  {...form.register('codigo')}
                  placeholder="Ex: OB-001"
                />
                {form.formState.errors.codigo && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.codigo.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                {...form.register('cnpj')}
                onChange={(e) => form.setValue('cnpj', masks.cnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              {form.formState.errors.cnpj && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.cnpj.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                {...form.register('endereco')}
                placeholder="Rua, número, complemento"
              />
              {form.formState.errors.endereco && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.endereco.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  {...form.register('cidade')}
                  placeholder="Cidade"
                />
                {form.formState.errors.cidade && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.cidade.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">UF</Label>
                <Select
                  value={form.watch('estado')}
                  onValueChange={(value) => form.setValue('estado', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((uf) => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.estado && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.estado.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  {...form.register('cep')}
                  onChange={(e) => form.setValue('cep', masks.cep(e.target.value))}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {form.formState.errors.cep && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.cep.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  {...form.register('dataInicio')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPrevisaoTermino">Previsão de Término</Label>
                <Input
                  id="dataPrevisaoTermino"
                  type="date"
                  {...form.register('dataPrevisaoTermino')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor da Obra (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                {...form.register('valor', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...form.register('observacoes')}
                placeholder="Observações adicionais sobre a obra..."
                rows={4}
              />
            </div>
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
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Criar Obra
              </>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}