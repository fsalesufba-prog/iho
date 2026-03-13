'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Wrench,
  Calendar,
  Download,
  ChevronRight,
  FileText
} from 'lucide-react'

import { Header } from '@/components/app/Header'
import { Sidebar } from '@/components/app/Sidebar'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

import { Label } from '@/components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'

export default function RelatoriosGerenciaisPage() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [periodo, setPeriodo] = useState('30')
  const [formato, setFormato] = useState('pdf')

  const tiposRelatorio = [
    {
      id: 'operacional',
      titulo: 'Relatório Operacional',
      descricao: 'Análise de horas trabalhadas, produtividade e desempenho',
      icon: TrendingUp,
      cor: 'bg-blue-100 dark:bg-blue-900/20',
      corIcon: 'text-blue-600',
      link: '/app-empresa/relatorios/gerenciais/operacional'
    },
    {
      id: 'financeiro',
      titulo: 'Relatório Financeiro',
      descricao: 'Custos, receitas, depreciação e indicadores financeiros',
      icon: DollarSign,
      cor: 'bg-green-100 dark:bg-green-900/20',
      corIcon: 'text-green-600',
      link: '/app-empresa/relatorios/gerenciais/financeiro'
    },
    {
      id: 'manutencao',
      titulo: 'Relatório de Manutenção',
      descricao: 'Manutenções realizadas, custos e indicadores de confiabilidade',
      icon: Wrench,
      cor: 'bg-yellow-100 dark:bg-yellow-900/20',
      corIcon: 'text-yellow-600',
      link: '/app-empresa/relatorios/gerenciais/manutencao'
    }
  ]

  const handleGerarRelatorio = async (tipo: string) => {
    try {
      setLoading(true)
      
      const response = await api.post('/relatorios/gerar', {
        tipo,
        formato,
        periodo
      }, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `relatorio-${tipo}.${formato}`)
      document.body.appendChild(link)
      link.click()
      link.remove()

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
        <Header title="Relatórios Gerenciais" />
        
        <Container size="xl" className="py-8">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2">
            <Link
              href="/app-empresa/relatorios"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Relatórios
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Relatórios Gerenciais
            </h1>
            <p className="text-muted-foreground mt-1">
              Selecione o tipo de relatório que deseja gerar
            </p>
          </div>

          {/* Configurações Globais */}
          <Card className="mb-8">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <Select value={periodo} onValueChange={setPeriodo}>
                    <SelectTrigger id="periodo" className="w-[180px]">
                      <Calendar className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Últimos 7 dias</SelectItem>
                      <SelectItem value="15">Últimos 15 dias</SelectItem>
                      <SelectItem value="30">Últimos 30 dias</SelectItem>
                      <SelectItem value="90">Últimos 90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="formato">Formato</Label>
                  <Select value={formato} onValueChange={setFormato}>
                    <SelectTrigger id="formato" className="w-[150px]">
                      <FileText className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Relatórios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiposRelatorio.map((tipo, index) => {
              const Icon = tipo.icon
              return (
                <motion.div
                  key={tipo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${tipo.cor}`}>
                          <Icon className={`h-6 w-6 ${tipo.corIcon}`} />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGerarRelatorio(tipo.id)}
                            disabled={loading}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Gerar
                          </Button>
                          <Link href={tipo.link}>
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{tipo.titulo}</h3>
                      <p className="text-sm text-muted-foreground">{tipo.descricao}</p>

                      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                        Período: {periodo} dias • Formato: {formato.toUpperCase()}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </Container>
      </main>
    </>
  )
}