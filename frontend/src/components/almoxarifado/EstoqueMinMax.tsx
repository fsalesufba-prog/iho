'use client'

import React, { useState, useEffect } from 'react'
import {
  Package,
  TrendingDown,
  TrendingUp,
  Save,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface ItemMinMax {
  id: string
  codigo: string
  nome: string
  categoria: string
  estoqueAtual: number
  estoqueMinimo: number
  estoqueMaximo: number
  unidade: string
  consumoMedio: number
  leadTime: number
}

export function EstoqueMinMax() {
  const [itens, setItens] = useState<ItemMinMax[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState<Record<string, any>>({})
  const { toast } = useToast()

  useEffect(() => {
    carregarItens()
  }, [])

  const carregarItens = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/estoque/minmax')
      setItens(response.data)
      
      // Inicializar estado de edição
      const editState: Record<string, any> = {}
      response.data.forEach((item: ItemMinMax) => {
        editState[item.id] = {
          minimo: item.estoqueMinimo,
          maximo: item.estoqueMaximo
        }
      })
      setEditing(editState)
    } catch (error) {
      console.error('Erro ao carregar itens:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (id: string, field: 'minimo' | 'maximo', value: number) => {
    setEditing(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }))
  }

  const handleSave = async (id: string) => {
    try {
      setSaving(true)
      await api.put(`/almoxarifado/estoque/${id}/minmax`, {
        estoqueMinimo: editing[id].minimo,
        estoqueMaximo: editing[id].maximo
      })

      // Atualizar item na lista
      setItens(prev => prev.map(item => 
        item.id === id 
          ? {
              ...item,
              estoqueMinimo: editing[id].minimo,
              estoqueMaximo: editing[id].maximo
            }
          : item
      ))

      toast({
        title: 'Sucesso',
        description: 'Níveis atualizados com sucesso'
      })
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const calcularSugestaoMinimo = (item: ItemMinMax) => {
    return Math.ceil(item.consumoMedio * item.leadTime * 1.2) // 20% de margem
  }

  const calcularSugestaoMaximo = (item: ItemMinMax) => {
    return Math.ceil(calcularSugestaoMinimo(item) * 3) // 3x o mínimo
  }

  const aplicarSugestao = (id: string) => {
    const item = itens.find(i => i.id === id)
    if (!item) return

    const minimoSugerido = calcularSugestaoMinimo(item)
    const maximoSugerido = calcularSugestaoMaximo(item)

    handleChange(id, 'minimo', minimoSugerido)
    handleChange(id, 'maximo', maximoSugerido)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Configuração de Níveis Mínimo e Máximo</CardTitle>
          <Button variant="outline" size="sm" onClick={carregarItens}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Estoque Atual</TableHead>
              <TableHead>Consumo Médio</TableHead>
              <TableHead>Lead Time</TableHead>
              <TableHead>Mínimo</TableHead>
              <TableHead>Máximo</TableHead>
              <TableHead>Sugestão</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((item) => {
              const minimoSugerido = calcularSugestaoMinimo(item)
              const maximoSugerido = calcularSugestaoMaximo(item)
              const atual = item.estoqueAtual
              const percentualMinMax = (atual / editing[item.id]?.maximo) * 100

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">{item.codigo}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.categoria}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span className="font-medium">
                        {item.estoqueAtual} {item.unidade}
                      </span>
                      <Progress 
                        value={percentualMinMax}
                        className="h-1.5 w-20"
                        indicatorClassName={
                          atual < editing[item.id]?.minimo ? 'bg-yellow-500' :
                          atual > editing[item.id]?.maximo ? 'bg-blue-500' :
                          'bg-green-500'
                        }
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.consumoMedio} {item.unidade}/dia
                  </TableCell>
                  <TableCell>{item.leadTime} dias</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={editing[item.id]?.minimo || 0}
                      onChange={(e) => handleChange(item.id, 'minimo', Number(e.target.value))}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={editing[item.id]?.maximo || 0}
                      onChange={(e) => handleChange(item.id, 'maximo', Number(e.target.value))}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant="outline" className="block text-center">
                        Mín: {minimoSugerido}
                      </Badge>
                      <Badge variant="outline" className="block text-center">
                        Máx: {maximoSugerido}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => aplicarSugestao(item.id)}
                        title="Aplicar sugestão"
                      >
                        <TrendingDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSave(item.id)}
                        disabled={saving}
                        title="Salvar"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}