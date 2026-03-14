'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  FolderTree
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { CategoriaForm } from './CategoriaForm'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface Categoria {
  id: string
  nome: string
  descricao: string
  totalItens: number
  valorTotal: number
}

export function CategoriaList() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/categorias')
      setCategorias(response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as categorias',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      await api.delete(`/almoxarifado/categorias/${id}`)
      toast({
        title: 'Sucesso',
        description: 'Categoria excluída com sucesso'
      })
      carregarCategorias()
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a categoria',
<<<<<<< HEAD
        variant: 'destructive'
=======
        variant: 'error'
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
      })
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FolderTree className="h-5 w-5 mr-2" />
              Categorias
            </CardTitle>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Total de Itens</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma categoria encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  categorias.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.nome}</TableCell>
                      <TableCell>{cat.descricao}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {cat.totalItens} itens
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        }).format(cat.valorTotal)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedCategoria(cat)
                              setShowForm(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoriaForm
        open={showForm}
        onOpenChange={setShowForm}
        categoria={selectedCategoria}
        onSuccess={() => {
          setShowForm(false)
          setSelectedCategoria(null)
          carregarCategorias()
        }}
      />
    </>
  )
}