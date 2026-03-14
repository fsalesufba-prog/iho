'use client'

import { useEffect, useRef } from 'react'

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | HTMLElement | null,
  options?: boolean | AddEventListenerOptions
): void {
  const savedHandler = useRef(handler)

  useEffect(() => {
    savedHandler.current = handler
  }, [handler])

  useEffect(() => {
    const targetElement = element || window
    if (!targetElement?.addEventListener) return

    const eventListener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K])
    }

    targetElement.addEventListener(eventName, eventListener, options)

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options)
    }
  }, [eventName, element, options])
}

// Hook para eventos específicos
export function useWindowResize(handler: (width: number, height: number) => void) {
  useEventListener('resize', () => {
    handler(window.innerWidth, window.innerHeight)
  })
}

export function useWindowScroll(handler: (x: number, y: number) => void) {
  useEventListener('scroll', () => {
    handler(window.scrollX, window.scrollY)
  })
}

export function useKeyPress(key: string, handler: (event: KeyboardEvent) => void) {
  useEventListener('keydown', (event) => {
    if (event.key === key) {
      handler(event)
    }
  })
}

export function useKeyCombination(keys: string[], handler: (event: KeyboardEvent) => void) {
  const pressedKeys = useRef<Set<string>>(new Set())

  useEventListener('keydown', (event) => {
    pressedKeys.current.add(event.key)

    if (keys.every(key => pressedKeys.current.has(key))) {
      handler(event)
    }
  })

  useEventListener('keyup', (event) => {
    pressedKeys.current.delete(event.key)
  })
}

export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: (event: MouseEvent) => void
) {
  useEventListener('mousedown', (event) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      handler(event)
    }
  })
}

export function useScrollLock(lock: boolean = true) {
  useEffect(() => {
    if (lock) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
<<<<<<< HEAD
=======
    return undefined
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  }, [lock])
}