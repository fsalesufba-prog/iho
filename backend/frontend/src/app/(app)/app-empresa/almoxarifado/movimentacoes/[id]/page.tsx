'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  Package,
  User,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Movimentacao {
  id: number
  tipo: 'entrada' | 'saida' | 'ajuste'
  quantidade: number
  valorUnitario?: number
  valorTotal?: number
  data: string
  observacao?: string
  estoque: {
    id: number
    nome: string
    codigo: string
    categoria: string
    unidade: string
  }
  equipamento?: {
    id: number
    tag: string
    nome: string
  }
  usuario: {
    id: number
    nome: string
  }
  createdAt: string
}

export default function DetalheMovimentacaoPage() {
  const params = useParams()
  const { toast } = useToast()

  const [movimentacao, setMovimentacao] = useState<Movimentacao | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarMovimentacao()
  }, [params.id])

  const carregarMovimentacao = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/almoxarifado/movimentacoes/${params.id}`)
      setMovimentacao(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar movimentação',
        description: 'Não foi possível carregar os dados da movimentação.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getTipoBadge = (tipo: string) => {
    const variants = {
      entrada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      saida: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      ajuste: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    }
    return variants[tipo as keyof typeof variants] || ''
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'saida':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Carregando..." />
          <Container size="xl" className="py-8">
            <div className="space-y-6">
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-64 bg-muted rounded-lg animate-pulse" />
            </div>
          </Container>
        </main>
      </>
    )
  }

  if (!movimentacao) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Movimentação não encontrada" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Movimentação não encontrada</h2>
              <p className="text-muted-foreground mb-6">
                A movimentação que você está procurando não existe.
              </p>
              <Link href="/app-empresa/almoxarifado/movimentacoes">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para movimentações
                </Button>
              </Link>
            </div>
          </Container>
        </main>
      </>
    )
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title={`Movimentação #${movimentacao.id}`} />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/almoxarifado/movimentacoes"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para movimentações
            </Link>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {getTipoIcon(movimentacao.tipo)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">
                          {movimentacao.tipo === 'entrada' ? 'Entrada' :
                           movimentacao.tipo === 'saida' ? 'Saída' : 'Ajuste'}
                        </h1>
                        <Badge className={getTipoBadge(movimentacao.tipo)}>
                          {movimentacao.tipo.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">
                        ID: #{movimentacao.id} • {formatDateTime(movimentacao.data)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Quantidade</p>
                    <p className={`text-3xl font-bold ${
                      movimentacao.tipo === 'entrada' ? 'text-green-600' :
                      movimentacao.tipo === 'saida' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {movimentacao.tipo === 'entrada' ? '+' : movimentacao.tipo === 'saida' ? '-' : '±'}
                      {movimentacao.quantidade} {movimentacao.estoque.unidade}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detalhes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações do Item */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{movimentacao.estoque.nome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-mono">{movimentacao.estoque.codigo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoria</p>
                  <p>{movimentacao.estoque.categoria}</p>
                </div>
              </CardContent>
            </Card>

            {/* Informações da Movimentação */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Detalhes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p>{formatDateTime(movimentacao.data)}</p>
                </div>
                
                {movimentacao.valorUnitario && (
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Unitário</p>
                    <p className="font-medium">{formatCurrency(movimentacao.valorUnitario)}</p>
                  </div>
                )}

                {movimentacao.valorTotal && (
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="font-bold text-primary">{formatCurrency(movimentacao.valorTotal)}</p>
                  </div>
                )}

                {movimentacao.equipamento && (
                  <div>
                    <p className="text-sm text-muted-foreground">Equipamento</p>
                    <Link 
                      href={`/app-empresa/equipamentos/${movimentacao.equipamento.id}`}
                      className="text-primary hover:underline"
                    >
                      {movimentacao.equipamento.tag} - {movimentacao.equipamento.nome}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observação */}
            {movimentacao.observacao && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Observação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{movimentacao.observacao}</p>
                </CardContent>
              </Card>
            )}

            {/* Registro */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Registro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{movimentacao.usuario.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      Registrado em {formatDateTime(movimentacao.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </main>
    </>
  )
}