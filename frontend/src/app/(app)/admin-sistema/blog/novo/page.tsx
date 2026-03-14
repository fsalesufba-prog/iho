'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
<<<<<<< HEAD
import Link from 'next/link'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  ArrowLeft,
  Save,
  RefreshCw,
  X,
  Plus,
  Info,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'

import { BlogEditor } from '@/components/blog/BlogEditor'

const postSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  slug: z.string().min(1, 'Slug é obrigatório'),
  resumo: z.string().min(1, 'Resumo é obrigatório'),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  autor: z.string().min(1, 'Autor é obrigatório'),
  imagem: z.string().optional(),
  destaque: z.boolean().default(false),
  publicado: z.boolean().default(false),
  dataPublicacao: z.string().optional(),
})

type PostFormData = z.infer<typeof postSchema>

export default function NovoPostPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [novaTag, setNovaTag] = useState('')
  const [activeTab, setActiveTab] = useState('escrever')

  const form = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      titulo: '',
      slug: '',
      resumo: '',
      conteudo: '',
      categoria: '',
      autor: '',
      imagem: '',
      destaque: false,
      publicado: false,
      dataPublicacao: new Date().toISOString().split('T')[0],
    }
  })

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
    form.setValue('slug', generateSlug(title))
  }

  const adicionarTag = () => {
    if (novaTag.trim() && !tags.includes(novaTag.trim())) {
      setTags([...tags, novaTag.trim()])
      setNovaTag('')
    }
  }

  const removerTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PostFormData) => {
    try {
      setLoading(true)

      await api.post('/admin/blog', {
        ...data,
        tags,
      })

      toast({
        title: 'Sucesso',
        description: 'Post criado com sucesso'
      })

      router.push('/admin-sistema/blog')
    } catch (error) {
      console.error('Erro ao criar post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o post',
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Novo Post</h1>
          <p className="text-muted-foreground">
            Crie um novo post para o blog
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="escrever">Escrever</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="escrever" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    {...form.register('titulo')}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Título do post"
                  />
                  {form.formState.errors.titulo && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.titulo.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    {...form.register('slug')}
                    placeholder="url-do-post"
                  />
                  {form.formState.errors.slug && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.slug.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resumo">Resumo</Label>
                  <Textarea
                    id="resumo"
                    {...form.register('resumo')}
                    placeholder="Breve resumo do post"
                    rows={3}
                  />
                  {form.formState.errors.resumo && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.resumo.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <BlogEditor
                    value={form.watch('conteudo')}
                    onChange={(value) => form.setValue('conteudo', value)}
                  />
                  {form.formState.errors.conteudo && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.conteudo.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="autor">Autor</Label>
                    <Input
                      id="autor"
                      {...form.register('autor')}
                      placeholder="Nome do autor"
                    />
                    {form.formState.errors.autor && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.autor.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select
                      value={form.watch('categoria')}
                      onValueChange={(value) => form.setValue('categoria', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gestão de Equipamentos">Gestão de Equipamentos</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Indicadores">Indicadores</SelectItem>
                        <SelectItem value="Finanças">Finanças</SelectItem>
                        <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                        <SelectItem value="Cases de Sucesso">Cases de Sucesso</SelectItem>
                        <SelectItem value="Tutoriais">Tutoriais</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.categoria && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.categoria.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova tag..."
                      value={novaTag}
                      onChange={(e) => setNovaTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), adicionarTag())}
                      className="flex-1"
                    />
                    <Button type="button" onClick={adicionarTag}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        #{tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removerTag(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imagem">URL da Imagem</Label>
                  <Input
                    id="imagem"
                    {...form.register('imagem')}
                    placeholder="https://..."
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataPublicacao">Data de Publicação</Label>
                    <Input
                      id="dataPublicacao"
                      type="date"
                      {...form.register('dataPublicacao')}
                    />
                  </div>

                  <div className="space-y-2 pt-8">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="destaque" className="cursor-pointer">Post em Destaque</Label>
                      <Switch
                        id="destaque"
                        checked={form.watch('destaque')}
                        onCheckedChange={(checked) => form.setValue('destaque', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="publicado" className="cursor-pointer">Publicar Imediatamente</Label>
                      <Switch
                        id="publicado"
                        checked={form.watch('publicado')}
                        onCheckedChange={(checked) => form.setValue('publicado', checked)}
                      />
                    </div>
                  </div>
                </div>

                {!form.watch('publicado') && form.watch('dataPublicacao') && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
<<<<<<< HEAD
                      O post será agendado para {new Date(form.watch('dataPublicacao')).toLocaleDateString('pt-BR')}
=======
                      O post será agendado para {
                        (() => {
                          const data = form.watch('dataPublicacao')
                          return data ? new Date(data).toLocaleDateString('pt-BR') : ''
                        })()
                      }
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Post
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </motion.div>
  )
}