'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileSpreadsheet,
  Printer,
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/use-toast'
<<<<<<< HEAD
import { useAuth } from '@/hooks/useAuth'
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
import { api } from '@/lib/api'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'

interface Medicao {
  id: number
  titulo: string
  obra: {
    id: number
    nome: string
    codigo: string
    endereco?: string
    cliente?: {
      nome: string
      documento?: string
    }
  }
  periodoInicio: string
  periodoFim: string
  valorTotal: number
  horasTotal: number
  status: 'rascunho' | 'emitida' | 'aprovada' | 'cancelada'
  observacoes?: string
  observacoesAprovacao?: string
  motivoCancelamento?: string
  dataEmissao?: string
  dataAprovacao?: string
  createdBy: {
    id: number
    nome: string
  }
  aprovadoPor?: {
    id: number
    nome: string
  }
  equipamentos: Array<{
    id: number
    equipamento: {
      id: number
      tag: string
      nome: string
      tipo: string
    }
    horasTrabalhadas: number
    valorUnitario: number
    valorTotal: number
  }>
  modelo?: {
    id: number
    nome: string
  }
  createdAt: string
  updatedAt: string
}

export default function DetalheHistoricoMedicaoPage() {
  const params = useParams()
<<<<<<< HEAD
  const { user } = useAuth()
=======
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  const { toast } = useToast()

  const [medicao, setMedicao] = useState<Medicao | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarMedicao()
  }, [params.id])

  const carregarMedicao = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/medicao/${params.id}`)
      setMedicao(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar medição',
        description: 'Não foi possível carregar os dados da medição.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (formato: 'pdf' | 'excel') => {
    if (!medicao) return

    try {
      const response = await api.get(`/medicao/${medicao.id}/download`, {
        params: { formato },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `medicao-${medicao.id}.${formato === 'pdf' ? 'pdf' : 'xlsx'}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast({
        title: 'Erro ao baixar',
        description: 'Não foi possível baixar o arquivo.',
        variant: 'destructive'
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      rascunho: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
      emitida: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      aprovada: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      cancelada: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return variants[status as keyof typeof variants] || ''
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'cancelada':
        return <XCircle className="h-5 w-5 text-red-600" />
      case 'emitida':
        return <FileText className="h-5 w-5 text-blue-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
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

  if (!medicao) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Medição não encontrada" />
          <Container size="xl" className="py-8">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Medição não encontrada</h2>
              <p className="text-muted-foreground mb-6">
                A medição que você está procurando não existe ou foi removida.
              </p>
              <Link href="/app-empresa/medicao/historico">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para histórico
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
      
      <main className="flex-1 overflow-y-auto bg-background print:overflow-visible">
        <Header title={`Medição #${medicao.id}`} />
        
        <Container size="xl" className="py-8 print:py-4">
          {/* Breadcrumb e ações (esconder na impressão) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print">
            <Link
              href="/app-empresa/medicao/historico"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para histórico
            </Link>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>

              <Button variant="outline" onClick={() => handleDownload('pdf')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>

              <Button variant="outline" onClick={() => handleDownload('excel')}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Excel
              </Button>
            </div>
          </div>

          {/* Conteúdo da Medição */}
          <div className="space-y-6 print:space-y-4">
            {/* Cabeçalho */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{medicao.titulo}</h1>
                    <p className="text-sm text-muted-foreground">
                      ID: #{medicao.id} • Criado em {formatDate(medicao.createdAt, 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusIcon(medicao.status)}
                    <Badge className={getStatusBadge(medicao.status)}>
                      {medicao.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações da Obra */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Informações da Obra
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{medicao.obra.nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Código</p>
                    <p className="font-mono">{medicao.obra.codigo}</p>
                  </div>
                  {medicao.obra.endereco && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <p>{medicao.obra.endereco}</p>
                    </div>
                  )}
                  {medicao.obra.cliente && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p>{medicao.obra.cliente.nome}</p>
                      </div>
                      {medicao.obra.cliente.documento && (
                        <div>
                          <p className="text-sm text-muted-foreground">Documento</p>
                          <p>{medicao.obra.cliente.documento}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Período e Valores */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary/30" />
                    <div>
                      <p className="text-sm text-muted-foreground">Período</p>
                      <p className="font-medium">
                        {formatDate(medicao.periodoInicio, 'dd/MM/yyyy')} - {formatDate(medicao.periodoFim, 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-8 w-8 text-primary/30" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Horas</p>
                      <p className="text-2xl font-bold">{medicao.horasTotal} h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-primary/30" />
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(medicao.valorTotal)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Equipamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Equipamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicao.equipamentos.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-mono text-sm text-muted-foreground">
                            {item.equipamento.tag}
                          </span>
                          <h4 className="font-medium">{item.equipamento.nome}</h4>
                          <p className="text-xs text-muted-foreground">
                            {item.equipamento.tipo}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">
                            {item.horasTrabalhadas} h x R$ {item.valorUnitario.toFixed(2)}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            {formatCurrency(item.valorTotal)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Observações e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {medicao.observacoes && (
                <Card>
                  <CardHeader>
                    <CardTitle>Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{medicao.observacoes}</p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Criado por</p>
                    <p>{medicao.createdBy.nome}</p>
                  </div>
                  
                  {medicao.dataEmissao && (
                    <div>
                      <p className="text-sm text-muted-foreground">Emitido em</p>
                      <p>{formatDateTime(medicao.dataEmissao)}</p>
                    </div>
                  )}

                  {medicao.aprovadoPor && medicao.dataAprovacao && (
                    <div>
                      <p className="text-sm text-muted-foreground">Aprovado por</p>
                      <p>{medicao.aprovadoPor.nome} em {formatDateTime(medicao.dataAprovacao)}</p>
                    </div>
                  )}

                  {medicao.observacoesAprovacao && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observações da aprovação</p>
                      <p className="text-sm">{medicao.observacoesAprovacao}</p>
                    </div>
                  )}

                  {medicao.motivoCancelamento && (
                    <div>
                      <p className="text-sm text-muted-foreground">Motivo do cancelamento</p>
                      <p className="text-sm text-red-600">{medicao.motivoCancelamento}</p>
                    </div>
                  )}

                  {medicao.modelo && (
                    <div>
                      <p className="text-sm text-muted-foreground">Modelo utilizado</p>
                      <p>{medicao.modelo.nome}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          main {
            background: white;
          }
          .print\:overflow-visible {
            overflow: visible !important;
          }
          .print\:py-4 {
            padding-top: 1rem !important;
            padding-bottom: 1rem !important;
          }
          .print\:space-y-4 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 1rem !important;
          }
        }
      `}</style>
    </>
  )
}