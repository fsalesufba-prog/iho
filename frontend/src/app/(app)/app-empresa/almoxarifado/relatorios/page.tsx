'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Package,
  TrendingUp,
  DollarSign,
  AlertCircle,
  ChevronRight
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { api } from '@/lib/api'

interface RelatorioConfig {
  tipo: string
  periodo: string
  formato: string
  categoria?: string
}

export default function RelatoriosPage() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<RelatorioConfig>({
    tipo: 'completo',
    periodo: '30',
    formato: 'pdf'
  })

  const tiposRelatorio = [
    { value: 'completo', label: 'Relatório Completo', icon: FileText },
    { value: 'estoque', label: 'Relatório de Estoque', icon: Package },
    { value: 'movimentacoes', label: 'Relatório de Movimentações', icon: TrendingUp },
    { value: 'custos', label: 'Relatório de Custos', icon: DollarSign },
    { value: 'estoque-minimo', label: 'Relatório de Estoque Mínimo', icon: AlertCircle }
  ]

  const handleGerarRelatorio = async () => {
    try {
      setLoading(true)
      
      const response = await api.get(`/almoxarifado/relatorios/${config.tipo}`, {
        params: {
          periodo: config.periodo,
          formato: config.formato,
          categoria: config.categoria
        },
        responseType: config.formato === 'json' ? 'json' : 'blob'
      })

      if (config.formato === 'json') {
        // Abrir em nova aba para visualização
        const jsonString = JSON.stringify(response.data, null, 2)
        const blob = new Blob([jsonString], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      } else {
        // Download do arquivo
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `relatorio-${config.tipo}.${config.formato}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
      }

      toast({
        title: 'Relatório gerado',
        description: 'O relatório foi gerado com sucesso.'
      })
    } catch (error) {
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Não foi possível gerar o relatório.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto bg-background">
        <Header title="Relatórios" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/almoxarifado"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Almoxarifado
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Relatórios
            </h1>
            <p className="text-muted-foreground mt-1">
              Gere relatórios personalizados do almoxarifado
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Tipos de Relatório */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold mb-4">Tipos de Relatório</h2>
              {tiposRelatorio.map((tipo) => {
                const Icon = tipo.icon
                return (
                  <motion.div
                    key={tipo.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        config.tipo === tipo.value ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setConfig({ ...config, tipo: tipo.value })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-primary" />
                            <span className="font-medium">{tipo.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>

            {/* Configurações do Relatório */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Configurar Relatório</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Período */}
                  <div className="space-y-2">
                    <Label htmlFor="periodo">Período</Label>
                    <Select
                      value={config.periodo}
                      onValueChange={(value) => setConfig({ ...config, periodo: value })}
                    >
                      <SelectTrigger id="periodo">
                        <Calendar className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">Últimos 7 dias</SelectItem>
                        <SelectItem value="15">Últimos 15 dias</SelectItem>
                        <SelectItem value="30">Últimos 30 dias</SelectItem>
                        <SelectItem value="90">Últimos 90 dias</SelectItem>
                        <SelectItem value="180">Últimos 180 dias</SelectItem>
                        <SelectItem value="365">Último ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Formato */}
                  <div className="space-y-2">
                    <Label htmlFor="formato">Formato de Exportação</Label>
                    <Select
                      value={config.formato}
                      onValueChange={(value) => setConfig({ ...config, formato: value })}
                    >
                      <SelectTrigger id="formato">
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Categoria (opcional) */}
                  {config.tipo === 'movimentacoes' && (
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria (opcional)</Label>
                      <Input
                        id="categoria"
                        placeholder="Filtrar por categoria"
                        value={config.categoria || ''}
                        onChange={(e) => setConfig({ ...config, categoria: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Informações do Relatório */}
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h3 className="font-medium mb-2">Sobre este relatório</h3>
                    <p className="text-sm text-muted-foreground">
                      {config.tipo === 'completo' && 'Relatório completo com todas as informações do almoxarifado, incluindo estoque atual, movimentações e análises.'}
                      {config.tipo === 'estoque' && 'Lista completa de todos os itens em estoque com suas quantidades, valores e alertas.'}
                      {config.tipo === 'movimentacoes' && 'Histórico detalhado de todas as movimentações do período selecionado.'}
                      {config.tipo === 'custos' && 'Análise detalhada dos custos de aquisição por item e categoria.'}
                      {config.tipo === 'estoque-minimo' && 'Relatório focado em itens com estoque baixo ou esgotado, com recomendações de compra.'}
                    </p>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleGerarRelatorio}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent mr-2" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Gerar Relatório
                        </>
                      )}
                    </Button>

                    <Link href={`/app-empresa/almoxarifado/relatorios/${config.tipo}`}>
                      <Button variant="outline">
                        Visualizar
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </main>
    </>
  )
}