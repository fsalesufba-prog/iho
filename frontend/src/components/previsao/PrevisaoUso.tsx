'use client'

import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { PrevisaoChart } from './PrevisaoChart'
import { PrevisaoTabela } from './PrevisaoTabela'
import { PrevisaoMetricas } from './PrevisaoMetricas'
import { Download, Eye, TrendingUp } from 'lucide-react'

interface PrevisaoUsoProps {
  dados: Array<{ periodo: string; valor: number; previsto: number }>
  horizonte: string
}

export function PrevisaoUso({ dados, horizonte }: PrevisaoUsoProps) {
  const [equipamento, setEquipamento] = useState('todos')
  const [tipo, setTipo] = useState('todos')
  const [visualizacao, setVisualizacao] = useState<'grafico' | 'tabela'>('grafico')

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={equipamento} onValueChange={setEquipamento}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os equipamentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os equipamentos</SelectItem>
                <SelectItem value="caminhao">Caminhões</SelectItem>
                <SelectItem value="escavadeira">Escavadeiras</SelectItem>
                <SelectItem value="trator">Tratores</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="horas">Horas trabalhadas</SelectItem>
                <SelectItem value="combustivel">Consumo combustível</SelectItem>
                <SelectItem value="produtividade">Produtividade</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <Button
                variant={visualizacao === 'grafico' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizacao('grafico')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Gráfico
              </Button>
              <Button
                variant={visualizacao === 'tabela' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVisualizacao('tabela')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Tabela
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <PrevisaoMetricas 
        tipo="uso"
        horizonte={horizonte}
      />

      {/* Visualização Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Previsão de Uso</CardTitle>
              <CardDescription>
                Projeção baseada em dados históricos e tendências
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {visualizacao === 'grafico' ? (
            <div className="h-96">
              <PrevisaoChart 
                dados={dados}
                tipo="linha"
                titulo="Previsão de Uso"
                unidade="horas"
              />
            </div>
          ) : (
            <PrevisaoTabela dados={dados} />
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-bold">Tendência:</span> Aumento de 15% no uso de equipamentos nos próximos 3 meses.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-bold">Oportunidade:</span> Pico de uso previsto para março - planejar manutenções preventivas em fevereiro.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                <span className="font-bold">Alerta:</span> 3 equipamentos com previsão de atingir limite de horas nos próximos 30 dias.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}