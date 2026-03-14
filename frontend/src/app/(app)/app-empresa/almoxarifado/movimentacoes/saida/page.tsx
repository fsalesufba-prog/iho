'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  Package,
  Search,
  AlertCircle,
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
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { useToast } from '@/components/ui/use-toast'

import { api } from '@/lib/api'

interface ItemEstoque {
  id: number
  nome: string
  codigo: string
  unidade: string
  estoqueAtual: number
  estoqueMinimo: number
  valorUnitario?: number
}

interface Equipamento {
  id: number
  tag: string
  nome: string
}

export default function SaidaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [items, setItems] = useState<ItemEstoque[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<ItemEstoque | null>(null)
  const [quantidade, setQuantidade] = useState(1)
  const [equipamentoId, setEquipamentoId] = useState('')
  const [observacao, setObservacao] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    carregarItems()
    carregarEquipamentos()
  }, [])

  const carregarItems = async () => {
    try {
      const response = await api.get('/almoxarifado', {
        params: { limit: 100 }
      })
      setItems(response.data.items)
    } catch (error) {
      toast({
        title: 'Erro ao carregar itens',
        description: 'Não foi possível carregar a lista de itens.',
        variant: 'destructive'
      })
    }
  }

  const carregarEquipamentos = async () => {
    try {
      const response = await api.get('/equipamentos', {
        params: { limit: 100 }
      })
      setEquipamentos(response.data.equipamentos)
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error)
    }
  }

  const itemsFiltrados = items.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!selectedItem) {
      toast({
        title: 'Item não selecionado',
        description: 'Selecione um item para dar saída.',
        variant: 'destructive'
      })
      return
    }

    if (quantidade <= 0) {
      toast({
        title: 'Quantidade inválida',
        description: 'A quantidade deve ser maior que zero.',
        variant: 'destructive'
      })
      return
    }

    if (quantidade > selectedItem.estoqueAtual) {
      toast({
        title: 'Quantidade insuficiente',
        description: `Estoque disponível: ${selectedItem.estoqueAtual} ${selectedItem.unidade}`,
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      
      await api.post(`/almoxarifado/${selectedItem.id}/movimentacoes`, {
        tipo: 'saida',
        quantidade,
        equipamentoId: equipamentoId ? parseInt(equipamentoId) : undefined,
        observacao,
        data
      })

      toast({
        title: 'Saída registrada',
        description: 'A saída foi registrada com sucesso.'
      })

      router.push('/app-empresa/almoxarifado/movimentacoes')
    } catch (error: any) {
      toast({
        title: 'Erro ao registrar',
        description: error.response?.data?.error || 'Não foi possível registrar a saída.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Registrar Saída" />
        
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
                  Registrar Saída do Estoque
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seleção de Item */}
                <div className="space-y-4">
                  <Label>Selecione o Item</Label>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                    {itemsFiltrados.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedItem?.id === item.id ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{item.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.codigo} • Estoque: {item.estoqueAtual} {item.unidade}
                            </p>
                          </div>
                          {item.valorUnitario && (
                            <p className="text-sm font-medium">
                              R$ {item.valorUnitario.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedItem && (
                  <>
                    {/* Alerta de estoque baixo */}
                    {selectedItem.estoqueAtual <= selectedItem.estoqueMinimo && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Este item está com estoque baixo ({selectedItem.estoqueAtual} {selectedItem.unidade})
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Dados da Saída */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="quantidade">Quantidade *</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          min="1"
                          max={selectedItem.estoqueAtual}
                          value={quantidade}
                          onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Disponível: {selectedItem.estoqueAtual} {selectedItem.unidade}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="equipamento">Equipamento (opcional)</Label>
                        <Select value={equipamentoId} onValueChange={setEquipamentoId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o equipamento" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipamentos.map(eq => (
                              <SelectItem key={eq.id} value={eq.id.toString()}>
                                {eq.tag} - {eq.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data">Data</Label>
                        <Input
                          id="data"
                          type="date"
                          value={data}
                          onChange={(e) => setData(e.target.value)}
                        />
                      </div>

                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="observacao">Observação</Label>
                        <Textarea
                          id="observacao"
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          placeholder="Motivo da saída, número da OS, etc..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>

                    {/* Resumo */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <h3 className="font-medium mb-2">Resumo</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Item:</span>
                          <span className="font-medium">{selectedItem.nome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Código:</span>
                          <span className="font-mono">{selectedItem.codigo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantidade:</span>
                          <span className="font-medium">{quantidade} {selectedItem.unidade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estoque após saída:</span>
                          <span className={`font-medium ${
                            selectedItem.estoqueAtual - quantidade <= selectedItem.estoqueMinimo
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                            {selectedItem.estoqueAtual - quantidade} {selectedItem.unidade}
                          </span>
                        </div>
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
                        onClick={handleSubmit}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                            Registrando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Registrar Saída
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </main>
    </>
  )
}