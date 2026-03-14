'use client'

import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    
    if (media.matches !== matches) {
      setMatches(media.matches)
    }

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [matches, query])

  return matches
}

// Hooks específicos para breakpoints comuns
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 768px)')
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1025px)')
}

export function useIsDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)')
}

export function useIsReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

export function useIsHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: high)')
}

// Hook para orientação
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return orientation
}

// Hook para breakpoints personalizados
export function useBreakpoint<T extends Record<string, string>>(
  breakpoints: T
): keyof T {
  const [breakpoint, setBreakpoint] = useState<keyof T>()

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      for (const [key, value] of Object.entries(breakpoints)) {
        const [min, max] = value.split('-').map(Number)
        if (width >= min && (!max || width <= max)) {
          setBreakpoint(key)
          break
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoints])

  return breakpoint as keyof T
}