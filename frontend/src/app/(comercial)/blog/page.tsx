'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  User,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Sparkles,
  TrendingUp,
  BookOpen,
  Tag,
  FolderOpen,
  Award
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Skeleton } from '@/components/ui/Skeleton'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface Post {
  id: number
  titulo: string
  slug: string
  resumo: string
  conteudo: string
  imagem: string
  autor: string
  autorAvatar?: string
  categoria: string
  tags: string[]
  dataPublicacao: string
  tempoLeitura: number
  visualizacoes: number
  likes: number
  comentarios: number
  destaque?: boolean
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [destaques, setDestaques] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const categorias = [
    'Todas',
    'Gestão de Equipamentos',
    'Manutenção',
    'Indicadores',
    'Finanças',
    'Tecnologia',
    'Cases de Sucesso',
    'Tutoriais'
  ]

  useEffect(() => {
    carregarPosts()
    carregarDestaques()
  }, [page, categoria, searchTerm])

  const carregarPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/blog', {
        params: {
          page,
          limit: 6,
          categoria: categoria !== 'todas' ? categoria : undefined,
          search: searchTerm || undefined
        }
      })
      setPosts(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarDestaques = async () => {
    try {
      const response = await api.get('/blog/destaques', { params: { limit: 3 } })
      setDestaques(response.data)
    } catch (error) {
      console.error('Erro ao carregar destaques:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    carregarPosts()
  }

  const clearSearch = () => {
    setSearchTerm('')
    setPage(1)
    carregarPosts()
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  return (
    <div className="space-y-12">
      {/* Hero Section com Destaques */}
      {destaques.length > 0 && (
        <section className="relative -mt-8 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Destaque Principal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="lg:row-span-2"
            >
              <Link href={`/blog/${destaques[0].slug}`}>
                <Card className="group relative overflow-hidden h-full cursor-pointer">
                  <div className="relative h-[400px] w-full">
                    <Image
                      src={destaques[0].imagem}
                      alt={destaques[0].titulo}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <Badge className="mb-3 bg-primary text-white border-0">
                        {destaques[0].categoria}
                      </Badge>
                      
                      <h2 className="text-2xl md:text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                        {destaques[0].titulo}
                      </h2>
                      
                      <p className="text-white/80 mb-4 line-clamp-2">
                        {destaques[0].resumo}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(destaques[0].dataPublicacao)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {destaques[0].tempoLeitura} min
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>

            {/* Destaques Secundários */}
            <div className="space-y-6">
              {destaques.slice(1).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="group overflow-hidden cursor-pointer">
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative sm:w-48 h-32">
                          <Image
                            src={post.imagem}
                            alt={post.titulo}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <CardContent className="flex-1 p-4">
                          <Badge variant="secondary" className="mb-2">
                            {post.categoria}
                          </Badge>
                          <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                            {post.titulo}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {post.resumo}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(post.dataPublicacao)}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {post.tempoLeitura} min
                            </span>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Barra de Busca e Filtros */}
      <section className="relative">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearch} className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-20 w-full"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                Buscar
              </Button>
            </div>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat === 'Todas' ? 'todas' : cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filtros Mobile */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-4 p-4 bg-card rounded-lg border"
          >
            {/* Filtros mobile aqui */}
          </motion.div>
        )}
      </section>

      {/* Lista de Posts */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum artigo encontrado</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? `Não encontramos resultados para "${searchTerm}"`
                : 'Não há artigos publicados nesta categoria ainda.'}
            </p>
            {searchTerm && (
              <Button variant="link" onClick={clearSearch} className="mt-4">
                Limpar busca
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="group overflow-hidden h-full cursor-pointer hover:shadow-xl transition-all duration-300">
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={post.imagem}
                          alt={post.titulo}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <Badge className="absolute top-4 left-4">
                          {post.categoria}
                        </Badge>
                      </div>

                      <CardContent className="p-6">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(post.dataPublicacao)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {post.tempoLeitura} min
                          </span>
                        </div>

                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.titulo}
                        </h3>

                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {post.resumo}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{post.autor}</span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.visualizacoes}
                            </span>
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {post.likes}
                            </span>
                          </div>
                        </div>

                        {post.tags && post.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {post.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-12">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
        
        <div className="relative z-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Receba nossos conteúdos exclusivos
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Inscreva-se na nossa newsletter e fique por dentro das melhores práticas
            em gestão de equipamentos e IHO.
          </p>

          <form className="max-w-md mx-auto flex gap-2">
            <Input
              type="email"
              placeholder="Seu melhor e-mail"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
            <Button variant="secondary" className="whitespace-nowrap">
              Inscrever-se
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-sm mt-4 opacity-70">
            Ao se inscrever, você concorda com nossa Política de Privacidade
          </p>
        </div>
      </section>
    </div>
  )
}