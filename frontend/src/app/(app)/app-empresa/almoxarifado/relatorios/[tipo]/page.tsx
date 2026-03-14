'use client'

import { useState, useEffect, useRef } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  Download,
  Printer,
  Package,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Calendar,
  RefreshCw
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface RelatorioData {
  empresa: {
    nome: string
    cnpj: string
  }
  data: string
  tipo: string
  stats: any
  itens: any[]
  resumo: any
}

export default function RelatorioTipoPage() {
  const params = useParams()
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('30')
  const [refreshing, setRefreshing] = useState(false)

  const tipo = params.tipo as string

  useEffect(() => {
    carregarRelatorio()
  }, [tipo, periodo])

  const carregarRelatorio = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/almoxarifado/relatorios/${tipo}`, {
        params: { periodo }
      })
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar relatório',
        description: 'Não foi possível carregar o relatório.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await carregarRelatorio()
    setRefreshing(false)
  }

  const handleDownload = async (formato: string) => {
    try {
      const response = await api.get(`/almoxarifado/relatorios/${tipo}`, {
        params: { periodo, formato },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-${tipo}.${formato}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast({
        title: 'Erro ao baixar',
        description: 'Não foi possível baixar o relatório.',
        variant: 'destructive'
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getTipoIcon = () => {
    switch (tipo) {
      case 'estoque':
        return <Package className="h-8 w-8 text-primary" />
      case 'movimentacoes':
        return <TrendingUp className="h-8 w-8 text-primary" />
      case 'custos':
        return <DollarSign className="h-8 w-8 text-primary" />
      case 'estoque-minimo':
        return <AlertCircle className="h-8 w-8 text-primary" />
      default:
        return <FileText className="h-8 w-8 text-primary" />
    }
  }

  const getTipoLabel = () => {
    switch (tipo) {
      case 'estoque':
        return 'Relatório de Estoque'
      case 'movimentacoes':
        return 'Relatório de Movimentações'
      case 'custos':
        return 'Relatório de Custos'
      case 'estoque-minimo':
        return 'Relatório de Estoque Mínimo'
      default:
        return 'Relatório Completo'
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

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background print:overflow-visible">
        <Header title={getTipoLabel()} />
        
        <Container size="xl" className="py-8 print:py-4">
          {/* Breadcrumb e ações (esconder na impressão) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 no-print">
            <Link
              href="/app-empresa/almoxarifado/relatorios"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Relatórios
            </Link>

            <div className="flex gap-2">
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="15">15 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                  <SelectItem value="90">90 dias</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>

              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>

              <Button variant="outline" onClick={() => handleDownload('pdf')}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          {/* Relatório */}
          <Card ref={printRef}>
            <CardHeader>
              <CardTitle className="text-center">
                <div className="flex justify-center mb-4">
                  {getTipoIcon()}
                </div>
                <span className="text-2xl">{getTipoLabel()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Cabeçalho */}
              <div className="text-center border-b pb-4">
                <p className="text-lg font-bold">{data?.empresa.nome}</p>
                <p className="text-sm text-muted-foreground">CNPJ: {data?.empresa.cnpj}</p>
                <p className="text-sm text-muted-foreground">
                  Data de emissão: {formatDate(data?.data || '', 'dd/MM/yyyy')}
                </p>
              </div>

              {/* Conteúdo do relatório (simplificado) */}
              <div className="text-center py-12 text-muted-foreground">
                <p>Visualização detalhada do relatório será implementada aqui.</p>
                <p className="text-sm mt-2">Use os botões de exportação para gerar o arquivo completo.</p>
              </div>

              {/* Rodapé */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>Documento gerado pelo sistema IHO - Índice de Saúde Operacional</p>
              </div>
            </CardContent>
          </Card>
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
        }
      `}</style>
    </>
  )
}