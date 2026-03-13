'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface ThemeSwitcherProps {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { mode, setMode, colorScheme, setColorScheme } = useTheme()

  const modes = [
    { value: 'light', label: 'Claro', icon: '☀️' },
    { value: 'dark', label: 'Escuro', icon: '🌙' },
    { value: 'system', label: 'Sistema', icon: '💻' },
  ] as const

  const colorSchemes = [
    { value: 'default', label: 'Padrão', color: '#0ea5e9' },
    { value: 'blue', label: 'Azul', color: '#2563eb' },
    { value: 'green', label: 'Verde', color: '#059669' },
    { value: 'purple', label: 'Roxo', color: '#7c3aed' },
    { value: 'orange', label: 'Laranja', color: '#ea580c' },
    { value: 'red', label: 'Vermelho', color: '#dc2626' },
  ]

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-6">
        {/* Modo */}
        <div>
          <h3 className="text-sm font-medium mb-3">Modo</h3>
          <div className="grid grid-cols-3 gap-2">
            {modes.map((item) => (
              <Button
                key={item.value}
                variant={mode === item.value ? 'default' : 'outline'}
                className="flex-col h-auto py-3 gap-1"
                onClick={() => setMode(item.value)}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Esquema de Cores */}
        <div>
          <h3 className="text-sm font-medium mb-3">Cor Primária</h3>
          <div className="grid grid-cols-3 gap-2">
            {colorSchemes.map((scheme) => (
              <Button
                key={scheme.value}
                variant="outline"
                className="relative h-12"
                style={{ backgroundColor: scheme.color + '20' }}
                onClick={() => setColorScheme(scheme.value)}
              >
                <div
                  className="absolute inset-0 rounded-md"
                  style={{ backgroundColor: scheme.color }}
                />
                {colorScheme === scheme.value && (
                  <Check className="absolute h-4 w-4 text-white" />
                )}
              </Button>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {colorSchemes.find(s => s.value === colorScheme)?.label}
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-sm font-medium mb-3">Preview</h3>
          <div className="space-y-2 p-4 rounded-lg border">
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded bg-primary" />
              <div className="h-8 w-8 rounded bg-secondary" />
              <div className="h-8 w-8 rounded bg-accent" />
              <div className="h-8 w-8 rounded bg-muted" />
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full rounded bg-primary/20" />
              <div className="h-2 w-3/4 rounded bg-primary/20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}