'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  Search,
  Filter,
  Plus,
  Truck,
  Wrench,
  Fuel,
  DollarSign,
  Star,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  LayoutGrid,
  List,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface CatalogoEquipamento {
  id: number
  nome: string
  tipo: string
  marca: string
  modelo: string
  anoFabricacao: number
  imagem?: string
  especificacoes: Record<string, string>
  consumoMedio?: number
  capacidade?: number
  potencia?: number
  peso?: number
  dimensoes?: string
  classificacao: 'leve' | 'medio' | 'pesado' | 'especial'
  popularidade: number
  emEstoque: boolean
  valorMedio?: number
  fornecedores: string[]
  manutencaoPrevista: string
  pecasComuns: string[]
}

export default function CatalogoEquipamentosPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [catalogo, setCatalogo] = useState<CatalogoEquipamento[]>([])
  const [filteredCatalogo, setFilteredCatalogo] = useState<CatalogoEquipamento[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [tipoFiltro, setTipoFiltro] = useState<string>('todos')
  const [classificacaoFiltro, setClassificacaoFiltro] = useState<string>('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedEquipamento, setSelectedEquipamento] = useState<CatalogoEquipamento | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [favoritos, setFavoritos] = useState<number[]>([])

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    tipos: [] as { tipo: string; quantidade: number }[],
    emEstoque: 0,
    valorMedio: 0
  })

  useEffect(() => {
    carregarCatalogo()
    carregarFavoritos()
  }, [])

  useEffect(() => {
    aplicarFiltros()
  }, [catalogo, searchTerm, tipoFiltro, classificacaoFiltro])

  const carregarCatalogo = async () => {
    try {
      setLoading(true)
      const response = await api.get('/equipamentos/catalogo', {
        params: { page, limit: 20 }
      })
      setCatalogo(response.data.data)
      setTotalPages(response.data.meta.pages)
      setStats(response.data.stats)
    } catch (error) {
      toast({
        title: 'Erro ao carregar catálogo',
        description: 'Não foi possível carregar o catálogo de equipamentos.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarFavoritos = async () => {
    try {
      const response = await api.get('/usuarios/favoritos/equipamentos')
      setFavoritos(response.data)
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error)
    }
  }

  const aplicarFiltros = () => {
    let filtered = [...catalogo]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(e => 
        e.nome.toLowerCase().includes(term) ||
        e.marca.toLowerCase().includes(term) ||
        e.modelo.toLowerCase().includes(term) ||
        e.tipo.toLowerCase().includes(term)
      )
    }

    if (tipoFiltro !== 'todos') {
      filtered = filtered.filter(e => e.tipo === tipoFiltro)
    }

    if (classificacaoFiltro !== 'todos') {
      filtered = filtered.filter(e => e.classificacao === classificacaoFiltro)
    }

    setFilteredCatalogo(filtered)
  }

  const toggleFavorito = async (id: number) => {
    try {
      if (favoritos.includes(id)) {
        await api.delete(`/usuarios/favoritos/equipamentos/${id}`)
        setFavoritos(favoritos.filter(f => f !== id))
        toast({
          title: 'Removido dos favoritos',
          description: 'Equipamento removido da sua lista.'
        })
      } else {
        await api.post(`/usuarios/favoritos/equipamentos/${id}`)
        setFavoritos([...favoritos, id])
        toast({
          title: 'Adicionado aos favoritos',
          description: 'Equipamento adicionado à sua lista.'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar favoritos.',
        variant: 'destructive'
      })
    }
  }

  const tiposUnicos = [...new Set(catalogo.map(e => e.tipo))]

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Catálogo de Equipamentos" />
        
        <Container size="xl" className="py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Catálogo de Equipamentos
              </h1>
              <p className="text-muted-foreground mt-1">
                Explore nossa base de equipamentos e modelos
              </p>
            </div>

            {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
              <Link href="/app-empresa/equipamentos/novo">
                <Button className="group">
                  <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                  Adicionar ao Estoque
                </Button>
              </Link>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Modelos</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipos Diferentes</p>
                    <p className="text-2xl font-bold">{stats.tipos.length}</p>
                  </div>
                  <Truck className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Em Estoque</p>
                    <p className="text-2xl font-bold">{stats.emEstoque}</p>
                  </div>
                  <Package className="h-8 w-8 text-green-600/30" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Médio</p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.valorMedio)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Visualização */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, marca ou modelo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {tiposUnicos.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={classificacaoFiltro} onValueChange={setClassificacaoFiltro}>
                    <SelectTrigger className="w-[180px]">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Classificação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas</SelectItem>
                      <SelectItem value="leve">Leve</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="pesado">Pesado</SelectItem>
                      <SelectItem value="especial">Especial</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button variant="outline" onClick={carregarCatalogo}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid/Lista de Equipamentos */}
          {loading ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
            }>
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-32 w-full rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCatalogo.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum equipamento encontrado
                </h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || tipoFiltro !== 'todos' || classificacaoFiltro !== 'todos'
                    ? 'Tente ajustar os filtros'
                    : 'O catálogo está vazio'}
                </p>
              </CardContent>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCatalogo.map((equipamento, index) => (
                <motion.div
                  key={equipamento.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group hover:shadow-xl transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedEquipamento(equipamento)
                          setDialogOpen(true)
                        }}>
                    <CardContent className="p-4">
                      {/* Imagem */}
                      <div className="relative h-40 bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-4 overflow-hidden">
                        {equipamento.imagem ? (
                          <Image
                            src={equipamento.imagem}
                            alt={equipamento.nome}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        
                        {/* Badge de favorito */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorito(equipamento.id)
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors"
                        >
                          <Star 
                            className={cn(
                              "h-4 w-4",
                              favoritos.includes(equipamento.id) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-muted-foreground"
                            )} 
                          />
                        </button>

                        {/* Badge de disponibilidade */}
                        {equipamento.emEstoque && (
                          <Badge className="absolute bottom-2 left-2 bg-green-500">
                            Em Estoque
                          </Badge>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="space-y-2">
                        <h3 className="font-semibold line-clamp-1">{equipamento.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {equipamento.marca} {equipamento.modelo} - {equipamento.anoFabricacao}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{equipamento.tipo}</Badge>
                          <Badge variant="outline" className={
                            equipamento.classificacao === 'leve' ? 'bg-green-100 text-green-800' :
                            equipamento.classificacao === 'medio' ? 'bg-yellow-100 text-yellow-800' :
                            equipamento.classificacao === 'pesado' ? 'bg-orange-100 text-orange-800' :
                            'bg-purple-100 text-purple-800'
                          }>
                            {equipamento.classificacao}
                          </Badge>
                        </div>

                        {/* Especificações rápidas */}
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          {equipamento.consumoMedio && (
                            <div className="flex items-center gap-1">
                              <Fuel className="h-3 w-3 text-muted-foreground" />
                              <span>{equipamento.consumoMedio} L/h</span>
                            </div>
                          )}
                          {equipamento.capacidade && (
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-muted-foreground" />
                              <span>{equipamento.capacidade} t</span>
                            </div>
                          )}
                          {equipamento.potencia && (
                            <div className="flex items-center gap-1">
                              <Wrench className="h-3 w-3 text-muted-foreground" />
                              <span>{equipamento.potencia} CV</span>
                            </div>
                          )}
                        </div>

                        {/* Valor médio */}
                        {equipamento.valorMedio && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground">Valor médio</p>
                            <p className="text-lg font-bold text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(equipamento.valorMedio)}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            // Visualização em lista
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {filteredCatalogo.map((equipamento, index) => (
                    <motion.div
                      key={equipamento.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 hover:bg-muted/50 transition-colors cursor-pointer flex items-center gap-4"
                      onClick={() => {
                        setSelectedEquipamento(equipamento)
                        setDialogOpen(true)
                      }}
                    >
                      {/* Imagem */}
                      <div className="w-20 h-20 bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden flex-shrink-0">
                        {equipamento.imagem ? (
                          <Image
                            src={equipamento.imagem}
                            alt={equipamento.nome}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>

                      {/* Informações */}
                      <div className="flex-1 grid grid-cols-4 gap-4">
                        <div>
                          <h3 className="font-semibold">{equipamento.nome}</h3>
                          <p className="text-sm text-muted-foreground">
                            {equipamento.marca} {equipamento.modelo}
                          </p>
                        </div>

                        <div>
                          <Badge variant="outline">{equipamento.tipo}</Badge>
                          <Badge variant="outline" className="ml-2">
                            {equipamento.classificacao}
                          </Badge>
                        </div>

                        <div className="text-sm">
                          {equipamento.consumoMedio && (
                            <div className="flex items-center gap-1">
                              <Fuel className="h-3 w-3" />
                              {equipamento.consumoMedio} L/h
                            </div>
                          )}
                          {equipamento.capacidade && (
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {equipamento.capacidade} t
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          {equipamento.valorMedio && (
                            <span className="font-bold text-primary">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(equipamento.valorMedio)}
                            </span>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorito(equipamento.id)
                            }}
                            className="p-1.5 hover:bg-muted rounded-full transition-colors"
                          >
                            <Star 
                              className={cn(
                                "h-4 w-4",
                                favoritos.includes(equipamento.id) 
                                  ? "fill-yellow-400 text-yellow-400" 
                                  : "text-muted-foreground"
                              )} 
                            />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Container>
      </main>

      {/* Modal de detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedEquipamento && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEquipamento.nome}</DialogTitle>
                <DialogDescription>
                  {selectedEquipamento.marca} {selectedEquipamento.modelo} - {selectedEquipamento.anoFabricacao}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="especificacoes" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="especificacoes">Especificações</TabsTrigger>
                  <TabsTrigger value="manutencao">Manutenção</TabsTrigger>
                  <TabsTrigger value="pecas">Peças</TabsTrigger>
                  <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
                </TabsList>

                <TabsContent value="especificacoes" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {Object.entries(selectedEquipamento.especificacoes).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-muted/30 rounded">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {selectedEquipamento.consumoMedio && (
                      <div className="text-center p-3 bg-muted/30 rounded">
                        <Fuel className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-sm text-muted-foreground">Consumo Médio</p>
                        <p className="font-bold">{selectedEquipamento.consumoMedio} L/h</p>
                      </div>
                    )}
                    {selectedEquipamento.capacidade && (
                      <div className="text-center p-3 bg-muted/30 rounded">
                        <Package className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-sm text-muted-foreground">Capacidade</p>
                        <p className="font-bold">{selectedEquipamento.capacidade} t</p>
                      </div>
                    )}
                    {selectedEquipamento.potencia && (
                      <div className="text-center p-3 bg-muted/30 rounded">
                        <Wrench className="h-5 w-5 mx-auto mb-1 text-primary" />
                        <p className="text-sm text-muted-foreground">Potência</p>
                        <p className="font-bold">{selectedEquipamento.potencia} CV</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="manutencao">
                  <div className="space-y-4 mt-4">
                    <div className="p-4 bg-muted/30 rounded">
                      <h4 className="font-semibold mb-2">Manutenção Preventiva</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedEquipamento.manutencaoPrevista}
                      </p>
                    </div>

                    <div className="p-4 bg-muted/30 rounded">
                      <h4 className="font-semibold mb-2">Periodicidade Recomendada</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Troca de óleo:</span>
                          <span className="font-medium">250 h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Filtros:</span>
                          <span className="font-medium">500 h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Revisão geral:</span>
                          <span className="font-medium">2000 h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="pecas">
                  <div className="space-y-4 mt-4">
                    <h4 className="font-semibold">Peças de Reposição Comuns</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedEquipamento.pecasComuns.map((peca, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{peca}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="fornecedores">
                  <div className="space-y-4 mt-4">
                    <h4 className="font-semibold">Fornecedores Recomendados</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedEquipamento.fornecedores.map((fornecedor, index) => (
                        <div key={index} className="p-3 bg-muted/30 rounded">
                          <p className="font-medium">{fornecedor}</p>
                          <p className="text-xs text-muted-foreground mt-1">Fornecedor oficial</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Fechar
                </Button>
                {(user?.tipo === 'adm_empresa' || user?.tipo === 'controlador') && (
                  <Link href={`/app-empresa/equipamentos/novo?modelo=${selectedEquipamento.id}`}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar ao Estoque
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}