'use client'

import { useState, useEffect } from 'react'
import { useTheme as useThemeFromProvider } from '@/components/providers/ThemeProvider'

export function useTheme() {
  const context = useThemeFromProvider()

  return {
    ...context,
    theme: context.theme,
    setTheme: context.setTheme,
    resolvedTheme: context.resolvedTheme,
    toggleTheme: context.toggleTheme,
    isDark: context.resolvedTheme === 'dark',
    isLight: context.resolvedTheme === 'light',
  }
}

export function useDarkMode() {
  const { resolvedTheme } = useThemeFromProvider()
  return resolvedTheme === 'dark'
}

export function useThemeTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const handleStart = () => setIsTransitioning(true)
    const handleEnd = () => setIsTransitioning(false)

    document.addEventListener('transitionstart', handleStart)
    document.addEventListener('transitionend', handleEnd)

    return () => {
      document.removeEventListener('transitionstart', handleStart)
      document.removeEventListener('transitionend', handleEnd)
    }
  }, [])

  return isTransitioning
}
