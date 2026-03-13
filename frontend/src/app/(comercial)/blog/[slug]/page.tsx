'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar,
  User,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Mail,
  Printer,
  Download,
  ArrowLeft,
  ThumbsUp,
  Reply,
  Flag,
  MoreHorizontal,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/common/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Separator } from '@/components/ui/Separator'
import { Textarea } from '@/components/ui/Textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
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
  autorBio?: string
  categoria: string
  tags: string[]
  dataPublicacao: string
  dataAtualizacao?: string
  tempoLeitura: number
  visualizacoes: number
  likes: number
  comentarios: Array<{
    id: number
    nome: string
    email?: string
    avatar?: string
    comentario: string
    data: string
    likes: number
    respostas?: Array<any>
  }>
}

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const slug = params.slug as string

  const [post, setPost] = useState<Post | null>(null)
  const [related, setRelated] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [replyingTo, setReplyingTo] = useState<number | null>(null)

  useEffect(() => {
    carregarPost()
    carregarRelacionados()
  }, [slug])

  const carregarPost = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/blog/${slug}`)
      setPost(response.data)
      setComments(response.data.comentarios || [])
      
      // Registrar visualização
      await api.post(`/blog/${slug}/view`)
    } catch (error) {
      console.error('Erro ao carregar post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o artigo',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarRelacionados = async () => {
    try {
      const response = await api.get('/blog', {
        params: { related: slug, limit: 3 }
      })
      setRelated(response.data.data)
    } catch (error) {
      console.error('Erro ao carregar posts relacionados:', error)
    }
  }

  const handleLike = async () => {
    try {
      if (liked) {
        await api.post(`/blog/${slug}/unlike`)
        setPost(prev => prev ? { ...prev, likes: prev.likes - 1 } : null)
      } else {
        await api.post(`/blog/${slug}/like`)
        setPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null)
      }
      setLiked(!liked)
    } catch (error) {
      console.error('Erro ao curtir post:', error)
    }
  }

  const handleSave = async () => {
    try {
      if (saved) {
        await api.post(`/blog/${slug}/unsave`)
      } else {
        await api.post(`/blog/${slug}/save`)
      }
      setSaved(!saved)
      toast({
        title: saved ? 'Removido dos salvos' : 'Salvo com sucesso',
        description: saved 
          ? 'O artigo foi removido da sua lista'
          : 'O artigo foi adicionado à sua lista'
      })
    } catch (error) {
      console.error('Erro ao salvar post:', error)
    }
  }

  const handleComment = async () => {
    if (!comment.trim()) return

    try {
      const response = await api.post(`/blog/${slug}/comments`, {
        comentario: comment,
        parentId: replyingTo
      })

      if (replyingTo) {
        // Atualizar respostas
        setComments(prev => prev.map(c => 
          c.id === replyingTo 
            ? { ...c, respostas: [...(c.respostas || []), response.data] }
            : c
        ))
      } else {
        setComments(prev => [response.data, ...prev])
      }

      setComment('')
      setReplyingTo(null)
      toast({
        title: 'Comentário enviado!',
        description: 'Seu comentário foi publicado com sucesso.'
      })
    } catch (error) {
      console.error('Erro ao comentar:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível publicar o comentário',
        variant: 'destructive'
      })
    }
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href
    const title = post?.titulo || ''

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
    }

    if (platform === 'copy') {
      await navigator.clipboard.writeText(url)
      toast({
        title: 'Link copiado!',
        description: 'O link foi copiado para sua área de transferência'
      })
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank')
    }
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
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
    return <PostSkeleton />
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/blog" className="hover:text-primary">
          Blog
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium truncate">
          {post.titulo}
        </span>
      </nav>

      {/* Artigo */}
      <article className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <Badge className="px-3 py-1">
              {post.categoria}
            </Badge>
            {post.tags?.map(tag => (
              <Badge key={tag} variant="outline" className="px-3 py-1">
                #{tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold">
            {post.titulo}
          </h1>

          <p className="text-xl text-muted-foreground">
            {post.resumo}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={post.autorAvatar} />
                <AvatarFallback>{getInitials(post.autor)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{post.autor}</p>
                <p className="text-xs text-muted-foreground">Autor</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(post.dataPublicacao)}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {post.tempoLeitura} min de leitura
              </span>
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-2" />
                {post.visualizacoes} visualizações
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between py-4 border-y">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(liked && 'text-red-600')}
              >
                <Heart className={cn('h-4 w-4 mr-2', liked && 'fill-current')} />
                {post.likes} curtidas
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={cn(saved && 'text-primary')}
              >
                <Bookmark className={cn('h-4 w-4 mr-2', saved && 'fill-current')} />
                {saved ? 'Salvo' : 'Salvar'}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare('facebook')}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('email')}>
                    <Mail className="h-4 w-4 mr-2" />
                    E-mail
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    <Link2 className="h-4 w-4 mr-2" />
                    Copiar link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Imagem destacada */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative h-[500px] rounded-xl overflow-hidden"
        >
          <Image
            src={post.imagem}
            alt={post.titulo}
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        {/* Conteúdo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.conteudo }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4">
            {post.tags.map(tag => (
              <Link key={tag} href={`/blog/tag/${tag}`}>
                <Badge variant="secondary" className="px-3 py-1 cursor-pointer hover:bg-primary/20">
                  #{tag}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Autor */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-0">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={post.autorAvatar} />
                <AvatarFallback className="text-lg">{getInitials(post.autor)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-1">{post.autor}</h3>
                <p className="text-muted-foreground mb-3">
                  {post.autorBio || 'Autor do blog IHO'}
                </p>
                <Link href={`/blog/autor/${post.autor}`}>
                  <Button variant="outline" size="sm">
                    Ver todos os artigos
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts Relacionados */}
        {related.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Artigos relacionados</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="group overflow-hidden h-full cursor-pointer hover:shadow-lg transition-all">
                    <div className="relative h-40 w-full overflow-hidden">
                      <Image
                        src={post.imagem}
                        alt={post.titulo}
                        fill
                        className="object-cover transition-transform group-hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {post.titulo}
                      </h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.resumo}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comentários */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Comentários ({comments.length})
          </h3>

          {/* Formulário de comentário */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold mb-4">
                {replyingTo ? 'Responder comentário' : 'Deixe seu comentário'}
              </h4>
              <Textarea
                placeholder="Digite seu comentário..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="mb-4"
              />
              <div className="flex items-center justify-between">
                {replyingTo && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(null)}
                  >
                    Cancelar resposta
                  </Button>
                )}
                <Button onClick={handleComment} disabled={!comment.trim()}>
                  {replyingTo ? 'Responder' : 'Comentar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de comentários */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={(id) => setReplyingTo(id)}
                />
              ))
            )}
          </div>
        </div>
      </article>
    </div>
  )
}

// Componente de comentário
function CommentItem({ comment, onReply }: { comment: any; onReply: (id: number) => void }) {
  const [liked, setLiked] = useState(false)
  const [showReplyForm, setShowReplyForm] = useState(false)

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{getInitials(comment.nome)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{comment.nome}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(comment.data), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Flag className="h-4 w-4 mr-2" />
                Denunciar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-muted-foreground mb-4">{comment.comentario}</p>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLiked(!liked)}
            className={liked ? 'text-primary' : ''}
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            {comment.likes} curtidas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id)}
          >
            <Reply className="h-4 w-4 mr-2" />
            Responder
          </Button>
        </div>

        {/* Respostas */}
        {comment.respostas && comment.respostas.length > 0 && (
          <div className="ml-12 mt-4 space-y-4">
            {comment.respostas.map((resposta: any) => (
              <div key={resposta.id} className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(resposta.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{resposta.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(resposta.data), "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground ml-8">
                  {resposta.comentario}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Skeleton para loading
function PostSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      <Skeleton className="h-[500px] w-full rounded-xl" />

      <div className="space-y-4">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
      </div>
    </div>
  )
}