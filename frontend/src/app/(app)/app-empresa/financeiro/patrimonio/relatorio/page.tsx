'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Download,
  RefreshCw,
  Printer,
  FileText,
  Truck,
  Package,
  Calendar
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'

interface RelatorioData {
  empresa: {
    nome: string
    cnpj: string
  }
  data: string
  resumo: {
    totalEquipamentos: number
    valorTotal: number
    depreciacaoTotal: number
    valorLiquido: number
  }
  porStatus: Record<string, {
    quantidade: number
    valor: number
  }>
  porObra: Record<string, {
    quantidade: number
    valor: number
  }>
  equipamentos: Array<{
    tag: string
    nome: string
    valorAquisicao: number
    valorAtual: number
    obra?: string
    status: string
  }>
}

export default function RelatorioPatrimonioPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const printRef = useRef<HTMLDivElement>(null)

  const [data, setData] = useState<RelatorioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formato, setFormato] = useState('pdf')

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)
      const response = await api.get('/financeiro/patrimonio/relatorio')
      setData(response.data.data)
    } catch (error) {
      toast({
        title: 'Erro ao carregar relatório',
        description: 'Não foi possível carregar o relatório de patrimônio.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await api.get('/financeiro/patrimonio/relatorio', {
        params: { formato },
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-patrimonio.${formato}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      toast({
        title: 'Erro ao exportar',
        description: 'Não foi possível exportar o relatório.',
        variant: 'destructive'
      })
    }
  }

  const handlePrint = () => {
    const printContent = printRef.current
    const originalTitle = document.title

    if (printContent) {
      document.title = `Relatório Patrimônio - ${data?.empresa.nome}`
      
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Relatório Patrimônio</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
                .resumo { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
                .card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
                .valor { font-size: 1.5em; font-weight: bold; color: #2563eb; }
              </style>
            </head>
            <body>
              ${printContent.outerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
      }

      document.title = originalTitle
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <Header title="Relatório de Patrimônio" />
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
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Relatório de Patrimônio" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/financeiro/patrimonio"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Patrimônio
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Relatório de Patrimônio
              </h1>
              <p className="text-muted-foreground mt-1">
                {data?.empresa.nome} - {formatDate(data?.data || '', 'dd/MM/yyyy')}
              </p>
            </div>

            <div className="flex gap-2">
              <Select value={formato} onValueChange={setFormato}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>

              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {/* Relatório */}
          <Card ref={printRef}>
            <CardHeader>
              <CardTitle className="text-center">
                <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                <span className="text-2xl">Relatório de Patrimônio</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Cabeçalho */}
              <div className="text-center border-b pb-4">
                <p className="text-lg font-bold">{data?.empresa.nome}</p>
                <p className="text-sm text-muted-foreground">CNPJ: {data?.empresa.cnpj}</p>
                <p className="text-sm text-muted-foreground">Data: {formatDate(data?.data || '', 'dd/MM/yyyy')}</p>
              </div>

              {/* Resumo */}
              <div>
                <h3 className="text-lg font-bold mb-4">Resumo Geral</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total de Equipamentos</p>
                    <p className="text-2xl font-bold">{data?.resumo.totalEquipamentos}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor de Aquisição</p>
                    <p className="text-2xl font-bold">{formatCurrency(data?.resumo.valorTotal || 0)}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Valor Líquido</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(data?.resumo.valorLiquido || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Por Status */}
              <div>
                <h3 className="text-lg font-bold mb-4">Distribuição por Status</h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-right">Quantidade</th>
                      <th className="p-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.porStatus && Object.entries(data.porStatus).map(([status, item]) => (
                      <tr key={status} className="border-b">
                        <td className="p-2">{status}</td>
                        <td className="p-2 text-right">{item.quantidade}</td>
                        <td className="p-2 text-right">{formatCurrency(item.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Por Obra */}
              <div>
                <h3 className="text-lg font-bold mb-4">Distribuição por Obra</h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left">Obra</th>
                      <th className="p-2 text-right">Quantidade</th>
                      <th className="p-2 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.porObra && Object.entries(data.porObra).map(([obra, item]) => (
                      <tr key={obra} className="border-b">
                        <td className="p-2">{obra}</td>
                        <td className="p-2 text-right">{item.quantidade}</td>
                        <td className="p-2 text-right">{formatCurrency(item.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Lista de Equipamentos */}
              <div>
                <h3 className="text-lg font-bold mb-4">Detalhamento por Equipamento</h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-2 text-left">Tag</th>
                      <th className="p-2 text-left">Nome</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Obra</th>
                      <th className="p-2 text-right">Aquisição</th>
                      <th className="p-2 text-right">Valor Atual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.equipamentos.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-mono">{item.tag}</td>
                        <td className="p-2">{item.nome}</td>
                        <td className="p-2">{item.status}</td>
                        <td className="p-2">{item.obra || '-'}</td>
                        <td className="p-2 text-right">{formatCurrency(item.valorAquisicao)}</td>
                        <td className="p-2 text-right font-bold text-green-600">
                          {formatCurrency(item.valorAtual)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rodapé */}
              <div className="text-center text-sm text-muted-foreground pt-4 border-t">
                <p>Documento gerado em {formatDate(new Date().toISOString(), 'dd/MM/yyyy HH:mm')}</p>
                <p>Sistema IHO - Índice de Saúde Operacional</p>
              </div>
            </CardContent>
          </Card>
        </Container>
      </main>
    </>
  )
}