import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTheme } from './ThemeProvider'

export function ThemePreview() {
  const { colorScheme, fontFamily, radius } = useTheme()

  return (
    <Card className="p-4 space-y-3">
      <h4 className="text-sm font-medium">Preview</h4>
      
      {/* Botões */}
      <div className="flex gap-2">
        <Button size="sm">Primário</Button>
        <Button size="sm" variant="secondary">Secundário</Button>
        <Button size="sm" variant="outline">Outline</Button>
      </div>

      {/* Input */}
      <Input placeholder="Campo de texto" />

      {/* Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 rounded border bg-card p-2 text-xs">Card 1</div>
        <div className="h-12 rounded border bg-card p-2 text-xs">Card 2</div>
      </div>

      {/* Badges */}
      <div className="flex gap-2">
        <span className="px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
          Ativo
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
          Inativo
        </span>
      </div>

      {/* Informações do tema atual */}
      <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
        <div>Cor: {colorScheme}</div>
        <div>Fonte: {fontFamily}</div>
        <div>Raio: {radius}</div>
      </div>
    </Card>
  )
}