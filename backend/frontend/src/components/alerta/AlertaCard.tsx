'use client'

import React from 'react'
import { 
  AlertTriangle, 
  Fuel, 
  Wrench, 
  Package, 
  MoreVertical,
  CheckCircle,
  Eye,
  XCircle,
  Clock
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { AlertaPriority } from './AlertaPriority'
import { AlertaStatus } from './AlertaStatus'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Alerta {
  id: string
  tipo: 'combustivel' | 'manutencao' | 'estoque' | 'sistema'
  titulo: string
  descricao: string
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  status: 'novo' | 'lido' | 'resolvido' | 'ignorado'
  data: string
  equipamentoId?: string
  equipamentoNome?: string
}

interface AlertaCardProps {
  alerta: Alerta
  onMarcarLido?: () => void
  onResolver?: () => void
  onIgnorar?: () => void
  onVisualizar?: () => void
}

const icons = {
  combustivel: Fuel,
  manutencao: Wrench,
  estoque: Package,
  sistema: AlertTriangle
}

const colors = {
  combustivel: 'text-blue-500',
  manutencao: 'text-yellow-500',
  estoque: 'text-green-500',
  sistema: 'text-purple-500'
}

export function AlertaCard({ 
  alerta, 
  onMarcarLido, 
  onResolver, 
  onIgnorar,
  onVisualizar 
}: AlertaCardProps) {
  const Icon = icons[alerta.tipo]
  const color = colors[alerta.tipo]
  
  const isNovo = alerta.status === 'novo'
  const isCritico = alerta.prioridade === 'critica'

  return (
    <Card className={`relative transition-all hover:shadow-md ${
      isNovo ? 'border-l-4 border-l-blue-500' : ''
    } ${isCritico ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Ícone */}
            <div className={`mt-1 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Conteúdo */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold">{alerta.titulo}</h4>
                <AlertaPriority prioridade={alerta.prioridade} />
                <AlertaStatus status={alerta.status} />
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {alerta.descricao}
              </p>
              
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(alerta.data), { 
                    addSuffix: true,
                    locale: ptBR 
                  })}
                </span>
                
                {alerta.equipamentoNome && (
                  <span>• {alerta.equipamentoNome}</span>
                )}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2">
            {isNovo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarcarLido}
                className="h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            {alerta.status !== 'resolvido' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResolver}
                className="h-8 w-8 p-0 text-green-600"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onVisualizar}>
                  Visualizar detalhes
                </DropdownMenuItem>
                {alerta.status !== 'ignorado' && (
                  <DropdownMenuItem 
                    onClick={onIgnorar}
                    className="text-yellow-600"
                  >
                    Ignorar alerta
                  </DropdownMenuItem>
                )}
                {alerta.status === 'resolvido' && (
                  <DropdownMenuItem onClick={onMarcarLido}>
                    Reabrir alerta
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Barra de progresso para alertas de limite */}
        {alerta.valor !== undefined && alerta.limite !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Consumo atual: {alerta.valor}</span>
              <span>Limite: {alerta.limite}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
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
    </Card>
  )
}