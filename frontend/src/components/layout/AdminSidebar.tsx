'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  DollarSign,
  History,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  FileText,
  Mail,
  Shield,
  Database,
  Globe,
  Bell,
  HelpCircle
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { AdminSidebarItem } from './AdminSidebarItem'
import { useAuth } from '@/components/hooks/useAuth'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  collapsed: boolean
  onCollapse: () => void
  mobile?: boolean
  onClose?: () => void
}

const menuSections = [
  {
    title: 'Principal',
    items: [
      { href: '/admin-sistema/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/admin-sistema/empresas', icon: Building2, label: 'Empresas' },
      { href: '/admin-sistema/usuarios', icon: Users, label: 'Usuários' },
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { href: '/admin-sistema/planos', icon: CreditCard, label: 'Planos' },
      { href: '/admin-sistema/pagamentos', icon: DollarSign, label: 'Pagamentos' },
      { href: '/admin-sistema/relatorios', icon: BarChart3, label: 'Relatórios' },
    ]
  },
  {
    title: 'Conteúdo',
    items: [
      { href: '/admin-sistema/blog', icon: BookOpen, label: 'Blog' },
      { href: '/admin-sistema/paginas', icon: FileText, label: 'Páginas' },
      { href: '/admin-sistema/emails', icon: Mail, label: 'E-mails' },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { href: '/admin-sistema/logs', icon: History, label: 'Logs' },
      { href: '/admin-sistema/backup', icon: Database, label: 'Backup' },
      { href: '/admin-sistema/seguranca', icon: Shield, label: 'Segurança' },
      { href: '/admin-sistema/configuracoes', icon: Settings, label: 'Configurações' },
    ]
  }
]

export function AdminSidebar({ collapsed, onCollapse, mobile, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (mobile) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="fixed inset-y-0 left-0 w-64 bg-background border-r">
          <div className="flex h-16 items-center border-b px-4">
            <h2 className="font-bold text-xl">IHO Admin</h2>
          </div>

          <ScrollArea className="h-[calc(100vh-4rem)] py-4">
            {menuSections.map((section, idx) => (
              <div key={idx} className="mb-6">
                {!collapsed && (
                  <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
                <nav className="space-y-1 px-2">
                  {section.items.map((item) => (
                    <AdminSidebarItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      active={pathname === item.href || pathname.startsWith(item.href + '/')}
                      collapsed={false}
                      onClick={onClose}
                    />
                  ))}
                </nav>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="px-2">
              <button
                onClick={logout}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </button>
            </div>
          </ScrollArea>
        </div>
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-screen bg-background border-r transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed ? (
          <h2 className="font-bold text-xl">IHO Admin</h2>
        ) : (
          <h2 className="font-bold text-xl mx-auto">IHO</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onCollapse}
          className={cn('hidden md:flex', collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User info */}
      {!collapsed && user && (
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.nome}</p>
              <p className="text-xs text-muted-foreground truncate">Administrador</p>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="h-[calc(100vh-8rem)] py-4">
        {menuSections.map((section, idx) => (
          <div key={idx} className="mb-6">
            {!collapsed && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.title}
              </h3>
            )}
            <nav className="space-y-1 px-2">
              {section.items.map((item) => (
                <AdminSidebarItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  active={pathname === item.href || pathname.startsWith(item.href + '/')}
                  collapsed={collapsed}
                />
              ))}
            </nav>
          </div>
        ))}

        {!collapsed && (
          <>
            <Separator className="my-4" />
            <div className="px-2">
              <button
                onClick={logout}
                className="flex w-full items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sair
              </button>
            </div>
          </>
        )}
      </ScrollArea>
    </aside>
  )
}