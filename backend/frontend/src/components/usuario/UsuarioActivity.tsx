'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface UsuarioActivityProps {
  recentes?: any[]
  type?: 'acessos' | 'atividades'
}

export function UsuarioActivity({ recentes, type }: UsuarioActivityProps) {
  const items = recentes ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === 'acessos' ? 'Histórico de Acessos' : 'Atividade Recente'}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma atividade registrada.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item: any, index: number) => (
              <li key={item.id ?? index} className="text-sm text-muted-foreground">
                {item.descricao ?? JSON.stringify(item)}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
