'use client'

import { useContext, useState, useEffect } from 'react'
import { ThemeContext } from '@/components/theme/ThemeProvider'

export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  const theme = context.mode
  const setTheme = context.setMode
  const resolvedTheme = context.resolvedMode
  const toggleTheme = context.toggleMode

  return {
    ...context,
    theme,
    setTheme,
    resolvedTheme,
    toggleTheme,
    isDark: context.isDark,
    isLight: context.isLight,
  }
}

export function useDarkMode() {
  const { isDark } = useTheme()
  return isDark
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
