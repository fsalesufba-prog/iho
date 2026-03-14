'use client'

import React, { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button, ButtonProps } from '@/components/ui/Button'
import { useToast } from '@/components/hooks/useToast'

interface DownloadButtonProps extends ButtonProps {
  url?: string
  filename?: string
  onDownload?: () => Promise<void> | void
}

export function DownloadButton({
  url,
  filename,
  onDownload,
  children = 'Download',
  ...props
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownload = async () => {
    try {
      setIsDownloading(true)

      if (onDownload) {
        await onDownload()
      } else if (url) {
        const response = await fetch(url)
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename || 'download'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
      }

      toast({
        title: 'Sucesso',
        description: 'Download iniciado'
      })
    } catch (error) {
      console.error('Erro ao fazer download:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível fazer o download',
        variant: 'destructive'
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button onClick={handleDownload} disabled={isDownloading} {...props}>
      {isDownloading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Baixando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  )
}