'use client'

import { useEffect, useRef, useCallback } from 'react'

type HotkeyHandler = (event: KeyboardEvent) => void

interface HotkeyOptions {
  enabled?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

export function useHotkeys(
  keys: string | string[],
  handler: HotkeyHandler,
  options: HotkeyOptions = {}
) {
  const { enabled = true, preventDefault = true, stopPropagation = false } = options
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    const key = event.key.toLowerCase()
    const keyCombination = `${event.ctrlKey ? 'ctrl+' : ''}${
      event.altKey ? 'alt+' : ''
    }${event.shiftKey ? 'shift+' : ''}${key}`

    const keysArray = Array.isArray(keys) ? keys : [keys]
    
    if (keysArray.some(k => k.toLowerCase() === keyCombination)) {
      if (preventDefault) {
        event.preventDefault()
      }
      if (stopPropagation) {
        event.stopPropagation()
      }
      handlerRef.current(event)
    }
  }, [keys, enabled, preventDefault, stopPropagation])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

// Hooks específicos
export function useCtrlS(handler: HotkeyHandler, options?: HotkeyOptions) {
  useHotkeys('ctrl+s', handler, { ...options, preventDefault: true })
}

export function useCtrlC(handler: HotkeyHandler, options?: HotkeyOptions) {
  useHotkeys('ctrl+c', handler, options)
}

export function useCtrlV(handler: HotkeyHandler, options?: HotkeyOptions) {
  useHotkeys('ctrl+v', handler, options)
}

export function useCtrlZ(handler: HotkeyHandler, options?: HotkeyOptions) {
  useHotkeys('ctrl+z', handler, { ...options, preventDefault: true })
}

export function useCtrlY(handler: HotkeyHandler, options?: HotkeyOptions) {
  useHotkeys('ctrl+y', handler, { ...options, preventDefault: true })
}

export function useEscape(handler: HotkeyHandler, options?: HotkeyOptions) {
  useHotkeys('escape', handler, options)
}

export function useEnter(handler: HotkeyHandler, options?: HotkeyOptions) {
  useHotkeys('enter', handler, options)
}

// Hook para múltiplos atalhos
export function useHotkeysMap(
  keyMap: Record<string, HotkeyHandler>,
  options?: HotkeyOptions
) {
  const handlerRefs = useRef<Record<string, HotkeyHandler>>({})

  useEffect(() => {
    handlerRefs.current = keyMap
  }, [keyMap])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (options?.enabled === false) return

    const key = event.key.toLowerCase()
    const keyCombination = `${event.ctrlKey ? 'ctrl+' : ''}${
      event.altKey ? 'alt+' : ''
    }${event.shiftKey ? 'shift+' : ''}${key}`

    const handler = handlerRefs.current[keyCombination]
    
    if (handler) {
      if (options?.preventDefault !== false) {
        event.preventDefault()
      }
      if (options?.stopPropagation) {
        event.stopPropagation()
      }
      handler(event)
    }
  }, [options])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}