'use client'

import React from 'react'
import { AuthProvider } from './AuthProvider'
import { ThemeProvider } from './ThemeProvider'
import { QueryProvider } from './QueryProvider'
import { ToastProvider } from './ToastProvider'
import { ModalProvider } from './ModalProvider'
import { ConfirmationProvider } from './ConfirmationProvider'
import { LoadingProvider } from './LoadingProvider'
import { SessionProvider } from './SessionProvider'
import { NotificationProvider } from './NotificationProvider'
import { ErrorBoundaryProvider } from './ErrorBoundaryProvider'

interface AppProviderProps {
  children: React.ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundaryProvider>
      <QueryProvider>
        <AuthProvider>
          <SessionProvider>
            <ThemeProvider>
              <ToastProvider>
                <ModalProvider>
                  <ConfirmationProvider>
                    <LoadingProvider>
                      <NotificationProvider>
                        {children}
                      </NotificationProvider>
                    </LoadingProvider>
                  </ConfirmationProvider>
                </ModalProvider>
              </ToastProvider>
            </ThemeProvider>
          </SessionProvider>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundaryProvider>
  )
}

// Provider para testes
AppProvider.Test = function TestProvider({ children }: AppProviderProps) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}

// Provider para storybook
AppProvider.Storybook = function StorybookProvider({ children }: AppProviderProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </ThemeProvider>
  )
}