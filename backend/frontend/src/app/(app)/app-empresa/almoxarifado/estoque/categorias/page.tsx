'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Package,
  Plus,
  Search,
  ChevronRight,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

interface Categoria {
  nome: string
  quantidade: number
  valorTotal: number
}

export default function CategoriasPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [novaCategoriaOpen, setNovaCategoriaOpen] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    carregarCategorias()
  }, [])

  const carregarCategorias = async () => {
    try {
      setLoading(true)
      const response = await api.get('/almoxarifado/analise/consumo')
      const categoriasData = Object.entries(response.data.data.consumoPorCategoria || {}).map(
        ([nome, data]: [string, any]) => ({
          nome,
          quantidade: data.quantidade || 0,
          valorTotal: data.valor || 0
        })
      )
      setCategorias(categoriasData)
    } catch (error) {
      toast({
        title: 'Erro ao carregar categorias',
        description: 'Não foi possível carregar as categorias.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNovaCategoria = async () => {
    if (!novaCategoria.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Digite um nome para a categoria.',
        variant: 'destructive'
      })
      return
    }

    try {
      setSaving(true)
      // Aqui você implementaria a criação da categoria
      // await api.post('/almoxarifado/categorias', { nome: novaCategoria })
      
      toast({
        title: 'Categoria criada',
        description: 'A categoria foi criada com sucesso.'
      })

      setNovaCategoriaOpen(false)
      setNovaCategoria('')
      carregarCategorias()
    } catch (error) {
      toast({
        title: 'Erro ao criar',
        description: 'Não foi possível criar a categoria.',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const categoriasFiltradas = categorias.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Categorias" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/almoxarifado/estoque"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Estoque
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Categorias
              </h1>
              <p className="text-muted-foreground mt-1">
                Gerencie as categorias de itens do estoque
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Button onClick={() => setNovaCategoriaOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            )}
          </div>

          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lista de Categorias */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categoriasFiltradas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhuma categoria encontrada
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm
                    ? 'Tente buscar por outro termo'
                    : 'Crie sua primeira categoria'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriasFiltradas.map((categoria, index) => (
                <motion.div
                  key={categoria.nome}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/app-empresa/almoxarifado/estoque?categoria=${encodeURIComponent(categoria.nome)}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{categoria.nome}</h3>
                            <p className="text-sm text-muted-foreground">
                              {categoria.quantidade} movimentações
                            </p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      </main>

      {/* Modal Nova Categoria */}
      <Dialog open={novaCategoriaOpen} onOpenChange={setNovaCategoriaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
            <DialogDescription>
              Adicione uma nova categoria para organizar os itens do estoque
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder="Nome da categoria"
              value={novaCategoria}
              onChange={(e) => setNovaCategoria(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaCategoriaOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNovaCategoria} disabled={saving}>
              {saving ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}