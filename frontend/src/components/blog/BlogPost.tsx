'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Calendar,
  User,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { Skeleton } from '@/components/ui/Skeleton'
import { BlogAuthor } from './BlogAuthor'
import { BlogComments } from './BlogComments'
import { BlogShare } from './BlogShare'
import { BlogRelated } from './BlogRelated'
import { BlogTags } from './BlogTags'
import { api } from '@/lib/api'
import { useToast } from '@/components/hooks/useToast'

interface BlogPostProps {
  slug: string
}

export function BlogPost({ slug }: BlogPostProps) {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    carregarPost()
    registrarVisualizacao()
  }, [slug])

  const carregarPost = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/blog/${slug}`)
      setPost(response.data)
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

  const registrarVisualizacao = async () => {
    try {
      await api.post(`/blog/${slug}/view`)
    } catch (error) {
      console.error('Erro ao registrar visualização:', error)
    }
  }

  const handleLike = async () => {
    try {
      if (liked) {
        await api.post(`/blog/${slug}/unlike`)
        setPost({ ...post, likes: post.likes - 1 })
      } else {
        await api.post(`/blog/${slug}/like`)
        setPost({ ...post, likes: post.likes + 1 })
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

  if (loading) {
    return <BlogPostSkeleton />
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Artigo não encontrado</h2>
        <p className="text-muted-foreground mb-6">
          O artigo que você está procurando não existe ou foi removido.
        </p>
        <Link href="/blog">
          <Button>Ver todos os artigos</Button>
        </Link>
      </div>
    )
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/blog" className="hover:text-primary">
            Blog
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link 
            href={`/blog/categoria/${post.categoria.toLowerCase()}`}
            className="hover:text-primary"
          >
            {post.categoria}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{post.titulo}</span>
        </nav>
      </div>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {post.titulo}
        </h1>
        
        <p className="text-xl text-muted-foreground mb-6">
          {post.resumo}
        </p>

        {/* Meta informações */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(post.dataPublicacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            {post.autor}
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            {post.tempoLeitura} min de leitura
          </div>
          
          <div className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            {post.visualizacoes} visualizações
          </div>
        </div>

        {/* Categorias e tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link href={`/blog/categoria/${post.categoria.toLowerCase()}`}>
            <Badge variant="secondary" className="cursor-pointer">
              {post.categoria}
            </Badge>
          </Link>
          {post.tags?.map((tag: string) => (
            <Link key={tag} href={`/blog/tag/${tag.toLowerCase()}`}>
              <Badge variant="outline" className="cursor-pointer">
                #{tag}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={liked ? 'text-red-600' : ''}
            >
              <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
              {post.likes} {post.likes === 1 ? 'curtida' : 'curtidas'}
            </Button>
            
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              {post.comentarios} comentários
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={saved ? 'text-primary' : ''}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${saved ? 'fill-current' : ''}`} />
              {saved ? 'Salvo' : 'Salvar'}
            </Button>
          </div>

          <BlogShare 
            title={post.titulo}
            url={`/blog/${post.slug}`}
          />
        </div>
      </header>

      {/* Imagem destacada */}
      {post.imagem && (
        <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-8">
          <Image
            src={post.imagem}
            alt={post.titulo}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Conteúdo */}
      <div 
        className="prose prose-lg dark:prose-invert max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.conteudo }}
      />

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <BlogTags tags={post.tags} />
      )}

      <Separator className="my-8" />

      {/* Autor */}
      <BlogAuthor author={post.autor} />

      <Separator className="my-8" />

      {/* Comentários */}
      <BlogComments postId={post.id} />

      <Separator className="my-8" />

      {/* Artigos relacionados */}
      <BlogRelated 
        categoria={post.categoria}
        currentSlug={post.slug}
      />

      {/* Newsletter */}
      <div className="mt-12">
        <BlogNewsletter />
      </div>
    </article>
  )
}

function BlogPostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Skeleton className="h-6 w-64" />
      </div>

      <div className="space-y-4 mb-8">
        <Skeleton className="h-16 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-5/6" />
        
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      <Skeleton className="h-[400px] w-full rounded-lg mb-8" />

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