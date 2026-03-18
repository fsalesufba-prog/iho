'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  Plus,
  Search,
  Download,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Copy,
  Clock,
  Heart,
  MessageCircle,
  CheckCircle,
  XCircle,
  Star,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'

import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'

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
  destaque: boolean
  publicado: boolean
  dataPublicacao?: string
  visualizacoes: number
  likes: number
  comentarios: number
  createdAt: string
  updatedAt: string
}

export default function BlogAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('todas')
  const [status, setStatus] = useState('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    publicados: 0,
    rascunhos: 0,
    visualizacoes: 0,
    likes: 0,
    comentarios: 0
  })
  const [categorias, setCategorias] = useState<string[]>([])

  useEffect(() => {
    carregarCategorias()
    carregarPosts()
    carregarStats()
  }, [page, categoria, status, search])

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/blog/categorias')
      setCategorias(response.data)
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const carregarPosts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/blog', {
        params: {
          page,
          limit: 10,
          categoria: categoria !== 'todas' ? categoria : undefined,
          publicado: status !== 'todos' ? (status === 'publicado') : undefined,
          search: search || undefined
        }
      })
      setPosts(response.data.data)
      setTotalPages(response.data.meta.pages)
    } catch (error) {
      console.error('Erro ao carregar posts:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os posts',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarStats = async () => {
    try {
      const response = await api.get('/admin/blog/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleSearch = () => {
    setPage(1)
    carregarPosts()
  }

  const handleDelete = async () => {
    if (!selectedPost) return

    try {
      await api.delete(`/admin/blog/${selectedPost.id}`)
      toast({
        title: 'Sucesso',
        description: 'Post excluído com sucesso'
      })
      setShowDeleteDialog(false)
      setSelectedPost(null)
      carregarPosts()
      carregarStats()
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o post',
        variant: 'error'
      })
    }
  }

  const handleToggleDestaque = async (id: number, destaque: boolean) => {
    try {
      await api.patch(`/admin/blog/${id}/destaque`, { destaque: !destaque })
      toast({
        title: 'Sucesso',
        description: destaque ? 'Removido dos destaques' : 'Adicionado aos destaques'
      })
      carregarPosts()
    } catch (error) {
      console.error('Erro ao alterar destaque:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o destaque',
        variant: 'error'
      })
    }
  }

  const handleTogglePublicacao = async (id: number, publicado: boolean) => {
    try {
      await api.patch(`/admin/blog/${id}/publicar`, { publicado: !publicado })
      toast({
        title: 'Sucesso',
        description: publicado ? 'Post despublicado' : 'Post publicado'
      })
      carregarPosts()
      carregarStats()
    } catch (error) {
      console.error('Erro ao alterar publicação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a publicação',
        variant: 'error'
      })
    }
  }

  const handleDuplicar = async (post: Post) => {
    try {
      const { id, visualizacoes, likes, comentarios, createdAt, updatedAt, dataPublicacao, ...postData } = post

      await api.post('/admin/blog', {
        ...postData,
        titulo: `${post.titulo} (cópia)`,
        slug: `${post.slug}-copia`,
        publicado: false
      })
      toast({
        title: 'Sucesso',
        description: 'Post duplicado com sucesso'
      })
      carregarPosts()
    } catch (error) {
      console.error('Erro ao duplicar post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível duplicar o post',
        variant: 'error'
      })
    }
  }

  const getStatusBadge = (publicado: boolean, dataPublicacao?: string) => {
    if (publicado) {
      // Verifica se é uma publicação futura (programada)
      const isProgramado = dataPublicacao && new Date(dataPublicacao) > new Date()

      return (
        <Badge className={isProgramado
          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
        }>
          <CheckCircle className="h-3 w-3 mr-1" />
          {isProgramado ? 'Programado' : 'Publicado'}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Rascunho
      </Badge>
    )
  }

  const getDestaqueBadge = (destaque: boolean) => {
    if (destaque) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
          <Star className="h-3 w-3 mr-1 fill-current" />
          Destaque
        </Badge>
      )
    }
    return null
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: ptBR })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Blog</h1>
            <p className="text-muted-foreground">
              Gerencie os posts do blog
            </p>
          </div>
        </div>

        <Link href="/admin-sistema/blog/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Posts</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publicados</p>
                <p className="text-2xl font-bold text-green-600">{stats.publicados}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.rascunhos}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visualizações</p>
                <p className="text-2xl font-bold text-blue-600">{stats.visualizacoes}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou autor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" onClick={handleSearch}>
                Buscar
              </Button>
            </div>

            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={carregarPosts}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Post</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Visualizações</TableHead>
                  <TableHead>Engajamento</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum post encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  posts.map((post) => (
                    <TableRow
                      key={post.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/admin-sistema/blog/${post.slug}`)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={post.imagem || '/images/blog/default.jpg'}
                              alt={post.titulo}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{post.titulo}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {post.resumo}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.autorAvatar} />
                            <AvatarFallback className="text-xs">
                              {getInitials(post.autor)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{post.autor}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{post.categoria}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(post.publicado, post.dataPublicacao)}
                          {getDestaqueBadge(post.destaque)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(post.dataPublicacao || post.createdAt)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span>{post.visualizacoes}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-muted-foreground" />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3 text-muted-foreground" />
                            <span>{post.comentarios}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin-sistema/blog/${post.slug}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin-sistema/blog/editar/${post.id}`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicar(post)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleDestaque(post.id, post.destaque)}>
                              <Star className="h-4 w-4 mr-2" />
                              {post.destaque ? 'Remover destaque' : 'Adicionar destaque'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTogglePublicacao(post.id, post.publicado)}>
                              {post.publicado ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Despublicar
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Publicar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPost(post)
                                setShowDeleteDialog(true)
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o post "{selectedPost?.titulo}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}