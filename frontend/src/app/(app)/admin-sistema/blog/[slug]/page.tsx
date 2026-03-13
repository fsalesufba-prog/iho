'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  Tag,
  FolderOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Zap,
  Rocket,
  Globe,
  Shield,
  Lock,
  Award,
  Star,
  Crown,
  Gem,
  Diamond,
  Medal,
  Trophy,
  Gift,
  Package,
  Box,
  Archive,
  FileText,
  Download,
  Printer,
  Copy,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Link2
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Post {
  id: number
  titulo: string
  slug: string
  resumo: string
  conteudo: string
  imagem: string
  autor: string
  autorAvatar?: string
  autorBio?: string
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

export default function PostDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const slug = params.slug as string

  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    carregarPost()
  }, [slug])

  const carregarPost = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/blog/slug/${slug}`)
      setPost(response.data)
    } catch (error) {
      console.error('Erro ao carregar post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o post',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!post) return

    try {
      await api.delete(`/admin/blog/${post.id}`)
      toast({
        title: 'Sucesso',
        description: 'Post excluído com sucesso'
      })
      router.push('/admin-sistema/blog')
    } catch (error) {
      console.error('Erro ao excluir post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o post',
        variant: 'destructive'
      })
    }
  }

  const handleTogglePublicacao = async () => {
    if (!post) return

    try {
      await api.patch(`/admin/blog/${post.id}/publicar`, { publicado: !post.publicado })
      toast({
        title: 'Sucesso',
        description: post.publicado ? 'Post despublicado' : 'Post publicado'
      })
      carregarPost()
    } catch (error) {
      console.error('Erro ao alterar publicação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar a publicação',
        variant: 'destructive'
      })
    }
  }

  const handleToggleDestaque = async () => {
    if (!post) return

    try {
      await api.patch(`/admin/blog/${post.id}/destaque`, { destaque: !post.destaque })
      toast({
        title: 'Sucesso',
        description: post.destaque ? 'Removido dos destaques' : 'Adicionado aos destaques'
      })
      carregarPost()
    } catch (error) {
      console.error('Erro ao alterar destaque:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o destaque',
        variant: 'destructive'
      })
    }
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/blog/${post?.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast({
      title: 'Link copiado!',
      description: 'Link do post copiado para a área de transferência'
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusBadge = () => {
    if (!post) return null

    if (post.publicado) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Publicado
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

  const getDestaqueBadge = () => {
    if (!post?.destaque) return null

    return (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
        <Star className="h-3 w-3 mr-1 fill-current" />
        Destaque
      </Badge>
    )
  }

  const formatDate = (date?: string) => {
    if (!date) return '-'
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading || !post) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    )
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{post.titulo}</h1>
              <div className="flex items-center gap-2">
                {getStatusBadge()}
                {getDestaqueBadge()}
              </div>
            </div>
            <p className="text-muted-foreground">
              Slug: {post.slug} • Criado em {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCopyLink}
          >
            <Link2 className="h-4 w-4 mr-2" />
            {copied ? 'Copiado!' : 'Copiar Link'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                <Eye className="h-4 w-4 mr-2" />
                Ver no site
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin-sistema/blog/editar/${post.id}`)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTogglePublicacao}>
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
              <DropdownMenuItem onClick={handleToggleDestaque}>
                <Star className="h-4 w-4 mr-2" />
                {post.destaque ? 'Remover destaque' : 'Adicionar destaque'}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visualizações</p>
                <p className="text-2xl font-bold">{post.visualizacoes}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Curtidas</p>
                <p className="text-2xl font-bold">{post.likes}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comentários</p>
                <p className="text-2xl font-bold">{post.comentarios}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Engajamento</p>
                <p className="text-2xl font-bold">
                  {post.visualizacoes > 0 
                    ? (((post.likes + post.comentarios) / post.visualizacoes) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo do Post */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* Imagem destacada */}
              {post.imagem && (
                <div className="relative h-80 rounded-lg overflow-hidden">
                  <Image
                    src={post.imagem}
                    alt={post.titulo}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Metadados */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.dataPublicacao || post.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.autor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FolderOpen className="h-4 w-4" />
                  <span>{post.categoria}</span>
                </div>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <Separator />

              {/* Conteúdo */}
              <div 
                className="prose prose-lg dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: post.conteudo }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna lateral */}
        <div className="lg:col-span-1 space-y-6">
          {/* Informações do Autor */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Autor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.autorAvatar} />
                  <AvatarFallback>{getInitials(post.autor)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.autor}</p>
                  <p className="text-sm text-muted-foreground">Autor</p>
                </div>
              </div>

              {post.autorBio && (
                <p className="text-sm text-muted-foreground">{post.autorBio}</p>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Visualizar no site
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/admin-sistema/blog/editar/${post.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar post
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleTogglePublicacao}
              >
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
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleToggleDestaque}
              >
                <Star className="h-4 w-4 mr-2" />
                {post.destaque ? 'Remover destaque' : 'Adicionar destaque'}
              </Button>
            </CardContent>
          </Card>

          {/* Estatísticas Detalhadas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Visualizações</span>
                <span className="font-medium">{post.visualizacoes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Curtidas</span>
                <span className="font-medium">{post.likes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Comentários</span>
                <span className="font-medium">{post.comentarios}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de engajamento</span>
                <span className="font-medium text-green-600">
                  {post.visualizacoes > 0 
                    ? (((post.likes + post.comentarios) / post.visualizacoes) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Última atualização</span>
                <span className="font-medium">{formatDate(post.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o post "{post.titulo}"?
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