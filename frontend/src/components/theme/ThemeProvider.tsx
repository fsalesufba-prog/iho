'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ThemeColorScheme = 'default' | 'blue' | 'green' | 'purple' | 'orange' | 'red'
export type ThemeFontFamily = 'inter' | 'roboto' | 'poppins' | 'opensans' | 'lato'
export type ThemeRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ThemeContextData {
  // Modo
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  resolvedMode: 'light' | 'dark'
  
  // Cores
  colorScheme: ThemeColorScheme
  setColorScheme: (scheme: ThemeColorScheme) => void
  
  // Tipografia
  fontFamily: ThemeFontFamily
  setFontFamily: (font: ThemeFontFamily) => void
  
  // Bordas
  radius: ThemeRadius
  setRadius: (radius: ThemeRadius) => void
  
  // Utilitários
  toggleMode: () => void
  resetToDefaults: () => void
  isDark: boolean
  isLight: boolean
}

const defaultTheme: Omit<ThemeContextData, 'setMode' | 'setColorScheme' | 'setFontFamily' | 'setRadius' | 'toggleMode' | 'resetToDefaults' | 'resolvedMode' | 'isDark' | 'isLight'> = {
  mode: 'system',
  colorScheme: 'default',
  fontFamily: 'inter',
  radius: 'md',
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData)

// Mapeamento de cores por esquema
const colorSchemes = {
  default: {
    light: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#020817',
    },
    dark: {
      primary: '#38bdf8',
      secondary: '#94a3b8',
      accent: '#a78bfa',
      background: '#020817',
      foreground: '#f8fafc',
    }
  },
  blue: {
    light: {
      primary: '#2563eb',
      secondary: '#475569',
      accent: '#7c3aed',
      background: '#ffffff',
      foreground: '#0f172a',
    },
    dark: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#0f172a',
      foreground: '#f1f5f9',
    }
  },
  green: {
    light: {
      primary: '#059669',
      secondary: '#4b5563',
      accent: '#7c3aed',
      background: '#ffffff',
      foreground: '#064e3b',
    },
    dark: {
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      background: '#064e3b',
      foreground: '#ecfdf5',
    }
  },
  purple: {
    light: {
      primary: '#7c3aed',
      secondary: '#6b7280',
      accent: '#ec4899',
      background: '#ffffff',
      foreground: '#2e1065',
    },
    dark: {
      primary: '#8b5cf6',
      secondary: '#9ca3af',
      accent: '#f472b6',
      background: '#2e1065',
      foreground: '#f5f3ff',
    }
  },
  orange: {
    light: {
      primary: '#ea580c',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#7c2d12',
    },
    dark: {
      primary: '#f97316',
      secondary: '#9ca3af',
      accent: '#a78bfa',
      background: '#7c2d12',
      foreground: '#fff7ed',
    }
  },
  red: {
    light: {
      primary: '#dc2626',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#7f1d1d',
    },
    dark: {
      primary: '#ef4444',
      secondary: '#9ca3af',
      accent: '#a78bfa',
      background: '#7f1d1d',
      foreground: '#fef2f2',
    }
  }
}

// Mapeamento de fontes
const fontFamilies = {
  inter: 'var(--font-inter)',
  roboto: 'var(--font-roboto)',
  poppins: 'var(--font-poppins)',
  opensans: 'var(--font-open-sans)',
  lato: 'var(--font-lato)',
}

// Mapeamento de raios de borda
const radiusValues = {
  none: '0px',
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system')
  const [colorScheme, setColorScheme] = useState<ThemeColorScheme>('default')
  const [fontFamily, setFontFamily] = useState<ThemeFontFamily>('inter')
  const [radius, setRadius] = useState<ThemeRadius>('md')
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light')

  // Carregar preferências salvas
  useEffect(() => {
    const savedMode = localStorage.getItem('@iho:theme:mode') as ThemeMode | null
    const savedColorScheme = localStorage.getItem('@iho:theme:colorScheme') as ThemeColorScheme | null
    const savedFontFamily = localStorage.getItem('@iho:theme:fontFamily') as ThemeFontFamily | null
    const savedRadius = localStorage.getItem('@iho:theme:radius') as ThemeRadius | null

    if (savedMode) setMode(savedMode)
    if (savedColorScheme) setColorScheme(savedColorScheme)
    if (savedFontFamily) setFontFamily(savedFontFamily)
    if (savedRadius) setRadius(savedRadius)
  }, [])

  // Atualizar variáveis CSS quando as preferências mudarem
  useEffect(() => {
    const root = document.documentElement

    // Salvar preferências
    localStorage.setItem('@iho:theme:mode', mode)
    localStorage.setItem('@iho:theme:colorScheme', colorScheme)
    localStorage.setItem('@iho:theme:fontFamily', fontFamily)
    localStorage.setItem('@iho:theme:radius', radius)

    // Determinar modo resolvido
    let currentMode: 'light' | 'dark'
    if (mode === 'system') {
      currentMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      currentMode = mode
    }
    setResolvedMode(currentMode)

    // Aplicar classes
    root.classList.remove('light', 'dark')
    root.classList.add(currentMode)

    // Aplicar cores
    const colors = colorSchemes[colorScheme][currentMode]
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Aplicar fonte
    root.style.setProperty('--font-family', fontFamilies[fontFamily])

    // Aplicar raio de borda
    root.style.setProperty('--radius', radiusValues[radius])
  }, [mode, colorScheme, fontFamily, radius])

  // Ouvir mudanças no sistema de preferências
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        const newMode = e.matches ? 'dark' : 'light'
        setResolvedMode(newMode)
        
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(newMode)

        const colors = colorSchemes[colorScheme][newMode]
        Object.entries(colors).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value)
        })
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [mode, colorScheme])

  const toggleMode = () => {
    setMode(prev => {
      if (prev === 'light') return 'dark'
      if (prev === 'dark') return 'light'
      return 'light'
    })
  }

  const resetToDefaults = () => {
    setMode('system')
    setColorScheme('default')
    setFontFamily('inter')
    setRadius('md')
  }

  return (
    <ThemeContext.Provider
      value={{
        mode,
        setMode,
        resolvedMode,
        colorScheme,
        setColorScheme,
        fontFamily,
        setFontFamily,
        radius,
        setRadius,
        toggleMode,
        resetToDefaults,
        isDark: resolvedMode === 'dark',
        isLight: resolvedMode === 'light',
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}