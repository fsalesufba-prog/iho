'use client'

import { useContext } from 'react'
import { ThemeContext } from '@/components/theme/ThemeProvider'

interface ThemeContextData {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  resolvedTheme: 'light' | 'dark'
  toggleTheme: () => void
  isDark: boolean
  isLight: boolean
}

export function useTheme(): ThemeContextData {
  const context = useContext(ThemeContext)
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  const toggleTheme = () => {
    context.setTheme(context.resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return {
    ...context,
    toggleTheme,
    isDark: context.resolvedTheme === 'dark',
    isLight: context.resolvedTheme === 'light'
  }
}

// Hooks específicos
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