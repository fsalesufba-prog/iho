'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
import { api } from '@/lib/api'

type Unidade = 'un' | 'kg' | 'l' | 'm' | 'cx' | 'pc'

export default function EditarItemPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Estados do formulário
  const [nome, setNome] = useState('')
  const [codigo, setCodigo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('')
  const [unidade, setUnidade] = useState<Unidade>('un')
  const [estoqueMinimo, setEstoqueMinimo] = useState(0)
  const [estoqueMaximo, setEstoqueMaximo] = useState(0)
  const [valorUnitario, setValorUnitario] = useState<number | null>(null)
  const [localizacao, setLocalizacao] = useState('')

  // Estados de erro
  const [errors, setErrors] = useState({
    nome: '',
    codigo: '',
    categoria: '',
    estoqueMinimo: '',
    estoqueMaximo: '',
  })

  useEffect(() => {
    carregarItem()
  }, [params.id])

  const carregarItem = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/almoxarifado/${params.id}`)
      const item = response.data.data

      setNome(item.nome || '')
      setCodigo(item.codigo || '')
      setDescricao(item.descricao || '')
      setCategoria(item.categoria || '')
      setUnidade(item.unidade || 'un')
      setEstoqueMinimo(item.estoqueMinimo || 0)
      setEstoqueMaximo(item.estoqueMaximo || 0)
      setValorUnitario(item.valorUnitario || null)
      setLocalizacao(item.localizacao || '')
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

  const validate = () => {
    const newErrors = {
      nome: '',
      codigo: '',
      categoria: '',
      estoqueMinimo: '',
      estoqueMaximo: '',
    }
    let isValid = true

    if (!nome) {
      newErrors.nome = 'Nome é obrigatório'
      isValid = false
    }

    if (!codigo) {
      newErrors.codigo = 'Código é obrigatório'
      isValid = false
    }

    if (!categoria) {
      newErrors.categoria = 'Categoria é obrigatória'
      isValid = false
    }

    if (estoqueMinimo < 0) {
      newErrors.estoqueMinimo = 'Estoque mínimo deve ser maior ou igual a 0'
      isValid = false
    }

    if (estoqueMaximo < 0) {
      newErrors.estoqueMaximo = 'Estoque máximo deve ser maior ou igual a 0'
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

      const payload = {
        nome,
        codigo,
        descricao,
        categoria,
        unidade,
        estoqueMinimo,
        estoqueMaximo,
        valorUnitario,
        localizacao,
      }

      await api.put(`/almoxarifado/${params.id}`, payload)
      
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
                <form onSubmit={onSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Identificação */}
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
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
                      <Label htmlFor="codigo">Código *</Label>
                      <Input
                        id="codigo"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        className={errors.codigo ? 'border-destructive' : ''}
                      />
                      {errors.codigo && (
                        <p className="text-sm text-destructive">{errors.codigo}</p>
                      )}
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>

                    {/* Categoria e Unidade */}
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Input
                        id="categoria"
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className={errors.categoria ? 'border-destructive' : ''}
                      />
                      {errors.categoria && (
                        <p className="text-sm text-destructive">{errors.categoria}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unidade">Unidade *</Label>
                      <Select value={unidade} onValueChange={(value: Unidade) => setUnidade(value)}>
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
                        value={estoqueMinimo}
                        onChange={(e) => setEstoqueMinimo(parseInt(e.target.value) || 0)}
                        className={errors.estoqueMinimo ? 'border-destructive' : ''}
                      />
                      {errors.estoqueMinimo && (
                        <p className="text-sm text-destructive">{errors.estoqueMinimo}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estoqueMaximo">Estoque Máximo *</Label>
                      <Input
                        id="estoqueMaximo"
                        type="number"
                        min="0"
                        value={estoqueMaximo}
                        onChange={(e) => setEstoqueMaximo(parseInt(e.target.value) || 0)}
                        className={errors.estoqueMaximo ? 'border-destructive' : ''}
                      />
                      {errors.estoqueMaximo && (
                        <p className="text-sm text-destructive">{errors.estoqueMaximo}</p>
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
                        value={valorUnitario || ''}
                        onChange={(e) => setValorUnitario(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="localizacao">Localização</Label>
                      <Input
                        id="localizacao"
                        value={localizacao}
                        onChange={(e) => setLocalizacao(e.target.value)}
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