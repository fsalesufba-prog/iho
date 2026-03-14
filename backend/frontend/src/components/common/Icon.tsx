import React from 'react'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

export type IconName = keyof typeof LucideIcons

interface IconProps {
  name: IconName
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: string
  strokeWidth?: number
  onClick?: () => void
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
}

export function Icon({
  name,
  size = 'md',
  className,
  color,
  strokeWidth = 2,
  onClick
}: IconProps) {
  const IconComponent = LucideIcons[name] as React.ElementType

  if (!IconComponent) {
    console.warn(`Ícone "${name}" não encontrado`)
    return null
  }

  return (
    <IconComponent
      size={sizeMap[size]}
      strokeWidth={strokeWidth}
      className={cn(
        'inline-flex',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      style={{ color }}
      onClick={onClick}
    />
  )
}

// Componente para ícones de arquivo
Icon.FileIcon = function FileIcon({ type, className }: { type: string; className?: string }) {
  const getIcon = () => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <LucideIcons.FileText className={cn('text-red-500', className)} />
      case 'doc':
      case 'docx':
        return <LucideIcons.FileText className={cn('text-blue-500', className)} />
      case 'xls':
      case 'xlsx':
        return <LucideIcons.FileSpreadsheet className={cn('text-green-500', className)} />
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <LucideIcons.FileImage className={cn('text-purple-500', className)} />
      case 'mp4':
      case 'avi':
      case 'mov':
        return <LucideIcons.FileVideo className={cn('text-pink-500', className)} />
      case 'mp3':
      case 'wav':
        return <LucideIcons.FileAudio className={cn('text-yellow-500', className)} />
      case 'zip':
      case 'rar':
      case '7z':
        return <LucideIcons.FileArchive className={cn('text-orange-500', className)} />
      default:
        return <LucideIcons.File className={className} />
    }
  }

  return getIcon()
}

// Componente para ícones de status
Icon.Status = function StatusIcon({ 
  status, 
  className 
}: { 
  status: 'success' | 'warning' | 'error' | 'info' | 'pending'
  className?: string 
}) {
  const config = {
    success: { icon: LucideIcons.CheckCircle, color: 'text-green-500' },
    warning: { icon: LucideIcons.AlertTriangle, color: 'text-yellow-500' },
    error: { icon: LucideIcons.XCircle, color: 'text-red-500' },
    info: { icon: LucideIcons.Info, color: 'text-blue-500' },
    pending: { icon: LucideIcons.Clock, color: 'text-gray-500' }
  }

  const { icon: IconComponent, color } = config[status]

  return <IconComponent className={cn(color, className)} />
}

// Componente para ícones de mídia social
Icon.Social = function SocialIcon({ 
  platform, 
  className 
}: { 
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'github' | 'whatsapp'
  className?: string 
}) {
  const icons = {
    facebook: LucideIcons.Facebook,
    twitter: LucideIcons.Twitter,
    instagram: LucideIcons.Instagram,
    linkedin: LucideIcons.Linkedin,
    youtube: LucideIcons.Youtube,
    github: LucideIcons.Github,
    whatsapp: LucideIcons.MessageCircle
  }

  const colors = {
    facebook: 'text-[#1877f2]',
    twitter: 'text-[#1da1f2]',
    instagram: 'text-[#e4405f]',
    linkedin: 'text-[#0a66c2]',
    youtube: 'text-[#ff0000]',
    github: 'text-[#333]',
    whatsapp: 'text-[#25d366]'
  }

  const IconComponent = icons[platform]

  return <IconComponent className={cn(colors[platform], className)} />
}