'use client'

import React from 'react'
import { AlertTriangle, Fuel, Wrench, Package, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AlertaToastProps {
  id: string
  tipo: 'combustivel' | 'manutencao' | 'estoque' | 'sistema'
  titulo: string
  descricao: string
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  onClose?: () => void
  onView?: () => void
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

const bgColors = {
  combustivel: 'bg-blue-50 dark:bg-blue-950/50',
  manutencao: 'bg-yellow-50 dark:bg-yellow-950/50',
  estoque: 'bg-green-50 dark:bg-green-950/50',
  sistema: 'bg-purple-50 dark:bg-purple-950/50'
}

const priorityBorder = {
  baixa: 'border-l-blue-500',
  media: 'border-l-yellow-500',
  alta: 'border-l-orange-500',
  critica: 'border-l-red-500'
}

export function AlertaToast({ 
  tipo, 
  titulo, 
  descricao, 
  prioridade,
  onClose,
  onView 
}: AlertaToastProps) {
  const Icon = icons[tipo]
  const color = colors[tipo]
  const bgColor = bgColors[tipo]
  const border = priorityBorder[prioridade]

  return (
    <div className={`${bgColor} ${border} border-l-4 rounded-lg shadow-lg p-4 max-w-md w-full`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {titulo}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {descricao}
          </p>
          
          <div className="mt-3 flex space-x-2">
            <Button
              size="sm"
              onClick={onView}
              className="text-xs"
            >
              Visualizar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="text-xs"
            >
              Fechar
            </Button>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}