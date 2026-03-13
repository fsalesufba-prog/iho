import React from 'react'
import Image from 'next/image'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface UsuarioAvatarProps {
  nome: string
  avatar?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  onClick?: () => void
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl'
}

export function UsuarioAvatar({ 
  nome, 
  avatar, 
  size = 'md', 
  className,
  onClick 
}: UsuarioAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Avatar 
      className={cn(
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
    >
      <AvatarImage src={avatar} />
      <AvatarFallback>{getInitials(nome)}</AvatarFallback>
    </Avatar>
  )
}

// Grupo de avatares
UsuarioAvatar.Group = function AvatarGroup({ 
  usuarios,
  max = 3,
  size = 'md'
}: {
  usuarios: Array<{ nome: string; avatar?: string }>
  max?: number
  size?: 'sm' | 'md' | 'lg'
}) {
  const visibleUsers = usuarios.slice(0, max)
  const remaining = usuarios.length - max

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((usuario, index) => (
        <UsuarioAvatar
          key={index}
          nome={usuario.nome}
          avatar={usuario.avatar}
          size={size}
          className="border-2 border-background"
        />
      ))}
      {remaining > 0 && (
        <div className={cn(
          'flex items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium',
          sizeClasses[size]
        )}>
          +{remaining}
        </div>
      )}
    </div>
  )
}