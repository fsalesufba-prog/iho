'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'

interface ModalProps {
  id: string
  component: React.ReactNode
  options?: {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closeOnClickOutside?: boolean
    closeOnEscape?: boolean
  }
}

interface ModalContextData {
  modals: ModalProps[]
  openModal: (props: Omit<ModalProps, 'id'>) => string
  closeModal: (id: string) => void
  closeAllModals: () => void
}

const ModalContext = createContext<ModalContextData>({} as ModalContextData)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<ModalProps[]>([])

  const openModal = useCallback(({ component, options }: Omit<ModalProps, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setModals((prev) => [...prev, { id, component, options }])
    return id
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals((prev) => prev.filter((modal) => modal.id !== id))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals([])
  }, [])

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal, closeAllModals }}>
      {children}
      {modals.map(({ id, component, options }) => (
        <Modal
          key={id}
          isOpen={true}
          onClose={() => closeModal(id)}
          size={options?.size}
        >
          {component}
        </Modal>
      ))}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}