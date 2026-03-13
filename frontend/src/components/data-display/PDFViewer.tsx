'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Printer,
  Search,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

interface PDFViewerProps {
  url: string
  title?: string
  className?: string
  onDownload?: () => void
  onPrint?: () => void
}

// Nota: Para usar PDF.js, você precisaria instalar: npm install react-pdf
// Este é um componente simplificado que usa iframe para demonstração

export function PDFViewer({
  url,
  title,
  className,
  onDownload,
  onPrint
}: PDFViewerProps) {
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [scale, setScale] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Simular carregamento
    const timer = setTimeout(() => {
      setLoading(false)
      setTotalPages(10) // Mock
    }, 1500)

    return () => clearTimeout(timer)
  }, [url])

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    if (iframeRef.current) {
      iframeRef.current.style.transform = `rotate(${scale}deg)`
    }
  }

  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (iframeRef.current?.requestFullscreen) {
        iframeRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setFullscreen(!fullscreen)
  }

  const handleSearch = () => {
    if (searchText && iframeRef.current?.contentWindow) {
      // Implementar busca no PDF
      console.log('Buscar:', searchText)
    }
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="border-0 focus-visible:ring-0 h-8 w-40"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="ghost" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-16 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={handleRotate}>
            <RotateCw className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>

          {onDownload && (
            <Button variant="ghost" size="icon" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          )}

          {onPrint && (
            <Button variant="ghost" size="icon" onClick={onPrint}>
              <Printer className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-muted/20 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-4 w-full max-w-2xl p-8">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-96 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={`${url}#page=${page}&zoom=${scale * 100}`}
            className="w-full h-full"
            style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
            title={title || 'PDF Viewer'}
          />
        )}
      </div>
    </div>
  )
}

// Versão simples (apenas iframe)
PDFViewer.Simple = function SimplePDFViewer({
  url,
  title,
  className
}: PDFViewerProps) {
  return (
    <iframe
      src={url}
      className={cn('w-full h-full', className)}
      title={title || 'PDF Viewer'}
    />
  )
}

// Versão para download apenas
PDFViewer.Download = function DownloadPDF({
  url,
  filename,
  children
}: {
  url: string
  filename?: string
  children?: React.ReactNode
}) {
  const handleDownload = async () => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename || 'document.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Erro ao baixar PDF:', error)
    }
  }

  return (
    <Button onClick={handleDownload}>
      <Download className="h-4 w-4 mr-2" />
      {children || 'Baixar PDF'}
    </Button>
  )
}