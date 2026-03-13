'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  FolderTree,
  Calculator,
  Truck,
  Wrench,
  Package,
  BarChart3,
  DollarSign,
  FileText,
  TrendingUp,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ScrollArea } from '@/components/ui/ScrollArea'
import { Separator } from '@/components/ui/Separator'
import { useAuth } from '@/components/hooks/useAuth'
import { cn } from '@/lib/utils'

interface SidebarItemProps {
  href: string
  icon: React.ElementType
  label: string
  active?: boolean
  collapsed?: boolean
}

function SidebarItem({ href, icon: Icon, label, active, collapsed }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
        collapsed ? 'justify-center' : 'justify-start',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
    </Link>
  )
}

interface SidebarProps {
  className?: string
}

const navItems = [
  { href: '/app-empresa/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app-empresa/obras', icon: Building2, label: 'Obras' },
  { href: '/app-empresa/frentes-servico', icon: FolderTree, label: 'Frentes de Serviço' },
  { href: '/app-empresa/centros-custo', icon: Calculator, label: 'Centros de Custo' },
  { href: '/app-empresa/equipamentos', icon: Truck, label: 'Equipamentos' },
  { href: '/app-empresa/manutencao', icon: Wrench, label: 'Manutenção' },
  { href: '/app-empresa/almoxarifado', icon: Package, label: 'Almoxarifado' },
  { href: '/app-empresa/indicadores', icon: BarChart3, label: 'Indicadores' },
  { href: '/app-empresa/financeiro', icon: DollarSign, label: 'Financeiro' },
  { href: '/app-empresa/medicao', icon: FileText, label: 'Medição' },
  { href: '/app-empresa/previsao', icon: TrendingUp, label: 'Previsão' },
  { href: '/app-empresa/relatorios', icon: ClipboardList, label: 'Relatórios' },
  { href: '/app-empresa/alertas', icon: Bell, label: 'Alertas' },
  { href: '/app-empresa/usuarios', icon: Users, label: 'Usuários' },
  { href: '/app-empresa/configuracoes', icon: Settings, label: 'Configurações' },
]

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 h-screen bg-background border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-14 items-center border-b px-3">
        {!collapsed && (
          <Link href="/app-empresa/dashboard" className="flex items-center gap-2 font-bold text-primary text-sm">
            IHO
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn('ml-auto h-8 w-8', collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-3.5rem)] py-3">
        <nav className="space-y-0.5 px-2">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href || pathname?.startsWith(item.href + '/')}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <Separator className="my-3" />

        <div className="px-2">
          <button
            onClick={logout}
            className={cn(
              'flex w-full items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
              collapsed && 'justify-center'
            )}
          >
            <LogOut className={cn('h-5 w-5 shrink-0', !collapsed && 'mr-3')} />
            {!collapsed && 'Sair'}
          </button>
        </div>
      </ScrollArea>
    </aside>
  )
}
