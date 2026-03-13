import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useTheme } from './ThemeProvider'

export function ThemeColors() {
  const { resolvedMode } = useTheme()

  const colors = [
    { name: 'Primária', var: '--primary' },
    { name: 'Secundária', var: '--secondary' },
    { name: 'Destaque', var: '--accent' },
    { name: 'Fundo', var: '--background' },
    { name: 'Texto', var: '--foreground' },
    { name: 'Card', var: '--card' },
    { name: 'Borda', var: '--border' },
    { name: 'Entrada', var: '--input' },
    { name: 'Anel', var: '--ring' },
    { name: 'Muted', var: '--muted' },
    { name: 'Sucesso', var: '--success' },
    { name: 'Aviso', var: '--warning' },
    { name: 'Erro', var: '--destructive' },
    { name: 'Info', var: '--info' },
  ]

  const getCssVariableValue = (variable: string) => {
    if (typeof window === 'undefined') return ''
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cores do Tema</CardTitle>
        <p className="text-sm text-muted-foreground">
          Modo: {resolvedMode === 'dark' ? 'Escuro' : 'Claro'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {colors.map((color) => {
            const value = getCssVariableValue(color.var)
            return (
              <div key={color.var} className="space-y-1">
                <div
                  className="h-12 w-full rounded-lg border"
                  style={{ backgroundColor: `hsl(${value})` }}
                />
                <div className="text-xs">
                  <p className="font-medium">{color.name}</p>
                  <p className="text-muted-foreground">hsl({value})</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}