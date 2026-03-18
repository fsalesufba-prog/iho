'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
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

export default function NovoPostPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [novaTag, setNovaTag] = useState('')
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
  const [dataPublicacao, setDataPublicacao] = useState(new Date().toISOString().split('T')[0])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!titulo || !slug || !resumo || !conteudo || !categoria || !autor) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'error'
      })
      return
    }

    try {
      setLoading(true)

      await api.post('/admin/blog', {
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
        description: 'Post criado com sucesso'
      })

      router.push('/admin-sistema/blog')
    } catch (error) {
      console.error('Erro ao criar post:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o post',
        variant: 'error'
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="url-do-post"
                  />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <BlogEditor
                    value={conteudo}
                    onChange={setConteudo}
                  />
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
                      <Label htmlFor="publicado" className="cursor-pointer">Publicar Imediatamente</Label>
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