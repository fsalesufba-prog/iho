
'use client'

import React, { Component, ErrorInfo, ReactNode, Suspense as ReactSuspense } from 'react'
import { LoadingSpinner } from './LoadingSpinner'

interface SuspenseProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}, ErrorBoundaryState> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Algo deu errado
          </h3>
          <p className="text-sm text-muted-foreground">
            {this.state.error?.message || 'Erro ao carregar o componente'}
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export function Suspense({
  children,
  fallback = <LoadingSpinner />,
  errorFallback,
  onError
}: SuspenseProps) {
  return (
    <ErrorBoundary fallback={errorFallback} onError={onError}>
      <ReactSuspense fallback={fallback}>
        {children}
      </ReactSuspense>
    </ErrorBoundary>
  )
}

// Suspense para lazy loading de componentes
Suspense.Lazy = function LazySuspense({
  component,
  props = {},
  ...suspenseProps
}: SuspenseProps & {
  component: React.LazyExoticComponent<any>
  props?: Record<string, any>
}) {
  const Component = component
  return (
    <Suspense {...suspenseProps}>
      <Component {...props} />
    </Suspense>
  )
}

// Suspense para carregamento de dados
Suspense.Data = function DataSuspense({
  data,
  children,
  loading = <LoadingSpinner />,
  error = null,
  ...props
}: SuspenseProps & {
  data: any
  loading?: ReactNode
  error?: ReactNode
}) {
  if (error) {
    return <>{error}</>
  }

  if (!data) {
    return <>{loading}</>
  }

  return <Suspense fallback={loading} {...props}>{children}</Suspense>
}