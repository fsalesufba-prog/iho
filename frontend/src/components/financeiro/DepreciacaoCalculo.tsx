'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Download, FileText } from 'lucide-react'

interface DepreciacaoCalculoProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  depreciacao: any
}

export function DepreciacaoCalculo({ open, onOpenChange, depreciacao }: DepreciacaoCalculoProps) {
  const [ano, setAno] = useState(new Date().getFullYear())

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Simular cálculo anual
  const calcularDepreciacaoAnual = () => {
    const anos = []
    let valorContabil = depreciacao.valorAquisicao
    const depreciacaoAnual = (depreciacao.valorAquisicao - depreciacao.valorResidual) / depreciacao.vidaUtilAnos

    for (let i = 1; i <= depreciacao.vidaUtilAnos; i++) {
      const anoAtual = new Date(depreciacao.dataAquisicao).getFullYear() + i - 1
      anos.push({
        ano: anoAtual,
        valorInicio: valorContabil,
        depreciacao: depreciacaoAnual,
        valorFinal: valorContabil - depreciacaoAnual,
        depreciado: (valorContabil - (valorContabil - depreciacaoAnual)) / depreciacao.valorAquisicao * 100
      })
      valorContabil -= depreciacaoAnual
    }

    return anos
  }

  const anosDepreciacao = calcularDepreciacaoAnual()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cálculo de Depreciação</DialogTitle>
          <DialogDescription>
            {depreciacao.equipamentoNome} - {depreciacao.equipamentoTag}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="detalhado">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
          </TabsList>

          <TabsContent value="detalhado" className="mt-4">
            <div className="space-y-4">
              {/* Informações do Equipamento */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Valor de Aquisição</p>
                    <p className="text-xl font-bold">{formatCurrency(depreciacao.valorAquisicao)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Valor Residual</p>
                    <p className="text-xl font-bold">{formatCurrency(depreciacao.valorResidual)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Valor Depreciável</p>
                    <p className="text-xl font-bold">{formatCurrency(depreciacao.valorAquisicao - depreciacao.valorResidual)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Vida Útil</p>
                    <p className="text-xl font-bold">{depreciacao.vidaUtilAnos} anos</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabela de Depreciação Anual */}
              <Card>
                <CardContent className="pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ano</TableHead>
                        <TableHead>Valor Início</TableHead>
                        <TableHead>Depreciação</TableHead>
                        <TableHead>Valor Final</TableHead>
                        <TableHead>% Depreciado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {anosDepreciacao.map((item) => (
                        <TableRow key={item.ano}>
                          <TableCell className="font-medium">{item.ano}</TableCell>
                          <TableCell>{formatCurrency(item.valorInicio)}</TableCell>
                          <TableCell>{formatCurrency(item.depreciacao)}</TableCell>
                          <TableCell>{formatCurrency(item.valorFinal)}</TableCell>
                          <TableCell>{item.depreciado.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Botões de Ação */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                                    Relatório
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="resumo" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Situação Atual</p>
                    <p className="text-xl font-bold">{depreciacao.percentualDepreciado.toFixed(1)}% depreciado</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {depreciacao.mesesDecorridos} meses de {depreciacao.vidaUtilMeses} meses
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Previsão de Término</p>
                    <p className="text-xl font-bold">
                      {new Date(new Date(depreciacao.dataAquisicao).setFullYear(
                        new Date(depreciacao.dataAquisicao).getFullYear() + depreciacao.vidaUtilAnos
                      )).toLocaleDateString('pt-BR')}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Depreciação Mensal</p>
                    <p className="text-xl font-bold">
                      {formatCurrency((depreciacao.valorAquisicao - depreciacao.valorResidual) / depreciacao.vidaUtilMeses)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground">Depreciação Anual</p>
                    <p className="text-xl font-bold">
                      {formatCurrency((depreciacao.valorAquisicao - depreciacao.valorResidual) / depreciacao.vidaUtilAnos)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Método de Depreciação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    <span className="font-medium">Método:</span>{' '}
                    {depreciacao.metodo === 'linear' ? 'Linear' : 
                     depreciacao.metodo === 'saldos_decrescentes' ? 'Saldos Decrescentes' : 
                     'Soma dos Dígitos'}
                  </p>
                  <p className="text-sm mt-2">
                    <span className="font-medium">Taxa Anual:</span> {depreciacao.taxaAnual}%
                  </p>
                  <p className="text-sm mt-4 text-muted-foreground">
                    {depreciacao.metodo === 'linear' && 
                      'A depreciação linear distribui o valor depreciável uniformemente ao longo da vida útil.'}
                    {depreciacao.metodo === 'saldos_decrescentes' &&
                      'O método de saldos decrescentes acelera a depreciação nos primeiros anos.'}
                    {depreciacao.metodo === 'soma_digitos' &&
                      'O método da soma dos dígitos também acelera a depreciação, mas de forma diferente.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="grafico" className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <div className="h-80 flex items-center justify-center bg-muted rounded">
                  <p className="text-muted-foreground">Gráfico de Depreciação</p>
                  {/* Aqui será implementado o gráfico de linha mostrando a evolução da depreciação */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}