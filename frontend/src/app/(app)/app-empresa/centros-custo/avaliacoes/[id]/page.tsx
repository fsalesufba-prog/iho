'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import {
  Star,
  ArrowLeft,
  Trash2,
  Calendar,
  User,
  AlertCircle,
  FileText,
  MoreVertical,
} from 'lucide-react'

import { Button } from '@/components/ui/Button'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

import { Progress } from '@/components/ui/Progress'
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
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/hooks/useToast'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Avaliacao {
  id: number
  centroCustoId: number
  centroCustoNome: string
  data: string
  avaliador: string
  notaFinal: number
  categorias: {
    precoCondicoes: number
    qualidadeServico: number
    qualidadeEntrega: number
    segurancaSaude: number
    estoque: number
    administracao: number
  }
  ocorrencias?: string
  observacoes?: string
  createdAt: string
  updatedAt: string
}


export default function AvaliacaoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const id = params.id as string

  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    carregarAvaliacao()
  }, [id])

  const carregarAvaliacao = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/centros-custo/avaliacoes/${id}`)
      setAvaliacao(response.data)
    } catch (error) {
      console.error('Erro ao carregar avaliação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da avaliação',
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!avaliacao) return

    try {
      await api.delete(`/centros-custo/avaliacoes/${avaliacao.id}`)
      toast({
        title: 'Sucesso',
        description: 'Avaliação excluída com sucesso'
      })
      router.push(`/app-empresa/centros-custo/${avaliacao.centroCustoId}/avaliacoes`)
    } catch (error) {
      console.error('Erro ao excluir avaliação:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a avaliação',
        variant: 'error'
      })
    }
  }

  const getNotaColor = (nota: number) => {
    if (nota >= 4.5) return 'text-green-600'
    if (nota >= 3.5) return 'text-blue-600'
    if (nota >= 2.5) return 'text-yellow-600'
    if (nota >= 1.5) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressColor = (nota: number) => {
    if (nota >= 4.5) return 'bg-green-500'
    if (nota >= 3.5) return 'bg-blue-500'
    if (nota >= 2.5) return 'bg-yellow-500'
    if (nota >= 1.5) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const formatDate = (date: string) => {
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  if (loading || !avaliacao) {
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
              <h1 className="text-3xl font-bold">
                Avaliação #{avaliacao.id}
              </h1>
              <Badge className="bg-primary/10 text-primary">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {avaliacao.notaFinal.toFixed(2)}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {avaliacao.centroCustoNome} • {formatDate(avaliacao.data)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </Button>

          <Button variant="outline">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nota Final</p>
                <p className={`text-3xl font-bold ${getNotaColor(avaliacao.notaFinal)}`}>
                  {avaliacao.notaFinal.toFixed(2)}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avaliador</p>
                <p className="text-lg font-semibold">{avaliacao.avaliador}</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="text-lg font-semibold">
                  {format(new Date(avaliacao.data), "dd/MM/yyyy")}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Avaliação por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Avaliação por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Preço e Condições (20%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(avaliacao.categorias.precoCondicoes)}`}>
                    {avaliacao.categorias.precoCondicoes.toFixed(1)}
                  </span>
                </div>
                <Progress 
                  value={avaliacao.categorias.precoCondicoes * 20} 
                  className="h-2"
                  indicatorClassName={getProgressColor(avaliacao.categorias.precoCondicoes)}
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Qualidade do Serviço (25%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(avaliacao.categorias.qualidadeServico)}`}>
                    {avaliacao.categorias.qualidadeServico.toFixed(1)}
                  </span>
                </div>
                <Progress 
                  value={avaliacao.categorias.qualidadeServico * 20} 
                  className="h-2"
                  indicatorClassName={getProgressColor(avaliacao.categorias.qualidadeServico)}
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Qualidade de Entrega (15%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(avaliacao.categorias.qualidadeEntrega)}`}>
                    {avaliacao.categorias.qualidadeEntrega.toFixed(1)}
                  </span>
                </div>
                <Progress 
                  value={avaliacao.categorias.qualidadeEntrega * 20} 
                  className="h-2"
                  indicatorClassName={getProgressColor(avaliacao.categorias.qualidadeEntrega)}
                />
              </div>
            </div>

            <div>
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Segurança e Saúde (25%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(avaliacao.categorias.segurancaSaude)}`}>
                    {avaliacao.categorias.segurancaSaude.toFixed(1)}
                  </span>
                </div>
                <Progress 
                  value={avaliacao.categorias.segurancaSaude * 20} 
                  className="h-2"
                  indicatorClassName={getProgressColor(avaliacao.categorias.segurancaSaude)}
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Estoque (10%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(avaliacao.categorias.estoque)}`}>
                    {avaliacao.categorias.estoque.toFixed(1)}
                  </span>
                </div>
                <Progress 
                  value={avaliacao.categorias.estoque * 20} 
                  className="h-2"
                  indicatorClassName={getProgressColor(avaliacao.categorias.estoque)}
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Administração (5%)</span>
                  <span className={`text-sm font-bold ${getNotaColor(avaliacao.categorias.administracao)}`}>
                    {avaliacao.categorias.administracao.toFixed(1)}
                  </span>
                </div>
                <Progress 
                  value={avaliacao.categorias.administracao * 20} 
                  className="h-2"
                  indicatorClassName={getProgressColor(avaliacao.categorias.administracao)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ocorrências e Observações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {avaliacao.ocorrencias && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                Ocorrências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{avaliacao.ocorrencias}</p>
            </CardContent>
          </Card>
        )}

        {avaliacao.observacoes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{avaliacao.observacoes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Metadados */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">ID da Avaliação</p>
              <p className="font-medium">#{avaliacao.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ID do Centro de Custo</p>
              <p className="font-medium">#{avaliacao.centroCustoId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Criado em</p>
              <p className="font-medium">{formatDate(avaliacao.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Última atualização</p>
              <p className="font-medium">{formatDate(avaliacao.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta avaliação?
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