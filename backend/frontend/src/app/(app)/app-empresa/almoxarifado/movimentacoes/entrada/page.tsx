'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Package, Search } from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'

import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

interface ItemEstoque {
  id: number
  nome: string
  codigo: string
  unidade: string
  valorUnitario?: number
}

export default function EntradaPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [items, setItems] = useState<ItemEstoque[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedItem, setSelectedItem] = useState<ItemEstoque | null>(null)
  const [quantidade, setQuantidade] = useState(1)
  const [valorUnitario, setValorUnitario] = useState('')
  const [observacao, setObservacao] = useState('')
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    carregarItems()
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

  const itemsFiltrados = items.filter(item =>
    item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async () => {
    if (!selectedItem) {
      toast({
        title: 'Item não selecionado',
        description: 'Selecione um item para dar entrada.',
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

    try {
      setSaving(true)
      
      await api.post(`/almoxarifado/${selectedItem.id}/movimentacoes`, {
        tipo: 'entrada',
        quantidade,
        valorUnitario: valorUnitario ? parseFloat(valorUnitario) : undefined,
        observacao,
        data
      })

      toast({
        title: 'Entrada registrada',
        description: 'A entrada foi registrada com sucesso.'
      })

      router.push('/app-empresa/almoxarifado/movimentacoes')
    } catch (error: any) {
      toast({
        title: 'Erro ao registrar',
        description: error.response?.data?.error || 'Não foi possível registrar a entrada.',
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
        <Header title="Registrar Entrada" />
        
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
                  Registrar Entrada no Estoque
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
                              {item.codigo} • {item.unidade}
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
                    {/* Dados da Entrada */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="quantidade">Quantidade *</Label>
                        <Input
                          id="quantidade"
                          type="number"
                          min="1"
                          value={quantidade}
                          onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valorUnitario">Valor Unitário (R$)</Label>
                        <Input
                          id="valorUnitario"
                          type="number"
                          step="0.01"
                          min="0"
                          value={valorUnitario}
                          onChange={(e) => setValorUnitario(e.target.value)}
                          placeholder="0,00"
                        />
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
                          placeholder="Motivo da entrada, nota fiscal, etc..."
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
                        {valorUnitario && (
                          <div className="flex justify-between">
                            <span>Valor total:</span>
                            <span className="font-bold text-green-600">
                              R$ {(parseFloat(valorUnitario) * quantidade).toFixed(2)}
                            </span>
                          </div>
                        )}
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
                            Registrar Entrada
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