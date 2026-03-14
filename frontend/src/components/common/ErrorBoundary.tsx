'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
  resetKeys?: any[]
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
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

  componentDidUpdate(prevProps: Props) {
    if (this.state.hasError) {
      if (this.props.resetKeys && prevProps.resetKeys !== this.props.resetKeys) {
        this.reset()
      }
    }
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            Algo deu errado
          </h3>
          
          <p className="text-sm text-muted-foreground max-w-md mb-4">
            {this.state.error?.message || 'Ocorreu um erro inesperado ao carregar esta página.'}
          </p>
          
          <Button onClick={this.reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

// Namespace para agrupar os subcomponentes
export namespace ErrorBoundary {
  export const Route: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ErrorBoundary
      fallback={
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Erro na rota
          </h3>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar esta página.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )

  export const Component: React.FC<{ children: ReactNode; name?: string }> = ({ 
    children,
    name 
  }) => (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-destructive/50 rounded-md bg-destructive/5">
          <p className="text-sm text-destructive">
            Erro ao carregar {name || 'componente'}
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )

  export const Form: React.FC<{ children: ReactNode }> = ({ children }) => (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-destructive/50 rounded-md bg-destructive/5">
          <p className="text-sm text-destructive mb-2">
            Erro no formulário
          </p>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            Recarregar formulário
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}