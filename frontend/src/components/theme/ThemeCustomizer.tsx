'use client'

import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/Radio-group'
import { Slider } from '@/components/ui/Slider'
import { Switch } from '@/components/ui/Switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Paintbrush, Type, Circle, Settings, RotateCcw } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { ThemePreview } from './ThemePreview'

interface ThemeCustomizerProps {
  children?: React.ReactNode
}

export function ThemeCustomizer({ children }: ThemeCustomizerProps) {
  const {
    mode,
    setMode,
    colorScheme,
    setColorScheme,
    fontFamily,
    setFontFamily,
    radius,
    setRadius,
    resetToDefaults,
  } = useTheme()

  const colorSchemes = [
    { value: 'default', label: 'Padrão', color: '#0ea5e9' },
    { value: 'blue', label: 'Azul', color: '#2563eb' },
    { value: 'green', label: 'Verde', color: '#059669' },
    { value: 'purple', label: 'Roxo', color: '#7c3aed' },
    { value: 'orange', label: 'Laranja', color: '#ea580c' },
    { value: 'red', label: 'Vermelho', color: '#dc2626' },
  ]

  const fontFamilies = [
    { value: 'inter', label: 'Inter', sample: 'Aa' },
    { value: 'roboto', label: 'Roboto', sample: 'Aa' },
    { value: 'poppins', label: 'Poppins', sample: 'Aa' },
    { value: 'opensans', label: 'Open Sans', sample: 'Aa' },
    { value: 'lato', label: 'Lato', sample: 'Aa' },
  ]

  const radiusOptions = [
    { value: 'none', label: 'Sem', preview: 'rounded-none' },
    { value: 'sm', label: 'Pequeno', preview: 'rounded-sm' },
    { value: 'md', label: 'Médio', preview: 'rounded-md' },
    { value: 'lg', label: 'Grande', preview: 'rounded-lg' },
    { value: 'xl', label: 'Extra', preview: 'rounded-xl' },
    { value: 'full', label: 'Total', preview: 'rounded-full' },
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <Paintbrush className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Personalizar Tema</SheetTitle>
          <SheetDescription>
            Ajuste as cores, fontes e estilos do sistema
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Preview */}
          <ThemePreview />

          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors">
                <Paintbrush className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="fonts">
                <Type className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="radius">
                <Circle className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Settings className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            {/* Cores */}
            <TabsContent value="colors" className="space-y-4 mt-4">
              <div>
                <Label className="text-base">Modo</Label>
                <RadioGroup
                  value={mode}
                  onValueChange={(value: any) => setMode(value)}
                  className="grid grid-cols-3 gap-2 mt-2"
                >
                  <div>
                    <RadioGroupItem value="light" id="light" className="peer sr-only" />
                    <Label
                      htmlFor="light"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      ☀️ Claro
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
                    <Label
                      htmlFor="dark"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      🌙 Escuro
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="system" id="system" className="peer sr-only" />
                    <Label
                      htmlFor="system"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      💻 Sistema
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base">Cor Primária</Label>
                <RadioGroup
                  value={colorScheme}
                  onValueChange={(value: any) => setColorScheme(value)}
                  className="grid grid-cols-3 gap-2 mt-2"
                >
                  {colorSchemes.map((scheme) => (
                    <div key={scheme.value}>
                      <RadioGroupItem
                        value={scheme.value}
                        id={`color-${scheme.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`color-${scheme.value}`}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        style={{ backgroundColor: scheme.color + '20' }}
                      >
                        <div
                          className="h-6 w-6 rounded-full mb-1"
                          style={{ backgroundColor: scheme.color }}
                        />
                        <span className="text-xs">{scheme.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>

            {/* Fontes */}
            <TabsContent value="fonts" className="space-y-4 mt-4">
              <RadioGroup
                value={fontFamily}
                onValueChange={(value: any) => setFontFamily(value)}
                className="grid gap-2"
              >
                {fontFamilies.map((font) => (
                  <div key={font.value}>
                    <RadioGroupItem
                      value={font.value}
                      id={`font-${font.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`font-${font.value}`}
                      className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      style={{ fontFamily: `var(--font-${font.value})` }}
                    >
                      <span className="text-2xl">{font.sample}</span>
                      <span className="text-sm">{font.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </TabsContent>

            {/* Raio */}
            <TabsContent value="radius" className="space-y-4 mt-4">
              <RadioGroup
                value={radius}
                onValueChange={(value: any) => setRadius(value)}
                className="grid grid-cols-3 gap-2"
              >
                {radiusOptions.map((option) => (
                  <div key={option.value}>
                    <RadioGroupItem
                      value={option.value}
                      id={`radius-${option.value}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`radius-${option.value}`}
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className={`h-8 w-8 bg-primary ${option.preview} mb-1`} />
                      <span className="text-xs">{option.label}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </TabsContent>

            {/* Avançado */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="animations">Animações</Label>
                  <Switch id="animations" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="transitions">Transições</Label>
                  <Switch id="transitions" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="contrast">Alto Contraste</Label>
                  <Switch id="contrast" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion">Reduzir Movimento</Label>
                  <Switch id="reduced-motion" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Intensidade das Cores</Label>
                <Slider defaultValue={[100]} max={100} step={1} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Botão Reset */}
          <Button
            variant="outline"
            className="w-full"
            onClick={resetToDefaults}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restaurar Padrões
          </Button>

          {/* Informações */}
          <div className="text-xs text-muted-foreground text-center">
            As alterações são salvas automaticamente no seu navegador
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}