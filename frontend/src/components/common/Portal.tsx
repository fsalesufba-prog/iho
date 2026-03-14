'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalProps {
  children: React.ReactNode
  container?: HTMLElement | null
  selector?: string
}

export function Portal({
  children,
  container,
  selector
}: PortalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  let targetContainer = container

  if (selector && !targetContainer) {
<<<<<<< HEAD
    targetContainer = document.querySelector(selector)
=======
    const element = document.querySelector(selector)
    // Verifica se é um HTMLElement
    if (element instanceof HTMLElement) {
      targetContainer = element
    }
>>>>>>> bdb1570aee94106fe89b815342989cef5cb183be
  }

  if (!targetContainer) {
    targetContainer = document.body
  }

  return createPortal(children, targetContainer)
}

// Portal para modais
Portal.Modal = function ModalPortal({ children }: { children: React.ReactNode }) {
  return <Portal selector="#modal-root">{children}</Portal>
}

// Portal para tooltips
Portal.Tooltip = function TooltipPortal({ children }: { children: React.ReactNode }) {
  return <Portal selector="#tooltip-root">{children}</Portal>
}

// Portal para notificações
Portal.Notification = function NotificationPortal({ children }: { children: React.ReactNode }) {
  return <Portal selector="#notification-root">{children}</Portal>
}

// Portal para dropdowns
Portal.Dropdown = function DropdownPortal({ children }: { children: React.ReactNode }) {
  return <Portal selector="#dropdown-root">{children}</Portal>
}

// Portal para context menus
Portal.ContextMenu = function ContextMenuPortal({ children }: { children: React.ReactNode }) {
  return <Portal selector="#context-menu-root">{children}</Portal>
}

// Componente para renderizar os containers dos portais
Portal.Root = function PortalRoot() {
  return (
    <>
      <div id="modal-root" />
      <div id="tooltip-root" />
      <div id="notification-root" />
      <div id="dropdown-root" />
      <div id="context-menu-root" />
    </>
  )
}