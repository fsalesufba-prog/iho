'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MessageCircle, ThumbsUp, Reply, MoreHorizontal, Flag } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { useToast } from '@/components/hooks/useToast'
import { useAuth } from '@/components/hooks/useAuth'
import { api } from '@/lib/api'

const commentSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').optional(),
  email: z.string().email('E-mail inválido').optional(),
  comentario: z.string().min(1, 'Comentário é obrigatório'),
})

type CommentFormData = z.infer<typeof commentSchema>

interface BlogCommentsProps {
  postId: number
}

export function BlogComments({ postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  
  const { user } = useAuth()
  const { toast } = useToast()

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      nome: '',
      email: '',
      comentario: '',
    },
  })

  useEffect(() => {
    carregarComentarios()
  }, [postId, page])

  const carregarComentarios = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/blog/${postId}/comments`, {
        params: { page, limit: 10 }
      })
      
      if (page === 1) {
        setComments(response.data.data)
      } else {
        setComments(prev => [...prev, ...response.data.data])
      }
      
      setHasMore(response.data.meta.hasMore)
    } catch (error) {
      console.error('Erro ao carregar comentários:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: CommentFormData) => {
    try {
      const payload: any = {
        comentario: data.comentario,
      }

      if (!user) {
        payload.nome = data.nome
        payload.email = data.email
      }

      if (replyTo) {
        payload.parentId = replyTo
      }

      await api.post(`/blog/${postId}/comments`, payload)

      toast({
        title: 'Comentário enviado!',
        description: 'Seu comentário foi publicado com sucesso.',
      })

      form.reset()
      setReplyTo(null)
      carregarComentarios()
    } catch (error) {
      console.error('Erro ao enviar comentário:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar o comentário',
        variant: 'destructive',
      })
    }
  }

  const handleLike = async (commentId: number) => {
    try {
      await api.post(`/blog/comments/${commentId}/like`)
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, likes: c.likes + 1, liked: true }
            : c
        )
      )
    } catch (error) {
      console.error('Erro ao curtir comentário:', error)
    }
  }

  const handleReport = async (commentId: number) => {
    try {
      await api.post(`/blog/comments/${commentId}/report`)
      toast({
        title: 'Denúncia enviada',
        description: 'Obrigado por nos ajudar a manter a comunidade saudável.',
      })
    } catch (error) {
      console.error('Erro ao denunciar comentário:', error)
    }
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
    <div className="space-y-6">
      <h3 className="text-2xl font-bold flex items-center">
        <MessageCircle className="h-6 w-6 mr-2" />
        Comentários ({comments.length})
      </h3>

      {/* Formulário de comentário */}
      <div className="bg-secondary/20 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">
          {replyTo ? 'Responder comentário' : 'Deixe seu comentário'}
        </h4>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!user && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="comentario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite seu comentário..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end space-x-2">
              {replyTo && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setReplyTo(null)}
                >
                  Cancelar resposta
                </Button>
              )}
              <Button type="submit">
                {replyTo ? 'Responder' : 'Comentar'}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {/* Lista de comentários */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-card rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={comment.usuario?.avatar} />
                  <AvatarFallback>
                    {getInitials(comment.usuario?.nome || comment.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {comment.usuario?.nome || comment.nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
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
                  <DropdownMenuItem onClick={() => handleReport(comment.id)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Denunciar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-muted-foreground mb-4">
              {comment.comentario}
            </p>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(comment.id)}
                className={comment.liked ? 'text-primary' : ''}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {comment.likes} {comment.likes === 1 ? 'curtida' : 'curtidas'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(comment.id)}
              >
                <Reply className="h-4 w-4 mr-2" />
                Responder
              </Button>
            </div>

            {/* Respostas */}
            {comment.respostas && comment.respostas.length > 0 && (
              <div className="ml-12 mt-4 space-y-4">
                {comment.respostas.map((resposta: any) => (
                  <div key={resposta.id} className="bg-secondary/20 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(resposta.usuario?.nome || resposta.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">
                            {resposta.usuario?.nome || resposta.nome}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(resposta.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">
                      {resposta.comentario}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {hasMore && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={loading}
            >
              Carregar mais comentários
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}