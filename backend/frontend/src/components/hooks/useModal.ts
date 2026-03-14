'use client'

import { useState, useCallback } from 'react'

interface UseModalProps {
  initialOpen?: boolean
  onOpen?: () => void
  onClose?: () => void
}

export function useModal({ initialOpen = false, onOpen, onClose }: UseModalProps = {}) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  const open = useCallback(() => {
    setIsOpen(true)
    onOpen?.()
  }, [onOpen])

  const close = useCallback(() => {
    setIsOpen(false)
    onClose?.()
  }, [onClose])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
    if (!isOpen) {
      onOpen?.()
    } else {
      onClose?.()
    }
  }, [isOpen, onOpen, onClose])

  return {
    isOpen,
    open,
    close,
    toggle
  }
}

// Hook para múltiplos modais
export function useMultiModal() {
  const [modals, setModals] = useState<Record<string, boolean>>({})

  const openModal = useCallback((id: string) => {
    setModals(prev => ({ ...prev, [id]: true }))
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals(prev => ({ ...prev, [id]: false }))
  }, [])

  const toggleModal = useCallback((id: string) => {
    setModals(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const isModalOpen = useCallback((id: string) => {
    return !!modals[id]
  }, [modals])

  return {
    openModal,
    closeModal,
    toggleModal,
    isModalOpen,
    modals
  }
}