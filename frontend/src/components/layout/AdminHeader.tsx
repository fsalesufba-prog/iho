'use client'

import React from 'react'
import Link from 'next/link'
import { Menu, Bell, Search, Settings, HelpCircle, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { AdminNotificationCenter } from './AdminNotificationCenter'
import { AdminUserMenu } from './AdminUserMenu'
import { useAuth } from '@/components/hooks/useAuth'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  onMenuClick?: () => void
  showSearch?: boolean
  showNotifications?: boolean
  showUserMenu?: boolean
  showThemeToggle?: boolean
  showHelp?: boolean
  className?: string
}

export function AdminHeader({
  onMenuClick,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
  showThemeToggle = true,
  showHelp = true,
  className
}: AdminHeaderProps) {
  const { user } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className={cn(
      'sticky top-0 z-40 border-b bg-background/95 backdrop-blur',
      className
    )}>
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Link href="/admin-sistema/dashboard" className="font-bold text-xl hidden md:block">
            IHO Admin
          </Link>
        </div>

        {/* Center - Search */}
        {showSearch && (
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar..."
                className="w-full pl-8"
              />
            </div>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {showHelp && (
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          )}

          {showThemeToggle && <ThemeToggle />}

          {showNotifications && <AdminNotificationCenter />}

          {showUserMenu && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Ajuda
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}