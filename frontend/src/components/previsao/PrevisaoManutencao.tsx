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
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { PrevisaoChart } from './PrevisaoChart'

import { Wrench, AlertTriangle, Calendar, Download } from 'lucide-react'

interface PrevisaoManutencaoProps {
  dados: Array<{ periodo: string; valor: number; previsto: number }>
  horizonte: string
}

export function PrevisaoManutencao({ dados, horizonte }: PrevisaoManutencaoProps) {
  const [tipo, setTipo] = useState('todas')

  // Dados mockados para equipamentos com manutenção prevista
  const equipamentosPrevistos = [
    {
      id: 1,
      nome: 'Escavadeira CAT 320D',
      tag: 'ESC-001',
      horasAtuais: 4850,
      horasLimite: 5000,
      diasRestantes: 15,
      tipo: 'preventiva',
      prioridade: 'alta'
    },
    {
      id: 2,
      nome: 'Caminhão Mercedes 1718',
      tag: 'CAM-023',
      horasAtuais: 7200,
      horasLimite: 7500,
      diasRestantes: 25,
      tipo: 'preventiva',
      prioridade: 'media'
    },
    {
      id: 3,
      nome: 'Trator Massey Ferguson',
      tag: 'TRA-045',
      horasAtuais: 3800,
      horasLimite: 4000,
      diasRestantes: 10,
      tipo: 'preventiva',
      prioridade: 'alta'
    },
    {
      id: 4,
      nome: 'Pá Carregadeira Volvo',
      tag: 'PAC-012',
      horasAtuais: 6200,
      horasLimite: 6000,
      diasRestantes: -5,
      tipo: 'corretiva',
      prioridade: 'critica'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Tipo de manutenção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="preventiva">Preventiva</SelectItem>
                <SelectItem value="corretiva">Corretiva</SelectItem>
                <SelectItem value="preditiva">Preditiva</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Previsão */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Manutenções Previstas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Nos próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Horas Estimadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156h</div>
            <p className="text-xs text-muted-foreground">Paradas programadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Custo Estimado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.800</div>
            <p className="text-xs text-muted-foreground">Peças e serviços</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Previsão */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Manutenções</CardTitle>
          <CardDescription>
            Projeção de manutenções preventivas e corretivas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <PrevisaoChart 
              dados={dados}
              tipo="linha"
              titulo="Previsão de Manutenções"
              unidade="quantidade"
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipamentos com Manutenção Prevista */}
      <Card>
        <CardHeader>
          <CardTitle>Equipamentos com Manutenção Prevista</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {equipamentosPrevistos.map((equip) => (
              <div key={equip.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{equip.nome}</span>
                    <Badge variant="outline">{equip.tag}</Badge>
                    <Badge className={
                      equip.prioridade === 'critica' ? 'bg-red-100 text-red-800' :
                      equip.prioridade === 'alta' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {equip.prioridade}
                    </Badge>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Horas atuais</p>
                      <p className="text-sm font-medium">{equip.horasAtuais}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Limite</p>
                      <p className="text-sm font-medium">{equip.horasLimite}h</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Previsão</p>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {equip.diasRestantes > 0 ? `${equip.diasRestantes} dias` : 'Atrasado'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Progress 
                      value={(equip.horasAtuais / equip.horasLimite) * 100} 
                      className="h-2"
                      indicatorClassName={
                        (equip.horasAtuais / equip.horasLimite) > 0.9 ? 'bg-red-500' :
                        (equip.horasAtuais / equip.horasLimite) > 0.7 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }
                    />
                  </div>
                </div>

                {equip.diasRestantes < 0 && (
                  <AlertTriangle className="h-5 w-5 text-red-600 ml-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}