'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { cn } from '@/lib/utils'

interface Preset {
  id: string
  name: string
  description: string
  mode: 'light' | 'dark' | 'system'
  colorScheme: string
  fontFamily: string
  radius: string
  preview: {
    primary: string
    secondary: string
    accent: string
  }
}

const presets: Preset[] = [
  {
    id: 'default-light',
    name: 'Claro Padrão',
    description: 'Tema claro com cores padrão',
    mode: 'light',
    colorScheme: 'default',
    fontFamily: 'inter',
    radius: 'md',
    preview: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      accent: '#8b5cf6',
    }
  },
  {
    id: 'default-dark',
    name: 'Escuro Padrão',
    description: 'Tema escuro com cores padrão',
    mode: 'dark',
    colorScheme: 'default',
    fontFamily: 'inter',
    radius: 'md',
    preview: {
      primary: '#38bdf8',
      secondary: '#94a3b8',
      accent: '#a78bfa',
    }
  },
  {
    id: 'ocean',
    name: 'Oceano',
    description: 'Tons de azul profundo',
    mode: 'dark',
    colorScheme: 'blue',
    fontFamily: 'poppins',
    radius: 'lg',
    preview: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
    }
  },
  {
    id: 'forest',
    name: 'Floresta',
    description: 'Tons de verde natural',
    mode: 'light',
    colorScheme: 'green',
    fontFamily: 'lato',
    radius: 'sm',
    preview: {
      primary: '#059669',
      secondary: '#4b5563',
      accent: '#7c3aed',
    }
  },
  {
    id: 'sunset',
    name: 'Pôr do Sol',
    description: 'Tons alaranjados vibrantes',
    mode: 'dark',
    colorScheme: 'orange',
    fontFamily: 'roboto',
    radius: 'xl',
    preview: {
      primary: '#f97316',
      secondary: '#9ca3af',
      accent: '#a78bfa',
    }
  },
  {
    id: 'royal',
    name: 'Real',
    description: 'Tons roxos sofisticados',
    mode: 'dark',
    colorScheme: 'purple',
    fontFamily: 'opensans',
    radius: 'full',
    preview: {
      primary: '#8b5cf6',
      secondary: '#9ca3af',
      accent: '#f472b6',
    }
  }
]

interface ThemePresetsProps {
  onSelect?: () => void
}

export function ThemePresets({ onSelect }: ThemePresetsProps) {
  const { mode, colorScheme, fontFamily, radius, setMode, setColorScheme, setFontFamily, setRadius } = useTheme()

  const isActive = (preset: Preset) => {
    return (
      preset.mode === mode &&
      preset.colorScheme === colorScheme &&
      preset.fontFamily === fontFamily &&
      preset.radius === radius
    )
  }

  const applyPreset = (preset: Preset) => {
    setMode(preset.mode)
    setColorScheme(preset.colorScheme as any)
    setFontFamily(preset.fontFamily as any)
    setRadius(preset.radius as any)
    onSelect?.()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {presets.map((preset) => (
        <Card
          key={preset.id}
          className={cn(
            'relative cursor-pointer transition-all hover:shadow-lg',
            isActive(preset) && 'ring-2 ring-primary'
          )}
          onClick={() => applyPreset(preset)}
        >
          <CardContent className="p-4">
            {/* Preview das cores */}
            <div className="flex gap-1 mb-3">
              <div
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: preset.preview.primary }}
              />
              <div
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: preset.preview.secondary }}
              />
              <div
                className="h-8 w-8 rounded-full"
                style={{ backgroundColor: preset.preview.accent }}
              />
            </div>

            {/* Informações */}
            <h3 className="font-medium">{preset.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                {preset.mode === 'light' ? '☀️' : '🌙'} {preset.mode}
              </span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                {preset.fontFamily}
              </span>
            </div>

            {/* Check de seleção */}
            {isActive(preset) && (
              <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}