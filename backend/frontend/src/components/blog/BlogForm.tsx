'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Eye } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { BlogEditor } from './BlogEditor'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

const formSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  resumo: z.string().min(1, 'Resumo é obrigatório'),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  tags: z.string().optional(),
  imagem: z.string().optional(),
  publicado: z.boolean().default(false),
  dataPublicacao: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface BlogFormProps {
  postId?: number
  onSuccess?: () => void
}

export function BlogForm({ postId, onSuccess }: BlogFormProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [categorias, setCategorias] = useState<string[]>([])
  
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: '',
      slug: '',
      resumo: '',
      conteudo: '',
      categoria: '',
      tags: '',
      imagem: '',
      publicado: false,
      dataPublicacao: new Date().toISOString().split('T')[0],
    },
  })

  useEffect(() => {
    carregarCategorias()
    if (postId) {
      carregarPost()
    }
  }, [postId])

  const carregarCategorias = async () => {
    try {
      const response = await api.get('/blog/categories')
      setCategorias(response.data.map((c: any) => c.nome))
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const carregarPost = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/blog/${postId}`)
      const post = response.data
      
      form.reset({
        titulo: post.titulo,
        slug: post.slug,
        resumo: post.resumo,
        conteudo: post.conteudo,
        categoria: post.categoria,
        tags: post.tags?.join(', '),
        imagem: post.imagem,
        publicado: post.publicado,
        dataPublicacao: post.dataPublicacao?.split('T')[0],
      })
    } catch (error) {
      console.error('Erro ao carregar post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o post',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleTitleChange = (title: string) => {
    form.setValue('titulo', title)
    if (!postId) {
      form.setValue('slug', generateSlug(title))
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setSaving(true)

      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      }

      if (postId) {
        await api.put(`/blog/${postId}`, payload)
        toast({
          title: 'Post atualizado!',
          description: 'O post foi atualizado com sucesso.',
        })
      } else {
        await api.post('/blog', payload)
        toast({
          title: 'Post criado!',
          description: 'O post foi criado com sucesso.',
        })
      }

      onSuccess?.()
      router.push('/admin-sistema/blog')
    } catch (error) {
      console.error('Erro ao salvar post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o post',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="conteudo" value={previewMode ? 'preview' : 'conteudo'}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="conteudo" onClick={() => setPreviewMode(false)}>
                Editar
              </TabsTrigger>
              <TabsTrigger value="preview" onClick={() => setPreviewMode(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {postId ? 'Atualizar' : 'Publicar'}
                  </>
                )}
              </Button>
            </div>
          </div>

          <TabsContent value="conteudo" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Título do artigo"
                          {...field}
                          onChange={(e) => handleTitleChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="url-do-artigo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resumo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumo</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Breve resumo do artigo"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conteudo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conteúdo</FormLabel>
                      <FormControl>
                        <BlogEditor
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="tag1, tag2, tag3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imagem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL da Imagem</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataPublicacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de publicação</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="publicado"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="!mt-0">
                        Publicar imediatamente
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <div className="prose prose-lg max-w-none p-8 border rounded-lg">
              <h1>{form.watch('titulo')}</h1>
              <div dangerouslySetInnerHTML={{ __html: form.watch('conteudo') }} />
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
}