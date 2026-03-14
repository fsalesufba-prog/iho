'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

// Hook com pause/resume
export function useIntervalWithControls(callback: () => void, delay: number | null) {
  const [isRunning, setIsRunning] = useState(delay !== null)
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (!isRunning || delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [isRunning, delay])

  const start = useCallback(() => setIsRunning(true), [])
  const pause = useCallback(() => setIsRunning(false), [])
  const toggle = useCallback(() => setIsRunning(prev => !prev), [])

  return { isRunning, start, pause, toggle }
}

// Hook com contagem de execuções
export function useIntervalWithCount(callback: () => void, delay: number | null, maxExecutions?: number) {
  const [count, setCount] = useState(0)

  useInterval(() => {
    if (maxExecutions && count >= maxExecutions) return
    
    callback()
    setCount(prev => prev + 1)
  }, delay)

  const resetCount = useCallback(() => setCount(0), [])

  return { count, resetCount }
}