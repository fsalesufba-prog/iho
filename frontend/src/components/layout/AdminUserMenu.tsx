'use client'

import React from 'react'
import Link from 'next/link'
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  Key,
  Bell,
  Moon,
  Sun,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/components/theme/useTheme'
import { useAuth } from '@/components/hooks/useAuth'
import { cn } from '@/lib/utils'

interface AdminUserMenuProps {
  className?: string
}

export function AdminUserMenu({ className }: AdminUserMenuProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={cn('relative h-8 w-8 rounded-full', className)}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-medium">{user.nome}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <User className="h-4 w-4 mr-2" />
          <Link href="/admin-sistema/perfil">Meu Perfil</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Key className="h-4 w-4 mr-2" />
          <Link href="/admin-sistema/seguranca">Segurança</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Bell className="h-4 w-4 mr-2" />
          <Link href="/admin-sistema/notificacoes">Notificações</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 mr-2" />
          ) : (
            <Moon className="h-4 w-4 mr-2" />
          )}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          <Link href="/admin-sistema/configuracoes">Configurações</Link>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <HelpCircle className="h-4 w-4 mr-2" />
          <Link href="/admin-sistema/ajuda">Ajuda</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={logout} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}