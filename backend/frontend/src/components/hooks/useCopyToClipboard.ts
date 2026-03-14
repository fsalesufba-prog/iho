'use client'

import { useState, useCallback } from 'react'

interface UseCopyToClipboardOptions {
  timeout?: number
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseCopyToClipboardResult {
  copied: boolean
  copy: (text: string) => Promise<void>
  error: Error | null
}

export function useCopyToClipboard({
  timeout = 2000,
  onSuccess,
  onError
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setError(null)
      onSuccess?.()

      setTimeout(() => {
        setCopied(false)
      }, timeout)
    } catch (err) {
      const error = err as Error
      setError(error)
      onError?.(error)
    }
  }, [timeout, onSuccess, onError])

  return { copied, copy, error }
}

// Hook para cópia com fallback
export function useCopyToClipboardWithFallback(options: UseCopyToClipboardOptions = {}) {
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const copy = useCallback(async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback para navegadores antigos
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setCopied(true)
      setError(null)
      options.onSuccess?.()

      setTimeout(() => {
        setCopied(false)
      }, options.timeout || 2000)
    } catch (err) {
      const error = err as Error
      setError(error)
      options.onError?.(error)
    }
  }, [options])

  return { copied, copy, error }
}

// Hook para cópia com formatação
export function useCopyFormatted() {
  const { copy, ...rest } = useCopyToClipboard()

  const copyFormatted = useCallback((text: string, format?: 'json' | 'csv' | 'text') => {
    let formattedText = text

    if (format === 'json') {
      try {
        const parsed = JSON.parse(text)
        formattedText = JSON.stringify(parsed, null, 2)
      } catch {
        // Mantém o texto original se não for JSON válido
      }
    }

    return copy(formattedText)
  }, [copy])

  return { ...rest, copy: copyFormatted }
}