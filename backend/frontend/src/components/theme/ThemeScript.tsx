'use client'

import React from 'react'

// Script para prevenir flash de tema incorreto
export function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const mode = localStorage.getItem('@iho:theme:mode') || 'system'
        const colorScheme = localStorage.getItem('@iho:theme:colorScheme') || 'default'
        
        let resolvedMode
        if (mode === 'system') {
          resolvedMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        } else {
          resolvedMode = mode
        }
        
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(resolvedMode)
        
        // Aplicar cores (simplificado para evitar flash)
        const root = document.documentElement
        if (resolvedMode === 'dark') {
          root.style.setProperty('--background', '222.2 84% 4.9%')
          root.style.setProperty('--foreground', '210 40% 98%')
        } else {
          root.style.setProperty('--background', '0 0% 100%')
          root.style.setProperty('--foreground', '222.2 84% 4.9%')
        }
      } catch (e) {}
    })()
  `

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
}