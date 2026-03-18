'use client'

import React from 'react'
import {
  AlertTriangle,
  Fuel,
  Wrench,
  Package,
  X,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Separator } from '@/components/ui/Separator'
import { AlertaPriority } from './AlertaPriority'
import { AlertaStatus } from './AlertaStatus'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface AlertaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  alerta: {
    id: string
    tipo: 'combustivel' | 'manutencao' | 'estoque' | 'sistema'
    titulo: string
    descricao: string
    prioridade: 'baixa' | 'media' | 'alta' | 'critica'
    status: 'novo' | 'lido' | 'resolvido' | 'ignorado'
    data: string
    equipamentoId?: string
    equipamentoNome?: string
    obra?: string
    responsavel?: string
    valor?: number
    limite?: number
    recomendacoes?: string[]
    historico?: Array<{
      data: string
      acao: string
      usuario: string
    }>
  }
  onResolver?: () => void
  onIgnorar?: () => void
}

const icons = {
  combustivel: Fuel,
  manutencao: Wrench,
  estoque: Package,
  sistema: AlertTriangle
}

const titles = {
  combustivel: 'Alerta de Combustível',
  manutencao: 'Alerta de Manutenção',
  estoque: 'Alerta de Estoque',
  sistema: 'Alerta do Sistema'
}

export function AlertaModal({ 
  open, 
  onOpenChange, 
  alerta,
  onResolver,
  onIgnorar 
}: AlertaModalProps) {
  const Icon = icons[alerta.tipo]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            <span>{titles[alerta.tipo]}</span>
          </DialogTitle>
          <DialogDescription>
            Detalhes completos do alerta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cabeçalho do Alerta */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{alerta.titulo}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {alerta.descricao}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <AlertaPriority prioridade={alerta.prioridade} />
              <AlertaStatus status={alerta.status} />
            </div>
          </div>

          <Separator />

          {/* Informações Detalhadas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-2">Data:</span>
                <span>
                  {format(new Date(alerta.data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>

              {alerta.equipamentoNome && (
                <div className="flex items-center text-sm">
                  <Wrench className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Equipamento:</span>
                  <span className="font-medium">{alerta.equipamentoNome}</span>
                </div>
              )}

              {alerta.obra && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Obra:</span>
                  <span>{alerta.obra}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {alerta.responsavel && (
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground mr-2">Responsável:</span>
                  <span>{alerta.responsavel}</span>
                </div>
              )}

              {alerta.valor !== undefined && alerta.limite !== undefined && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Consumo:</span>
                    <span className={alerta.valor > alerta.limite ? 'text-red-600 font-bold' : ''}>
                      {alerta.valor} / {alerta.limite}
                    </span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        (alerta.valor / alerta.limite) > 0.9 ? 'bg-red-500' :
                        (alerta.valor / alerta.limite) > 0.7 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((alerta.valor / alerta.limite) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recomendações */}
          {alerta.recomendacoes && alerta.recomendacoes.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Recomendações</h4>
                <ul className="space-y-2">
                  {alerta.recomendacoes.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Histórico */}
          {alerta.historico && alerta.historico.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Histórico</h4>
                <div className="space-y-2">
                  {alerta.historico.map((item, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">
                          {format(new Date(item.data), "dd/MM/yyyy HH:mm")} -
                        </span>
                        <span className="ml-1">{item.acao}</span>
                        <span className="text-muted-foreground ml-1">por {item.usuario}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {alerta.status !== 'resolvido' && (
            <Button onClick={onResolver} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como Resolvido
            </Button>
          )}
          {alerta.status !== 'ignorado' && (
            <Button variant="outline" onClick={onIgnorar}>
              Ignorar Alerta
            </Button>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}