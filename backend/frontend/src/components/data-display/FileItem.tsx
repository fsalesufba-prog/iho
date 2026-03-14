import React, { useState } from 'react'
import {
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  Download,
  Trash2,
  Eye,
  MoreHorizontal,
  Copy,
  Share2
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { cn } from '@/lib/utils'

interface FileItemProps {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadDate?: Date | string
  uploadedBy?: string
  progress?: number
  status?: 'uploading' | 'complete' | 'error'
  onDownload?: () => void
  onDelete?: () => void
  onPreview?: () => void
  onCopy?: () => void
  onShare?: () => void
  className?: string
  variant?: 'list' | 'grid' | 'compact'
}

const fileIcons = {
  // Documentos
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  rtf: FileText,
  
  // Planilhas
  xls: FileText,
  xlsx: FileText,
  csv: FileText,
  
  // Apresentações
  ppt: FileText,
  pptx: FileText,
  
  // Imagens
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  gif: FileImage,
  svg: FileImage,
  webp: FileImage,
  
  // Vídeos
  mp4: FileVideo,
  avi: FileVideo,
  mov: FileVideo,
  wmv: FileVideo,
  
  // Áudio
  mp3: FileAudio,
  wav: FileAudio,
  ogg: FileAudio,
  
  // Arquivos
  zip: FileArchive,
  rar: FileArchive,
  '7z': FileArchive,
  tar: FileArchive,
  gz: FileArchive,
}

const fileColors = {
  pdf: 'text-red-500',
  doc: 'text-blue-500',
  docx: 'text-blue-500',
  xls: 'text-green-500',
  xlsx: 'text-green-500',
  jpg: 'text-purple-500',
  jpeg: 'text-purple-500',
  png: 'text-purple-500',
  mp4: 'text-pink-500',
  mp3: 'text-yellow-500',
  zip: 'text-orange-500',
}

export function FileItem({
  id,
  name,
  size,
  type,
  url,
  uploadDate,
  uploadedBy,
  progress = 0,
  status = 'complete',
  onDownload,
  onDelete,
  onPreview,
  onCopy,
  onShare,
  className,
  variant = 'list'
}: FileItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const extension = name.split('.').pop()?.toLowerCase() || ''
  const FileIcon = fileIcons[extension as keyof typeof fileIcons] || File
  const iconColor = fileColors[extension as keyof typeof fileColors] || 'text-gray-500'

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return ''
    return format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  }

  if (variant === 'grid') {
    return (
      <div
        className={cn(
          'group relative border rounded-lg p-4 hover:shadow-md transition-all',
          status === 'uploading' && 'opacity-50',
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col items-center text-center">
          <div className={cn('h-12 w-12 mb-3', iconColor)}>
            <FileIcon className="h-12 w-12" />
          </div>

          <p className="text-sm font-medium truncate w-full mb-1">{name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(size)}</p>

          {uploadDate && (
            <p className="text-xs text-muted-foreground mt-2">
              {formatDate(uploadDate)}
            </p>
          )}
        </div>

        {/* Overlay de ações */}
        {isHovered && status === 'complete' && (
          <div className="absolute inset-0 bg-background/90 rounded-lg flex items-center justify-center gap-2">
            {onPreview && (
              <Button size="icon" variant="ghost" onClick={onPreview}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {onDownload && (
              <Button size="icon" variant="ghost" onClick={onDownload}>
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button size="icon" variant="ghost" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        )}

        {status === 'uploading' && (
          <div className="mt-2">
            <Progress value={progress} className="h-1" />
            <p className="text-xs text-center mt-1 text-muted-foreground">
              Enviando... {progress}%
            </p>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 py-2', className)}>
        <FileIcon className={cn('h-5 w-5', iconColor)} />
        <span className="text-sm flex-1 truncate">{name}</span>
        <span className="text-xs text-muted-foreground">{formatFileSize(size)}</span>
        {onDownload && (
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onDownload}>
            <Download className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  // Variante list (padrão)
  return (
    <div
      className={cn(
        'flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors',
        status === 'uploading' && 'opacity-50',
        className
      )}
    >
      <FileIcon className={cn('h-8 w-8', iconColor)} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{name}</p>
          {status === 'error' && (
            <span className="text-xs text-red-600">Erro no upload</span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatFileSize(size)}</span>
          {uploadDate && <span>• {formatDate(uploadDate)}</span>}
          {uploadedBy && <span>• por {uploadedBy}</span>}
        </div>

        {status === 'uploading' && (
          <Progress value={progress} className="h-1 mt-2" />
        )}
      </div>

      <div className="flex items-center gap-1">
        {onPreview && (
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onPreview}>
            <Eye className="h-4 w-4" />
          </Button>
        )}
        {onDownload && (
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onCopy && (
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </DropdownMenuItem>
            )}
            {onShare && (
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}