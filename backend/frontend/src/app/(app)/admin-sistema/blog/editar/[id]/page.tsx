'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
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
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { BlogEditor } from '@/components/blog/BlogEditor'

export default function EditarPostPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('escrever')

  // Estados do formulário
  const [titulo, setTitulo] = useState('')
  const [slug, setSlug] = useState('')
  const [resumo, setResumo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [categoria, setCategoria] = useState('')
  const [autor, setAutor] = useState('')
  const [imagem, setImagem] = useState('')
  const [destaque, setDestaque] = useState(false)
  const [publicado, setPublicado] = useState(false)
  const [dataPublicacao, setDataPublicacao] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [novaTag, setNovaTag] = useState('')

  const [errors, setErrors] = useState({
    titulo: '',
    slug: '',
    resumo: '',
    conteudo: '',
    categoria: '',
    autor: '',
  })

  useEffect(() => {
    carregarPost()
  }, [id])

  const carregarPost = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/blog/${id}`)
      const post = response.data

      setTitulo(post.titulo || '')
      setSlug(post.slug || '')
      setResumo(post.resumo || '')
      setConteudo(post.conteudo || '')
      setCategoria(post.categoria || '')
      setAutor(post.autor || '')
      setImagem(post.imagem || '')
      setDestaque(post.destaque || false)
      setPublicado(post.publicado || false)
      setDataPublicacao(post.dataPublicacao?.split('T')[0] || '')
      setTags(post.tags || [])
    } catch (error) {
      console.error('Erro ao carregar post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o post',
        variant: 'error'
      })
      router.push('/admin-sistema/blog')
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
    setTitulo(title)
    setSlug(generateSlug(title))
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

  const validate = () => {
    const newErrors = {
      titulo: '',
      slug: '',
      resumo: '',
      conteudo: '',
      categoria: '',
      autor: '',
    }
    let isValid = true

    if (!titulo) {
      newErrors.titulo = 'Título é obrigatório'
      isValid = false
    }
    if (!slug) {
      newErrors.slug = 'Slug é obrigatório'
      isValid = false
    }
    if (!resumo) {
      newErrors.resumo = 'Resumo é obrigatório'
      isValid = false
    }
    if (!conteudo) {
      newErrors.conteudo = 'Conteúdo é obrigatório'
      isValid = false
    }
    if (!categoria) {
      newErrors.categoria = 'Categoria é obrigatória'
      isValid = false
    }
    if (!autor) {
      newErrors.autor = 'Autor é obrigatório'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'error'
      })
      return
    }

    try {
      setSaving(true)

      await api.put(`/admin/blog/${id}`, {
        titulo,
        slug,
        resumo,
        conteudo,
        categoria,
        autor,
        imagem,
        destaque,
        publicado,
        dataPublicacao,
        tags,
      })

      toast({
        title: 'Sucesso',
        description: 'Post atualizado com sucesso'
      })

      router.push('/admin-sistema/blog')
    } catch (error) {
      console.error('Erro ao atualizar post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o post',
        variant: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div>
          <h1 className="text-3xl font-bold">Editar Post</h1>
          <p className="text-muted-foreground">{titulo}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="escrever">Escrever</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="escrever" className="space-y-4 mt-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Título do post"
                  />
                  {errors.titulo && (
                    <p className="text-xs text-destructive">{errors.titulo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="url-do-post"
                  />
                  {errors.slug && (
                    <p className="text-xs text-destructive">{errors.slug}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resumo">Resumo</Label>
                  <Textarea
                    id="resumo"
                    value={resumo}
                    onChange={(e) => setResumo(e.target.value)}
                    placeholder="Breve resumo do post"
                    rows={3}
                  />
                  {errors.resumo && (
                    <p className="text-xs text-destructive">{errors.resumo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <BlogEditor
                    value={conteudo}
                    onChange={setConteudo}
                  />
                  {errors.conteudo && (
                    <p className="text-xs text-destructive">{errors.conteudo}</p>
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
                      value={autor}
                      onChange={(e) => setAutor(e.target.value)}
                      placeholder="Nome do autor"
                    />
                    {errors.autor && (
                      <p className="text-xs text-destructive">{errors.autor}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={categoria} onValueChange={setCategoria}>
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
                    {errors.categoria && (
                      <p className="text-xs text-destructive">{errors.categoria}</p>
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
                    value={imagem}
                    onChange={(e) => setImagem(e.target.value)}
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
                      value={dataPublicacao}
                      onChange={(e) => setDataPublicacao(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 pt-8">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="destaque" className="cursor-pointer">Post em Destaque</Label>
                      <Switch
                        id="destaque"
                        checked={destaque}
                        onCheckedChange={setDestaque}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="publicado" className="cursor-pointer">Publicado</Label>
                      <Switch
                        id="publicado"
                        checked={publicado}
                        onCheckedChange={setPublicado}
                      />
                    </div>
                  </div>
                </div>

                {!publicado && dataPublicacao && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      O post será agendado para {new Date(dataPublicacao).toLocaleDateString('pt-BR')}
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
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </Tabs>
    </motion.div>
  )
}